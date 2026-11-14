/**
 * PART B - COMPUTER NETWORKS AND ROUTING ENGINE
 *
 * Implements deterministic routing key extraction, zone resolution, handler dispatch,
 * capacity checks, backup fallback, priority queues, and escalation handling.
 */

import { Handler } from '../models/Handler.js';
import { RoutingRule } from '../models/RoutingRule.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const ZONE_CONFIGURATIONS = {
  KA01: {
    zone: 'Zone 1',
    zoneName: 'Central Business District (CBD - MG Road / Brigade Road)',
    depot: 'CBD Central Depot #1',
    branch: 'Bengaluru Central Enforcement Division'
  },
  KA02: {
    zone: 'Zone 2',
    zoneName: 'Bengaluru West (Rajajinagar / Malleshwaram)',
    depot: 'West Zone Depot #2',
    branch: 'Bengaluru West Enforcement Division'
  },
  KA03: {
    zone: 'Zone 3',
    zoneName: 'Bengaluru East (Indiranagar / Whitefield Tech Corridor)',
    depot: 'East Zone Tech Depot #3',
    branch: 'Bengaluru East Enforcement Division'
  },
  KA04: {
    zone: 'Zone 4',
    zoneName: 'Bengaluru North (Yeshwanthpur / Hebbal Ring Road)',
    depot: 'North Zone Transit Depot #4',
    branch: 'Bengaluru North Enforcement Division'
  },
  KA05: {
    zone: 'Zone 5',
    zoneName: 'Bengaluru South (Jayanagar / Koramangala / BTM)',
    depot: 'South Zone Civic Depot #5',
    branch: 'Bengaluru South Enforcement Division'
  },
  KA06: {
    zone: 'Zone 6',
    zoneName: 'Outer Suburbs (Electronics City / Sarjapur Expressway)',
    depot: 'Suburban Expressway Depot #6',
    branch: 'Bengaluru Suburban Enforcement Division'
  }
};

/**
 * Priority weighting for deterministic queue sorting
 */
export const PRIORITY_WEIGHTS = {
  Critical: 3,
  High: 2,
  Normal: 1
};

/**
 * Extracts routing key (first 4 characters)
 * @param {string} vehicleNumber
 * @returns {string} 4-character routing key (e.g. "KA01")
 */
export function extractRoutingKey(vehicleNumber) {
  if (!vehicleNumber || typeof vehicleNumber !== 'string') return '';
  return vehicleNumber.trim().toUpperCase().substring(0, 4);
}

/**
 * Dispatches a violation report deterministically through the routing matrix.
 *
 * Steps:
 * 1. Validate vehicle number length & routing key
 * 2. Lookup zone mapping
 * 3. Lookup routing rule & assigned handlers
 * 4. Check primary handler availability & capacity
 * 5. If unavailable/full, check backup handlers
 * 6. If all handlers full/unavailable, escalate to FALLBACK_CENTRAL
 * 7. Prevent duplicate assignments
 *
 * @param {object} reportData - Report fields including vehicleNumber, urgency, priority, reportId
 * @returns {Promise<object>} Routing decision object
 */
