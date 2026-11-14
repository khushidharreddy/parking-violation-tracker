import { Handler } from '../models/Handler.js';
import { RoutingRule } from '../models/RoutingRule.js';
import { Report } from '../models/Report.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ZONE_CONFIGURATIONS } from '../utils/router.js';

export const INITIAL_HANDLERS = [
  // Zone 1 Handlers (KA01)
  {
    handlerId: 'HND-KA01-01',
    name: 'Inspector Rajesh Gowda',
    zone: 'Zone 1',
    team: 'Alpha Rapid Strike CBD',
    branch: 'Bengaluru Central Enforcement Division',
    depot: 'CBD Central Depot #1 (MG Road)',
    availability: true,
    maximumCapacity: 6,
    currentWorkload: 2,
    isBackup: false,
    contactNumber: '+91-98450-10001'
  },
  {
    handlerId: 'HND-KA01-02',
    name: 'Warden Sneha Hegde (Backup)',
    zone: 'Zone 1',
    team: 'Alpha Auxiliary CBD',
    branch: 'Bengaluru Central Enforcement Division',
    depot: 'CBD Central Depot #1 (Brigade Road Sub-station)',
    availability: true,
    maximumCapacity: 5,
    currentWorkload: 1,
    isBackup: true,
    contactNumber: '+91-98450-10002'
  },

  // Zone 2 Handlers (KA02)
  {
    handlerId: 'HND-KA02-01',
    name: 'Officer Manjunath Patil',
    zone: 'Zone 2',
    team: 'Bravo West Wardens',
    branch: 'Bengaluru West Enforcement Division',
    depot: 'West Zone Depot #2 (Rajajinagar)',
    availability: true,
    maximumCapacity: 5,
    currentWorkload: 2,
    isBackup: false,
    contactNumber: '+91-98450-20001'
  },
  {
    handlerId: 'HND-KA02-02',
    name: 'Warden Divya Kumar (Backup)',
    zone: 'Zone 2',
    team: 'Bravo Auxiliary West',
    branch: 'Bengaluru West Enforcement Division',
    depot: 'West Zone Depot #2 (Malleshwaram)',
    availability: true,
    maximumCapacity: 4,
    currentWorkload: 0,
    isBackup: true,
    contactNumber: '+91-98450-20002'
  },

  // Zone 3 Handlers (KA03)
  {
    handlerId: 'HND-KA03-01',
    name: 'Senior Warden Vikramaditya Rao',
    zone: 'Zone 3',
    team: 'Charlie Tech Corridor Unit',
    branch: 'Bengaluru East Enforcement Division',
    depot: 'East Zone Tech Depot #3 (Indiranagar)',
    availability: true,
    maximumCapacity: 6,
    currentWorkload: 3,
    isBackup: false,
    contactNumber: '+91-98450-30001'
  },
  {
    handlerId: 'HND-KA03-02',
    name: 'Officer Priya Nambiar (Backup)',
    zone: 'Zone 3',
    team: 'Charlie Auxiliary Tech',
    branch: 'Bengaluru East Enforcement Division',
    depot: 'East Zone Tech Depot #3 (Whitefield Inner Depot)',
    availability: true,
    maximumCapacity: 5,
    currentWorkload: 1,
    isBackup: true,
    contactNumber: '+91-98450-30002'
  },

  // Zone 4 Handlers (KA04)
  {
    handlerId: 'HND-KA04-01',
    name: 'Inspector Anand Shettar',
    zone: 'Zone 4',
    team: 'Delta Ring Road Transit',
    branch: 'Bengaluru North Enforcement Division',
    depot: 'North Zone Transit Depot #4 (Yeshwanthpur)',
    availability: true,
    maximumCapacity: 5,
    currentWorkload: 1,
    isBackup: false,
    contactNumber: '+91-98450-40001'
  },
  {
    handlerId: 'HND-KA04-02',
    name: 'Warden Suresh Babu (Backup)',
    zone: 'Zone 4',
    team: 'Delta Auxiliary North',
    branch: 'Bengaluru North Enforcement Division',
    depot: 'North Zone Transit Depot #4 (Hebbal Depot)',
    availability: true,
    maximumCapacity: 4,
    currentWorkload: 0,
    isBackup: true,
    contactNumber: '+91-98450-40002'
  },

  // Zone 5 Handlers (KA05)
  {
    handlerId: 'HND-KA05-01',
    name: 'Officer Kavitha Murthy',
    zone: 'Zone 5',
    team: 'Echo South Commercial Bay',
    branch: 'Bengaluru South Enforcement Division',
    depot: 'South Zone Civic Depot #5 (Jayanagar 4th Block)',
    availability: true,
    maximumCapacity: 6,
    currentWorkload: 2,
    isBackup: false,
    contactNumber: '+91-98450-50001'
  },
  {
    handlerId: 'HND-KA05-02',
    name: 'Inspector Sandeep Reddy (Backup)',
    zone: 'Zone 5',
    team: 'Echo Auxiliary South',
    branch: 'Bengaluru South Enforcement Division',
    depot: 'South Zone Civic Depot #5 (Koramangala Depot)',
    availability: true,
    maximumCapacity: 5,
    currentWorkload: 1,
    isBackup: true,
    contactNumber: '+91-98450-50002'
  },

  // Zone 6 Handlers (KA06)
  {
    handlerId: 'HND-KA06-01',
    name: 'Senior Inspector Harish Nayak',
    zone: 'Zone 6',
    team: 'Foxtrot Expressway Patrol',
    branch: 'Bengaluru Suburban Enforcement Division',
    depot: 'Suburban Expressway Depot #6 (Electronics City Phase 1)',
    availability: true,
    maximumCapacity: 6,
    currentWorkload: 2,
    isBackup: false,
    contactNumber: '+91-98450-60001'
  },
  {
    handlerId: 'HND-KA06-02',
    name: 'Warden Ananya Deshmukh (Backup)',
    zone: 'Zone 6',
    team: 'Foxtrot Auxiliary Suburban',
    branch: 'Bengaluru Suburban Enforcement Division',
    depot: 'Suburban Expressway Depot #6 (Sarjapur Border Depot)',
    availability: true,
    maximumCapacity: 4,
    currentWorkload: 0,
    isBackup: true,
    contactNumber: '+91-98450-60002'
  }
];

