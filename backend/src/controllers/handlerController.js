import { Handler } from '../models/Handler.js';
import { Report } from '../models/Report.js';

/**
 * Get all handlers
 * GET /api/handlers
 */
export async function getHandlers(req, res) {
  try {
    const { zone } = req.query;
    const query = zone && zone !== 'ALL' ? { zone } : {};
    const handlers = await Handler.find(query).sort({ zone: 1, isBackup: 1, name: 1 });
    return res.json({ success: true, count: handlers.length, data: handlers });
  } catch (error) {
    console.error('[HandlerController] getHandlers error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Create a new handler
 * POST /api/handlers
 */
export async function createHandler(req, res) {
  try {
    const {
      handlerId,
      name,
      zone,
      team,
      branch,
      depot,
      availability = true,
      maximumCapacity = 5,
      isBackup = false,
      contactNumber
    } = req.body;

    if (!handlerId || !name || !zone || !team || !branch || !depot) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'handlerId, name, zone, team, branch, and depot are required.'
      });
    }

    const existing = await Handler.findOne({ handlerId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_HANDLER_ID',
        message: `Handler with ID '${handlerId}' already exists.`
      });
    }

    const handler = new Handler({
      handlerId,
      name,
      zone,
      team,
      branch,
      depot,
      availability,
      maximumCapacity,
      isBackup,
      contactNumber
    });

    const saved = await handler.save();
    return res.status(201).json({ success: true, message: 'Handler created successfully.', data: saved });
  } catch (error) {
    console.error('[HandlerController] createHandler error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Update handler details (availability, capacity, workload)
 * PUT /api/handlers/:id
 */
export async function updateHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let handler = await Handler.findOne({ handlerId: id });
    if (!handler && id.match(/^[0-9a-fA-F]{24}$/)) {
      handler = await Handler.findById(id);
    }

    if (!handler) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Handler '${id}' not found.` });
    }

    // Apply allowed updates
    if (typeof updateData.availability === 'boolean') handler.availability = updateData.availability;
    if (typeof updateData.maximumCapacity === 'number') handler.maximumCapacity = updateData.maximumCapacity;
    if (typeof updateData.currentWorkload === 'number') handler.currentWorkload = Math.max(0, updateData.currentWorkload);
    if (typeof updateData.isBackup === 'boolean') handler.isBackup = updateData.isBackup;
    if (updateData.name) handler.name = updateData.name;
    if (updateData.team) handler.team = updateData.team;
    if (updateData.branch) handler.branch = updateData.branch;
    if (updateData.depot) handler.depot = updateData.depot;

    const saved = await handler.save();
    return res.json({ success: true, message: 'Handler updated successfully.', data: saved });
  } catch (error) {
    console.error('[HandlerController] updateHandler error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Get reports assigned to a specific handler
 * GET /api/handlers/:id/reports
 */
export async function getHandlerReports(req, res) {
  try {
    const { id } = req.params;
    let handler = await Handler.findOne({ handlerId: id });
    if (!handler && id.match(/^[0-9a-fA-F]{24}$/)) {
      handler = await Handler.findById(id);
    }

    if (!handler) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Handler '${id}' not found.` });
    }

    const reports = await Report.find({ handlerId: handler.handlerId }).sort({ submissionTimestamp: -1 });

    return res.json({
      success: true,
      handler,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('[HandlerController] getHandlerReports error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}
