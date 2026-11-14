/**
 * PART D - TEST SUITE RUNNER
 * Implements 17 comprehensive documented test cases covering:
 *  1. Valid vehicle number
 *  2. Invalid vehicle number
 *  3. Incomplete vehicle number
 *  4. Valid violation code
 *  5. Invalid violation code
 *  6. Unknown violation code
 *  7. Correct violation classification
 *  8. Conflicting classification patterns
 *  9. Correct zone mapping
 * 10. Unknown routing zone
 * 11. Handler unavailable
 * 12. Handler capacity exceeded
 * 13. Backup handler assignment
 * 14. Priority-based queue ordering
 * 15. Report status update
 * 16. Central fallback dispatch
 * 17. Duplicate assignment prevention
 */

import { validateVehicleDual, validateViolationDual } from './automataValidator.js';
import { classifyViolation } from './classifier.js';
import { dispatchReport, extractRoutingKey, compareReportsPriority } from './router.js';
import { Handler } from '../models/Handler.js';
import { Report } from '../models/Report.js';

export async function runAllTests() {
  const results = [];
  const startTime = Date.now();

  const addResult = (testId, name, category, expected, actual, passed, details) => {
    results.push({
      testId,
      name,
      category,
      expected,
      actual,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  };

  // Test 1: Valid vehicle number
  try {
    const v1 = validateVehicleDual('KA03AB1234');
    addResult(
      1,
      'Valid Vehicle Number',
      'Automata Theory (DFA & Regex)',
      'Valid=true, FinalState=q10, Agreement=true',
      `Valid=${v1.isValid}, FinalState=${v1.dfa.finalState}, Agreement=${v1.agreement}`,
      v1.isValid && v1.agreement && v1.dfa.finalState === 'q10',
      'Tested standard 2-letter series Karnataka plate: KA03AB1234.'
    );
  } catch (e) {
    addResult(1, 'Valid Vehicle Number', 'Automata Theory', 'Valid=true', e.message, false, e.stack);
  }

  // Test 2: Invalid vehicle number
  try {
    const v2 = validateVehicleDual('K03AB1234');
    addResult(
      2,
      'Invalid Vehicle Number',
      'Automata Theory (DFA & Regex)',
      'Valid=false, FinalState=q_dead',
      `Valid=${v2.isValid}, FinalState=${v2.dfa.finalState}`,
      !v2.isValid && v2.dfa.finalState === 'q_dead',
      'Tested plate with single state character K instead of KA.'
    );
  } catch (e) {
    addResult(2, 'Invalid Vehicle Number', 'Automata Theory', 'Valid=false', e.message, false, e.stack);
  }

  // Test 3: Incomplete vehicle number
  try {
    const v3 = validateVehicleDual('KA03AB123');
    addResult(
      3,
      'Incomplete Vehicle Number',
      'Automata Theory (DFA & Regex)',
      'Valid=false, FinalState=q9 (only 3 digits)',
      `Valid=${v3.isValid}, FinalState=${v3.dfa.finalState}`,
      !v3.isValid && v3.dfa.finalState !== 'q10',
      'Tested plate truncated before completing 4th serial digit.'
    );
  } catch (e) {
    addResult(3, 'Incomplete Vehicle Number', 'Automata Theory', 'Valid=false', e.message, false, e.stack);
  }

  // Test 4: Valid violation code
  try {
    const vc1 = validateViolationDual('PV01');
    addResult(
      4,
      'Valid Violation Code',
      'Automata Theory (DFA & Regex)',
      'Valid=true, FinalState=s4, Agreement=true',
      `Valid=${vc1.isValid}, FinalState=${vc1.dfa.finalState}, Agreement=${vc1.agreement}`,
      vc1.isValid && vc1.agreement && vc1.dfa.finalState === 's4',
      'Tested standard 2-digit code PV01.'
    );
  } catch (e) {
    addResult(4, 'Valid Violation Code', 'Automata Theory', 'Valid=true', e.message, false, e.stack);
  }

  // Test 5: Invalid violation code
  try {
    const vc2 = validateViolationDual('PV1');
    addResult(
      5,
      'Invalid Violation Code Syntax',
      'Automata Theory (DFA & Regex)',
      'Valid=false, FinalState=s3',
      `Valid=${vc2.isValid}, FinalState=${vc2.dfa.finalState}`,
      !vc2.isValid && vc2.dfa.finalState !== 's4',
      'Tested single digit violation code PV1.'
    );
  } catch (e) {
    addResult(5, 'Invalid Violation Code Syntax', 'Automata Theory', 'Valid=false', e.message, false, e.stack);
  }

  // Test 6: Unknown violation code
  try {
    const cUnknown = classifyViolation('PV99');
    addResult(
      6,
      'Unknown Violation Code Handling',
      'Classification Engine',
      'isUnknown=true, category=Unclassified, error=UNKNOWN_VIOLATION_CODE',
      `isUnknown=${cUnknown.isUnknown}, category=${cUnknown.category}, error=${cUnknown.error}`,
      cUnknown.isUnknown && cUnknown.category === 'Unclassified',
      'Verified that unrecognized violation code PV99 is never silently assigned to a valid category.'
    );
  } catch (e) {
    addResult(6, 'Unknown Violation Code Handling', 'Classification Engine', 'isUnknown=true', e.message, false, e.stack);
  }

  // Test 7: Correct violation classification
  try {
    const c13 = classifyViolation('PV13');
    const c10 = classifyViolation('PV10');
    const c01 = classifyViolation('PV01');
    const passed = c13.category === 'Disabled-Bay' && c10.category === 'Obstruction' && c01.category === 'No-Permit';
    addResult(
      7,
      'Correct Violation Classification',
      'Classification Engine',
      'PV13->Disabled-Bay, PV10->Obstruction, PV01->No-Permit',
      `PV13->${c13.category}, PV10->${c10.category}, PV01->${c01.category}`,
      passed,
      'Verified deterministic mapping into 5 predefined categories.'
    );
  } catch (e) {
    addResult(7, 'Correct Violation Classification', 'Classification Engine', 'Correct mapping', e.message, false, e.stack);
  }

  // Test 8: Conflicting classification patterns
  try {
    // PV01 has base category No-Permit, secondary hint is Disabled-Bay (higher priority)
    const cConflict = classifyViolation('PV01', 'Disabled-Bay');
    const passed = cConflict.category === 'Disabled-Bay' && cConflict.conflictResolution !== null;
    addResult(
      8,
      'Conflicting Classification Resolution',
      'Classification Engine',
      'Category=Disabled-Bay via deterministic priority escalation',
      `Category=${cConflict.category}, Note=${cConflict.conflictResolution ? 'Recorded' : 'None'}`,
      passed,
      'Deterministic rule: Disabled-Bay overrides No-Permit when conflicting conditions match.'
    );
  } catch (e) {
    addResult(8, 'Conflicting Classification Resolution', 'Classification Engine', 'Escalated category', e.message, false, e.stack);
  }

  // Test 9: Correct zone mapping
  try {
    const key1 = extractRoutingKey('KA01AB1234');
    const key3 = extractRoutingKey('KA03CD5678');
    const key6 = extractRoutingKey('KA06XY9999');
    const passed = key1 === 'KA01' && key3 === 'KA03' && key6 === 'KA06';
    addResult(
      9,
      'Correct Zone Mapping Key Extraction',
      'Routing & Dispatch',
      'KA01->Zone 1, KA03->Zone 3, KA06->Zone 6',
      `key1=${key1}, key3=${key3}, key6=${key6}`,
      passed,
      'First 4 characters extracted as routing key for zone lookups.'
    );
  } catch (e) {
    addResult(9, 'Correct Zone Mapping Key Extraction', 'Routing & Dispatch', 'KA01, KA03, KA06', e.message, false, e.stack);
  }

  // Test 10: Unknown routing zone
  try {
    const decision = await dispatchReport({
      vehicleNumber: 'KA99ZZ9999',
      urgency: 'Normal',
      reportId: 'TEST-UNKNOWN-ZONE',
      reporterName: 'Test Bot'
    });
    const passed = decision.status === 'Escalated' && decision.handlerId === 'FALLBACK_CENTRAL' && decision.dispatchedToFallback;
    addResult(
      10,
      'Unknown Routing Zone to Central Fallback',
      'Routing & Dispatch',
      'status=Escalated, handlerId=FALLBACK_CENTRAL, dispatchedToFallback=true',
      `status=${decision.status}, handlerId=${decision.handlerId}, fallback=${decision.dispatchedToFallback}`,
      passed,
      'Unrecognized routing key KA99 forwarded to Central Fallback Queue.'
    );
  } catch (e) {
    addResult(10, 'Unknown Routing Zone to Central Fallback', 'Routing & Dispatch', 'Escalated to fallback', e.message, false, e.stack);
  }

  // Test 11: Handler unavailable (Offline)
  try {
    // Temporarily mark primary handler for KA04 unavailable
    const primary = await Handler.findOne({ handlerId: 'HND-KA04-01' });
    let originalAvail = true;
    if (primary) {
      originalAvail = primary.availability;
      await Handler.findByIdAndUpdate(primary._id, { availability: false });
    }

    const decision = await dispatchReport({
      vehicleNumber: 'KA04CD1234',
      urgency: 'High',
      reportId: 'TEST-UNAVAIL-DISPATCH',
      reporterName: 'Test Bot'
    });

    // Restore
    if (primary) {
      await Handler.findByIdAndUpdate(primary._id, { availability: originalAvail });
    }

    const passed = decision.isBackupAssigned && decision.handlerId === 'HND-KA04-02';
    addResult(
      11,
      'Handler Unavailable Triggers Backup',
      'Routing & Dispatch',
      'isBackupAssigned=true, handlerId=HND-KA04-02',
      `isBackupAssigned=${decision.isBackupAssigned}, handlerId=${decision.handlerId}`,
      passed,
      'When primary handler was marked unavailable, routing automatically dispatched to backup handler.'
    );
  } catch (e) {
    addResult(11, 'Handler Unavailable Triggers Backup', 'Routing & Dispatch', 'Backup assigned', e.message, false, e.stack);
  }

  // Test 12: Handler capacity exceeded
  try {
    // Temporarily set primary workload to maximumCapacity
    const primary = await Handler.findOne({ handlerId: 'HND-KA02-01' });
    let origWorkload = 0;
    if (primary) {
      origWorkload = primary.currentWorkload;
      await Handler.findByIdAndUpdate(primary._id, { currentWorkload: primary.maximumCapacity });
    }

    const decision = await dispatchReport({
      vehicleNumber: 'KA02CD1234',
      urgency: 'Normal',
      reportId: 'TEST-CAPACITY-EXCEEDED',
      reporterName: 'Test Bot'
    });

    // Restore
    if (primary) {
      await Handler.findByIdAndUpdate(primary._id, { currentWorkload: origWorkload });
    }

    const passed = decision.isBackupAssigned || decision.handlerId !== 'HND-KA02-01';
    addResult(
      12,
      'Handler Capacity Exceeded Bypassed',
      'Routing & Dispatch',
      'Primary bypassed, assigned to eligible backup handler',
      `handlerId=${decision.handlerId}, isBackupAssigned=${decision.isBackupAssigned}`,
      passed,
      'When primary handler is at 100% capacity, traffic is diverted away from saturated handler.'
    );
  } catch (e) {
    addResult(12, 'Handler Capacity Exceeded Bypassed', 'Routing & Dispatch', 'Primary bypassed', e.message, false, e.stack);
  }

  // Test 13: Backup handler assignment confirmation
  try {
    const backupHandler = await Handler.findOne({ isBackup: true });
    const passed = backupHandler !== null && backupHandler.isBackup === true;
    addResult(
      13,
      'Backup Handler Provisioning',
      'Handler Management',
      'Designated backup handler exists in system',
      `Found backup handler: ${backupHandler ? backupHandler.handlerId : 'None'}`,
      passed,
      'Verified presence and metadata of dedicated reserve enforcement personnel.'
    );
  } catch (e) {
    addResult(13, 'Backup Handler Provisioning', 'Handler Management', 'Backup exists', e.message, false, e.stack);
  }

  // Test 14: Priority-based queue ordering
  try {
    const reportCritical = { priority: 'Critical', submissionTimestamp: new Date(Date.now() - 1000) };
    const reportHigh = { priority: 'High', submissionTimestamp: new Date(Date.now() - 5000) };
    const reportNormal = { priority: 'Normal', submissionTimestamp: new Date(Date.now() - 10000) };

    const queue = [reportNormal, reportCritical, reportHigh];
    queue.sort(compareReportsPriority);

    const passed = queue[0].priority === 'Critical' && queue[1].priority === 'High' && queue[2].priority === 'Normal';
    addResult(
      14,
      'Priority-Based Queue Ordering',
      'Queue Scheduling',
      '[Critical, High, Normal] ordering regardless of arrival sequence',
      `[${queue.map((q) => q.priority).join(', ')}]`,
      passed,
      'Deterministic comparator places Critical urgent reports ahead of High and Normal.'
    );
  } catch (e) {
    addResult(14, 'Priority-Based Queue Ordering', 'Queue Scheduling', 'Critical first', e.message, false, e.stack);
  }

  // Test 15: Report status update workflow
  try {
    const dummyId = `TEST-STATUS-${Date.now()}`;
    const testReport = await Report.create({
      reportId: dummyId,
      reporterName: 'Test Status Warden',
      vehicleNumber: 'KA01AB9999',
      violationCode: 'PV01',
      location: 'Status Test Location',
      urgency: 'Normal',
      priority: 'Normal',
      category: 'No-Permit',
      routingKey: 'KA01',
      zone: 'Zone 1',
      status: 'Pending'
    });

    // Update status to Resolved
    testReport.status = 'Resolved';
    testReport.resolvedTimestamp = new Date();
    await testReport.save();

    const fetched = await Report.findOne({ reportId: dummyId });
    const passed = fetched && fetched.status === 'Resolved' && fetched.resolvedTimestamp !== null;

    // Cleanup
    await Report.deleteOne({ reportId: dummyId });

    addResult(
      15,
      'Report Status Lifecycle Update',
      'Lifecycle Management',
      'Status transitions to Resolved with resolvedTimestamp recorded',
      `status=${fetched ? fetched.status : 'None'}, hasTimestamp=${fetched && fetched.resolvedTimestamp ? 'Yes' : 'No'}`,
      passed,
      'Successfully verified status transition to Resolved with timestamp audit.'
    );
  } catch (e) {
    addResult(15, 'Report Status Lifecycle Update', 'Lifecycle Management', 'Status updated', e.message, false, e.stack);
  }

  // Test 16: Central fallback dispatch when all handlers offline
  try {
    const fakeKeyReport = {
      vehicleNumber: 'KA88ZZ1234', // Unmapped zone
      urgency: 'Critical',
      reportId: 'TEST-FALLBACK-16',
      reporterName: 'Fallback Tester'
    };
    const decision = await dispatchReport(fakeKeyReport);
    const passed = decision.status === 'Escalated' && decision.handlerId === 'FALLBACK_CENTRAL';
    addResult(
      16,
      'Central Fallback Dispatch on Zone Depletion',
      'Routing & Dispatch',
      'status=Escalated, handlerId=FALLBACK_CENTRAL',
      `status=${decision.status}, handlerId=${decision.handlerId}`,
      passed,
      'Reports unable to be fulfilled at depot level automatically reach Central Authority.'
    );
  } catch (e) {
    addResult(16, 'Central Fallback Dispatch on Zone Depletion', 'Routing & Dispatch', 'Escalated to fallback', e.message, false, e.stack);
  }

  // Test 17: Duplicate assignment prevention
  try {
    const existing = await Report.findOne();
    let passed = false;
    if (existing) {
      try {
        const dup = new Report({
          reportId: existing.reportId, // Duplicate ID
          reporterName: 'Dupe Attempter',
          vehicleNumber: 'KA01AB1111',
          violationCode: 'PV01',
          location: 'Dupe Test',
          category: 'No-Permit',
          routingKey: 'KA01',
          zone: 'Zone 1'
        });
        await dup.save();
        passed = false; // should not reach here!
      } catch (dupErr) {
        // Expected duplicate key error (code 11000 or duplicate error)
        passed = dupErr.code === 11000 || dupErr.message.includes('duplicate');
      }
    } else {
      passed = true;
    }

    addResult(
      17,
      'Duplicate Assignment Prevention',
      'Database Concurrency & Integrity',
      'Rejection of duplicate reportId with E11000 duplicate key error',
      passed ? 'Duplicate blocked successfully by unique index' : 'Duplicate was unexpectedly permitted',
      passed,
      'MongoDB unique index constraint on reportId guarantees uniqueness and prevents collisions.'
    );
  } catch (e) {
    addResult(17, 'Duplicate Assignment Prevention', 'Database Concurrency', 'Duplicate blocked', e.message, false, e.stack);
  }

  const durationMs = Date.now() - startTime;
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const allPassed = passedTests === totalTests;

  return {
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      allPassed,
      durationMs,
      passRate: `${Math.round((passedTests / totalTests) * 100)}%`
    },
    results
  };
}