export const INITIAL_ROUTING_RULES = [
  {
    routingKey: 'KA01',
    zone: 'Zone 1',
    zoneName: 'Central Business District (CBD - MG Road / Brigade Road)',
    primaryHandler: 'HND-KA01-01',
    backupHandlers: ['HND-KA01-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 20, autoDispatchBackup: true }
  },
  {
    routingKey: 'KA02',
    zone: 'Zone 2',
    zoneName: 'Bengaluru West (Rajajinagar / Malleshwaram)',
    primaryHandler: 'HND-KA02-01',
    backupHandlers: ['HND-KA02-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 30, autoDispatchBackup: true }
  },
  {
    routingKey: 'KA03',
    zone: 'Zone 3',
    zoneName: 'Bengaluru East (Indiranagar / Whitefield Tech Corridor)',
    primaryHandler: 'HND-KA03-01',
    backupHandlers: ['HND-KA03-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 25, autoDispatchBackup: true }
  },
  {
    routingKey: 'KA04',
    zone: 'Zone 4',
    zoneName: 'Bengaluru North (Yeshwanthpur / Hebbal Ring Road)',
    primaryHandler: 'HND-KA04-01',
    backupHandlers: ['HND-KA04-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 30, autoDispatchBackup: true }
  },
  {
    routingKey: 'KA05',
    zone: 'Zone 5',
    zoneName: 'Bengaluru South (Jayanagar / Koramangala / BTM)',
    primaryHandler: 'HND-KA05-01',
    backupHandlers: ['HND-KA05-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 25, autoDispatchBackup: true }
  },
  {
    routingKey: 'KA06',
    zone: 'Zone 6',
    zoneName: 'Outer Suburbs (Electronics City / Sarjapur Expressway)',
    primaryHandler: 'HND-KA06-01',
    backupHandlers: ['HND-KA06-02'],
    priorityRules: { criticalEscalation: true, maxQueueWaitMinutes: 35, autoDispatchBackup: true }
  }
];

export const INITIAL_REPORTS = [
  {
    reportId: 'PVT-20261113-1001',
    reporterName: 'Warden Arun Teja',
    vehicleNumber: 'KA01AB1234',
    violationCode: 'PV13',
    description: 'Parking in designated accessible handicap bay without valid disability badge',
    location: 'MG Road Metro Station Entry Plaza, Zone 1',
    urgency: 'Critical',
    priority: 'Critical',
    category: 'Disabled-Bay',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA01',
    zone: 'Zone 1',
    handlerId: 'HND-KA01-01',
    handlerName: 'Inspector Rajesh Gowda',
    status: 'In Progress',
    routingDecision: 'Dispatched to Primary Handler Inspector Rajesh Gowda (HND-KA01-01) at Zone 1.',
    remarks: 'Tow truck dispatched to clear accessible bay.',
    submissionTimestamp: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    reportId: 'PVT-20261113-1002',
    reporterName: 'Officer Suma Rao',
    vehicleNumber: 'KA03A1234',
    violationCode: 'PV10',
    description: 'Blocking emergency fire lane or fire hydrant',
    location: '100 Feet Road, Indiranagar Near Apollo Pharmacy',
    urgency: 'Critical',
    priority: 'Critical',
    category: 'Obstruction',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA03',
    zone: 'Zone 3',
    handlerId: 'HND-KA03-01',
    handlerName: 'Senior Warden Vikramaditya Rao',
    status: 'Assigned',
    routingDecision: 'Dispatched to Primary Handler Senior Warden Vikramaditya Rao at Zone 3.',
    remarks: 'Fire marshal notified.',
    submissionTimestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    reportId: 'PVT-20261113-1003',
    reporterName: 'Warden Karthik J',
    vehicleNumber: 'KA05C5678',
    violationCode: 'PV05',
    description: 'Extended overstay in restricted time bay (> 2 hours)',
    location: 'Jayanagar 4th Block Shopping Complex Bay 12',
    urgency: 'High',
    priority: 'High',
    category: 'Overstay',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA05',
    zone: 'Zone 5',
    handlerId: 'HND-KA05-01',
    handlerName: 'Officer Kavitha Murthy',
    status: 'Pending',
    routingDecision: 'Dispatched to Primary Handler Officer Kavitha Murthy at Zone 5.',
    remarks: 'Vehicle parked for 4 hours in 1-hour bay.',
    submissionTimestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    reportId: 'PVT-20261113-1004',
    reporterName: 'Warden Ramesh M',
    vehicleNumber: 'KA02CD4567',
    violationCode: 'PV01',
    description: 'Parked without valid parking permit or ticket',
    location: 'Rajajinagar 1st Block Service Road',
    urgency: 'Normal',
    priority: 'Normal',
    category: 'No-Permit',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA02',
    zone: 'Zone 2',
    handlerId: 'HND-KA02-01',
    handlerName: 'Officer Manjunath Patil',
    status: 'Resolved',
    routingDecision: 'Dispatched to Primary Handler Officer Manjunath Patil at Zone 2.',
    remarks: 'Challan issued and paid online. Vehicle vacated.',
    submissionTimestamp: new Date(Date.now() - 180 * 60 * 1000),
    resolvedTimestamp: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    reportId: 'PVT-20261113-1005',
    reporterName: 'Officer Deepa Nair',
    vehicleNumber: 'KA06EF9012',
    violationCode: 'PV08',
    description: 'Heavy commercial vehicle parked in residential zone',
    location: 'Electronics City Phase 1 Concorde Layout',
    urgency: 'High',
    priority: 'High',
    category: 'Wrong-Zone',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA06',
    zone: 'Zone 6',
    handlerId: 'HND-KA06-01',
    handlerName: 'Senior Inspector Harish Nayak',
    status: 'In Progress',
    routingDecision: 'Dispatched to Primary Handler Senior Inspector Harish Nayak at Zone 6.',
    remarks: 'Driver instructed to move commercial truck to designated transport hub.',
    submissionTimestamp: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    reportId: 'PVT-20261113-1006',
    reporterName: 'Dispatcher Automation',
    vehicleNumber: 'KA99ZZ9999',
    violationCode: 'PV11',
    description: 'Double parking obstructing active traffic lane or driveway',
    location: 'Outer Ring Road Bellandur Flyover Approach',
    urgency: 'Critical',
    priority: 'Critical',
    category: 'Obstruction',
    validationStatus: 'VALID',
    validationMethod: 'HYBRID_AGREEMENT',
    routingKey: 'KA99',
    zone: 'Unknown Zone',
    handlerId: 'FALLBACK_CENTRAL',
    handlerName: 'Central Enforcement Dispatch Authority',
    status: 'Escalated',
    routingDecision: 'Routing Key KA99 does not match any configured enforcement zones (KA01-KA06). Enqueued into Central Fallback Queue.',
    escalationReason: 'UNKNOWN_ROUTING_ZONE: KA99',
    remarks: 'Awaiting manual zonal reallocation by Central Operations.',
    submissionTimestamp: new Date(Date.now() - 10 * 60 * 1000)
  }
];

/**
 * Seed database with initial records if collections are empty
 */
export async function seedDatabase() {
  try {
    const handlerCount = await Handler.countDocuments();
    if (handlerCount === 0) {
      console.log('[Seeder] Populating initial handlers...');
      await Handler.insertMany(INITIAL_HANDLERS);
      console.log(`[Seeder] Inserted ${INITIAL_HANDLERS.length} enforcement handlers.`);
    }

    const ruleCount = await RoutingRule.countDocuments();
    if (ruleCount === 0) {
      console.log('[Seeder] Populating routing rules...');
      await RoutingRule.insertMany(INITIAL_ROUTING_RULES);
      console.log(`[Seeder] Inserted ${INITIAL_ROUTING_RULES.length} zonal routing rules.`);
    }

    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      console.log('[Seeder] Populating sample violation reports...');
      await Report.insertMany(INITIAL_REPORTS);
      console.log(`[Seeder] Inserted ${INITIAL_REPORTS.length} sample reports.`);

      // Create initial activity logs for each sample report
      for (const r of INITIAL_REPORTS) {
        await ActivityLog.create({
          reportId: r.reportId,
          action: r.status === 'Resolved' ? 'RESOLVED' : r.status === 'Escalated' ? 'ESCALATED_FALLBACK' : 'SUBMITTED',
          previousStatus: null,
          newStatus: r.status,
          performedBy: r.reporterName,
          remarks: r.remarks || r.routingDecision
        });
      }
    }

    console.log('[Seeder] Database verified with full operational baseline data.');
  } catch (err) {
    console.error('[Seeder] Error during database seeding:', err);
  }
}