export async function dispatchReport(reportData) {
  const { vehicleNumber, urgency, reportId, reporterName } = reportData;
  const effectivePriority = urgency || 'Normal';
  const routingKey = extractRoutingKey(vehicleNumber);

  const decision = {
    reportId,
    routingKey,
    zone: 'Unknown Zone',
    zoneName: 'Central Regional Enforcement Authority',
    handlerId: 'FALLBACK_CENTRAL',
    handlerName: 'Central Enforcement Dispatch Authority',
    status: 'Pending',
    routingDecision: '',
    escalationReason: null,
    isBackupAssigned: false,
    dispatchedToFallback: false,
    timestamp: new Date()
  };

  // Step 1 & 2: Check if routing key is recognized
  const zoneInfo = ZONE_CONFIGURATIONS[routingKey];
  if (!zoneInfo) {
    decision.status = 'Escalated';
    decision.routingDecision = `Routing Key '${routingKey}' not found in the 6 designated enforcement zones (KA01-KA06). Routed to Central Fallback Queue for manual territorial assessment.`;
    decision.escalationReason = `UNKNOWN_ROUTING_ZONE: '${routingKey}' does not match any configured enforcement depot.`;
    decision.dispatchedToFallback = true;
    return decision;
  }

  decision.zone = zoneInfo.zone;
  decision.zoneName = zoneInfo.zoneName;

  // Step 3: Lookup routing rule for this zone
  let rule = await RoutingRule.findOne({ routingKey });
  if (!rule) {
    // Fallback: lookup by zone
    rule = await RoutingRule.findOne({ zone: zoneInfo.zone });
  }

  // Find all handlers in this zone
  const handlersInZone = await Handler.find({ zone: zoneInfo.zone });

  if (!handlersInZone || handlersInZone.length === 0) {
    decision.status = 'Escalated';
    decision.routingDecision = `No active handlers provisioned in ${zoneInfo.zone} (${zoneInfo.zoneName}). Escalated immediately to Central Authority.`;
    decision.escalationReason = `NO_HANDLERS_PROVISIONED_IN_ZONE: ${zoneInfo.zone}`;
    decision.dispatchedToFallback = true;
    return decision;
  }

  // Step 4: Locate primary handler
  let primaryHandler = null;
  if (rule && rule.primaryHandler) {
    primaryHandler = handlersInZone.find((h) => h.handlerId === rule.primaryHandler);
  }
  if (!primaryHandler) {
    // Pick the designated non-backup handler with highest available capacity
    primaryHandler = handlersInZone.filter((h) => !h.isBackup).sort((a, b) => b.availableCapacity - a.availableCapacity)[0];
  }

  // Check Primary Handler Eligibility
  if (primaryHandler && primaryHandler.availability && primaryHandler.currentWorkload < primaryHandler.maximumCapacity) {
    // Primary Handler Eligible!
    decision.handlerId = primaryHandler.handlerId;
    decision.handlerName = primaryHandler.name;
    decision.status = 'Assigned';
    decision.routingDecision = `Successfully dispatched to Primary Handler ${primaryHandler.name} (${primaryHandler.handlerId}) at ${zoneInfo.zone}. Workload: ${primaryHandler.currentWorkload + 1}/${primaryHandler.maximumCapacity}.`;

    // Increment primary handler workload atomically
    await Handler.findByIdAndUpdate(primaryHandler._id, { $inc: { currentWorkload: 1 } });
    return decision;
  }

  // If primary handler unavailable or capacity exceeded, record reason
  let primaryFailReason = 'Unavailable';
  if (primaryHandler) {
    if (!primaryHandler.availability) {
      primaryFailReason = `Primary Handler ${primaryHandler.name} is currently marked UNAVAILABLE/OFF-DUTY`;
    } else if (primaryHandler.currentWorkload >= primaryHandler.maximumCapacity) {
      primaryFailReason = `Primary Handler ${primaryHandler.name} capacity exceeded (${primaryHandler.currentWorkload}/${primaryHandler.maximumCapacity} active cases)`;
    }
  }

  // Step 5: Check Backup Handlers
  let eligibleBackup = null;

  // First check backups specified in routing rule
  if (rule && rule.backupHandlers && rule.backupHandlers.length > 0) {
    for (const bId of rule.backupHandlers) {
      const bh = handlersInZone.find((h) => h.handlerId === bId);
      if (bh && bh.availability && bh.currentWorkload < bh.maximumCapacity) {
        eligibleBackup = bh;
        break;
      }
    }
  }

  // If not found in rule, check any available handler in zone with remaining capacity
  if (!eligibleBackup) {
    eligibleBackup = handlersInZone
      .filter((h) => h.availability && h.currentWorkload < h.maximumCapacity)
      .sort((a, b) => (a.isBackup === b.isBackup ? b.availableCapacity - a.availableCapacity : a.isBackup ? -1 : 1))[0];
  }

  if (eligibleBackup) {
    decision.handlerId = eligibleBackup.handlerId;
    decision.handlerName = eligibleBackup.name;
    decision.status = 'Assigned';
    decision.isBackupAssigned = true;
    decision.routingDecision = `Primary handler bypassed (${primaryFailReason}). Report dynamically rerouted to eligible Backup Handler ${eligibleBackup.name} (${eligibleBackup.handlerId}) at ${zoneInfo.zone}. Workload: ${eligibleBackup.currentWorkload + 1}/${eligibleBackup.maximumCapacity}.`;
    decision.escalationReason = `PRIMARY_HANDLER_OVERLOAD_OR_OFFLINE: ${primaryFailReason}`;

    // Increment backup handler workload
    await Handler.findByIdAndUpdate(eligibleBackup._id, { $inc: { currentWorkload: 1 } });
    return decision;
  }

  // Step 6: No handlers available in Zone! Check priority for central escalation
  decision.status = 'Escalated';
  decision.dispatchedToFallback = true;
  decision.handlerId = 'FALLBACK_CENTRAL';
  decision.handlerName = 'Central Enforcement Authority Fallback Queue';
  decision.routingDecision = `All handlers in ${zoneInfo.zone} are either offline or at 100% maximum capacity. ${primaryFailReason}. Report enqueued into Central Fallback Queue with priority '${effectivePriority}'.`;
  decision.escalationReason = `ZONE_CAPACITY_EXHAUSTED: All handlers in ${zoneInfo.zone} are unavailable or overloaded.`;

  return decision;
}

/**
 * Deterministic comparator for Priority Queue ordering:
 * 1. Urgency: Critical (3) > High (2) > Normal (1)
 * 2. Submission timestamp: Earliest first (FIFO)
 */
export function compareReportsPriority(reportA, reportB) {
  const weightA = PRIORITY_WEIGHTS[reportA.priority || reportA.urgency] || 1;
  const weightB = PRIORITY_WEIGHTS[reportB.priority || reportB.urgency] || 1;

  if (weightA !== weightB) {
    // Higher priority first
    return weightB - weightA;
  }

  // Tie-breaker: FIFO by submissionTimestamp
  const timeA = new Date(reportA.submissionTimestamp).getTime();
  const timeB = new Date(reportB.submissionTimestamp).getTime();
  return timeA - timeB;
}
