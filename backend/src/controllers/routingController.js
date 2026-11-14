import { RoutingRule } from '../models/RoutingRule.js';
import { Handler } from '../models/Handler.js';
import { Report } from '../models/Report.js';
import {
  ZONE_CONFIGURATIONS,
  dispatchReport,
  extractRoutingKey,
  compareReportsPriority
} from '../utils/router.js';

/**
 * Get complete routing management matrix
 * GET /api/routing
 */
export async function getRoutingMatrix(req, res) {
  try {
    const rules = await RoutingRule.find();
    const handlers = await Handler.find().sort({ zone: 1, isBackup: 1 });

    // Build zone mapping table with assigned handlers and workload
    const zonesWithHandlers = Object.entries(ZONE_CONFIGURATIONS).map(([key, info]) => {
      const zoneHandlers = handlers.filter((h) => h.zone === info.zone);
      const rule = rules.find((r) => r.routingKey === key) || null;

      const primary = zoneHandlers.find((h) => rule && h.handlerId === rule.primaryHandler) ||
        zoneHandlers.find((h) => !h.isBackup) || null;

      const backups = zoneHandlers.filter((h) => h.isBackup || (primary && h.handlerId !== primary.handlerId));

      const totalCapacity = zoneHandlers.reduce((acc, h) => acc + h.maximumCapacity, 0);
      const totalWorkload = zoneHandlers.reduce((acc, h) => acc + h.currentWorkload, 0);

      return {
        routingKey: key,
        zone: info.zone,
        zoneName: info.zoneName,
        branch: info.branch,
        depot: info.depot,
        primaryHandler: primary,
        backupHandlers: backups,
        totalHandlers: zoneHandlers.length,
        totalCapacity,
        totalWorkload,
        availableCapacity: Math.max(0, totalCapacity - totalWorkload),
        rule
      };
    });

    // Count fallback queue
    const fallbackCount = await Report.countDocuments({
      $or: [{ handlerId: 'FALLBACK_CENTRAL' }, { status: 'Escalated' }]
    });

    return res.json({
      success: true,
      data: {
        zones: zonesWithHandlers,
        handlers,
        rules,
        fallbackQueueCount: fallbackCount,
        zoneKeys: Object.keys(ZONE_CONFIGURATIONS)
      }
    });
  } catch (error) {
    console.error('[RoutingController] getRoutingMatrix error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Simulate or test dispatch without persisting
 * POST /api/routing/dispatch
 */
export async function simulateDispatch(req, res) {
  try {
    const { vehicleNumber, urgency = 'Normal', reporterName = 'Dispatcher Test' } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_VEHICLE',
        message: 'Vehicle registration number is required for dispatch simulation.'
      });
    }

    const routingKey = extractRoutingKey(vehicleNumber);
    const mockReportId = `SIM-${Date.now()}`;

    const decision = await dispatchReport({
      vehicleNumber,
      urgency,
      reportId: mockReportId,
      reporterName
    });

    return res.json({
      success: true,
      simulation: true,
      routingKey,
      decision
    });
  } catch (error) {
    console.error('[RoutingController] simulateDispatch error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Get deterministic priority queue and central fallback queue
 * GET /api/routing/queue
 */
export async function getRoutingQueues(req, res) {
  try {
    // 1. Central Fallback Queue: reports with FALLBACK_CENTRAL or Escalated status
    const fallbackReports = await Report.find({
      $or: [{ handlerId: 'FALLBACK_CENTRAL' }, { status: 'Escalated' }]
    });

    // 2. Pending / Active reports requiring dispatch or handler attention
    const pendingReports = await Report.find({
      status: { $in: ['Pending', 'Assigned', 'In Progress'] }
    });

    // Deterministic priority ordering: Critical > High > Normal, then timestamp FIFO
    fallbackReports.sort(compareReportsPriority);
    pendingReports.sort(compareReportsPriority);

    return res.json({
      success: true,
      fallbackQueue: {
        count: fallbackReports.length,
        reports: fallbackReports
      },
      activePriorityQueue: {
        count: pendingReports.length,
        reports: pendingReports
      }
    });
  } catch (error) {
    console.error('[RoutingController] getRoutingQueues error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}
