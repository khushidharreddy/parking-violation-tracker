import { Report } from '../models/Report.js';
import { Handler } from '../models/Handler.js';
import { ZONE_CONFIGURATIONS } from '../utils/router.js';

/**
 * Summary metrics
 * GET /api/analytics/summary
 */
export async function getSummaryAnalytics(req, res) {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const assignedReports = await Report.countDocuments({ status: 'Assigned' });
    const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });
    const escalatedReports = await Report.countDocuments({ status: 'Escalated' });

    const criticalReports = await Report.countDocuments({ priority: 'Critical' });
    const highReports = await Report.countDocuments({ priority: 'High' });
    const normalReports = await Report.countDocuments({ priority: 'Normal' });

    const totalHandlers = await Handler.countDocuments();
    const activeHandlers = await Handler.countDocuments({ availability: true });

    return res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        assignedReports,
        inProgressReports,
        resolvedReports,
        escalatedReports,
        criticalReports,
        highReports,
        normalReports,
        totalEnforcementZones: Object.keys(ZONE_CONFIGURATIONS).length,
        totalHandlers,
        activeHandlers,
        resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
      }
    });
  } catch (error) {
    console.error('[AnalyticsController] getSummaryAnalytics error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Category-wise distribution
 * GET /api/analytics/categories
 */
export async function getCategoryAnalytics(req, res) {
  try {
    const categories = ['No-Permit', 'Overstay', 'Wrong-Zone', 'Obstruction', 'Disabled-Bay'];

    const aggregation = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] }
          }
        }
      }
    ]);

    const resultMap = {};
    aggregation.forEach((item) => {
      resultMap[item._id] = item;
    });

    const formatted = categories.map((cat) => ({
      category: cat,
      count: resultMap[cat] ? resultMap[cat].count : 0,
      resolved: resultMap[cat] ? resultMap[cat].resolvedCount : 0,
      critical: resultMap[cat] ? resultMap[cat].criticalCount : 0
    }));

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('[AnalyticsController] getCategoryAnalytics error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Zone-wise distribution
 * GET /api/analytics/zones
 */
export async function getZoneAnalytics(req, res) {
  try {
    const aggregation = await Report.aggregate([
      {
        $group: {
          _id: '$zone',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $in: ['$status', ['Pending', 'Assigned', 'In Progress']] }, 1, 0] }
          }
        }
      }
    ]);

    const zoneMap = {};
    aggregation.forEach((z) => {
      zoneMap[z._id] = z;
    });

    const formatted = Object.values(ZONE_CONFIGURATIONS).map((z) => ({
      zone: z.zone,
      zoneName: z.zoneName,
      count: zoneMap[z.zone] ? zoneMap[z.zone].count : 0,
      resolved: zoneMap[z.zone] ? zoneMap[z.zone].resolved : 0,
      pending: zoneMap[z.zone] ? zoneMap[z.zone].pending : 0
    }));

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('[AnalyticsController] getZoneAnalytics error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Daily violation count trend
 * GET /api/analytics/daily
 */
export async function getDailyAnalytics(req, res) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const aggregation = await Report.aggregate([
      {
        $match: {
          submissionTimestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submissionTimestamp' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formatted = aggregation.map((item) => ({
      date: item._id,
      violations: item.total,
      resolved: item.resolved,
      critical: item.critical
    }));

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('[AnalyticsController] getDailyAnalytics error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Handler workload comparison
 * GET /api/analytics/workload
 */
export async function getHandlerWorkloadAnalytics(req, res) {
  try {
    const handlers = await Handler.find().sort({ zone: 1 });
    const formatted = handlers.map((h) => ({
      handlerId: h.handlerId,
      name: h.name,
      zone: h.zone,
      currentWorkload: h.currentWorkload,
      maximumCapacity: h.maximumCapacity,
      availableCapacity: Math.max(0, h.maximumCapacity - h.currentWorkload),
      availability: h.availability,
      isBackup: h.isBackup,
      utilizationRate: Math.round((h.currentWorkload / h.maximumCapacity) * 100)
    }));

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('[AnalyticsController] getHandlerWorkloadAnalytics error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}
