import { Report } from '../models/Report.js';
import { Handler } from '../models/Handler.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { validateVehicleDual, validateViolationDual } from '../utils/automataValidator.js';
import { classifyViolation } from '../utils/classifier.js';
import { dispatchReport, extractRoutingKey, ZONE_CONFIGURATIONS } from '../utils/router.js';

// Generates unique human-readable report ID
function generateReportId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PVT-${dateStr}-${randomSuffix}`;
}

/**
 * Submit a new violation report
 */
export async function createReport(req, res) {
  try {
    const {
      reporterName,
      vehicleNumber,
      violationCode,
      description,
      location,
      urgency = 'Normal',
      remarks = '',
      secondaryHint = null
    } = req.body;

    // Basic required field validation
    if (!reporterName || !vehicleNumber || !violationCode || !location) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Reporter name, vehicle registration number, violation code, and location are required.'
      });
    }

    // Step 1: Automata & Regex Vehicle Number Validation (Part A)
    const vehicleValidation = validateVehicleDual(vehicleNumber);
    if (!vehicleValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'MALFORMED_VEHICLE_NUMBER',
        message: `Vehicle registration '${vehicleNumber}' is invalid under Karnataka registration format ([A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}). Report rejected before routing.`,
        validation: vehicleValidation
      });
    }

    // Step 2: Automata & Regex Violation Code Validation
    const violationValidation = validateViolationDual(violationCode);
    if (!violationValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_VIOLATION_CODE_SYNTAX',
        message: `Violation code '${violationCode}' is syntactically invalid. Expected 'PV' followed by exactly 2 digits (e.g. PV01-PV15).`,
        validation: violationValidation
      });
    }

    // Step 3: Five-Category Classification Engine
    const classification = classifyViolation(violationCode, secondaryHint);
    if (!classification.success || classification.isUnknown) {
      return res.status(400).json({
        success: false,
        error: 'UNKNOWN_VIOLATION_CODE',
        message: classification.message || `Unknown violation code '${violationCode}'. Cannot be classified into predefined categories.`,
        classification
      });
    }

    const reportId = generateReportId();
    const routingKey = extractRoutingKey(vehicleValidation.normalized);
    const effectivePriority = urgency || classification.defaultUrgency || 'Normal';

    // Step 4: Dispatch & Routing Engine (Part B)
    const routingResult = await dispatchReport({
      vehicleNumber: vehicleValidation.normalized,
      urgency: effectivePriority,
      reportId,
      reporterName
    });

    // Check duplicate assignment safeguard
    const existing = await Report.findOne({ reportId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_REPORT_ID',
        message: `A report with ID ${reportId} already exists.`
      });
    }

    // Create Report in MongoDB
    const newReport = new Report({
      reportId,
      reporterName: reporterName.trim(),
      vehicleNumber: vehicleValidation.normalized,
      violationCode: violationValidation.normalized,
      description: description || classification.title,
      location: location.trim(),
      urgency: effectivePriority,
      priority: effectivePriority,
      category: classification.category,
      validationStatus: 'VALID',
      validationMethod: 'HYBRID_AGREEMENT',
      routingKey,
      zone: routingResult.zone,
      handlerId: routingResult.handlerId,
      handlerName: routingResult.handlerName,
      status: routingResult.status,
      routingDecision: routingResult.routingDecision,
      escalationReason: routingResult.escalationReason,
      remarks: remarks || classification.conflictResolution || '',
      submissionTimestamp: new Date()
    });

    const savedReport = await newReport.save();

    // Log Activity History
    await ActivityLog.create({
      reportId,
      action: 'SUBMITTED',
      previousStatus: null,
      newStatus: savedReport.status,
      performedBy: reporterName,
      remarks: `Report submitted for ${savedReport.vehicleNumber} (${savedReport.category}). ${routingResult.routingDecision}`
    });

    if (routingResult.isBackupAssigned) {
      await ActivityLog.create({
        reportId,
        action: 'BACKUP_DISPATCHED',
        previousStatus: 'Pending',
        newStatus: 'Assigned',
        performedBy: 'ROUTING_ENGINE',
        remarks: routingResult.routingDecision
      });
    } else if (routingResult.dispatchedToFallback) {
      await ActivityLog.create({
        reportId,
        action: 'ESCALATED_FALLBACK',
        previousStatus: 'Pending',
        newStatus: 'Escalated',
        performedBy: 'ROUTING_ENGINE',
        remarks: routingResult.escalationReason
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Violation report successfully submitted, validated, and routed.',
      data: savedReport,
      validation: {
        vehicle: vehicleValidation,
        violation: violationValidation,
        agreement: vehicleValidation.agreement && violationValidation.agreement
      },
      classification,
      routing: routingResult
    });
  } catch (error) {
    console.error('[ReportController] createReport error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'An error occurred while creating report.'
    });
  }
}

/**
 * Get all reports with optional filters and search
 */
export async function getReports(req, res) {
  try {
    const { search, category, zone, priority, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { reportId: { $regex: s, $options: 'i' } },
        { vehicleNumber: { $regex: s, $options: 'i' } },
        { reporterName: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } }
      ];
    }

    if (category && category !== 'ALL') query.category = category;
    if (zone && zone !== 'ALL') query.zone = zone;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (status && status !== 'ALL') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .sort({ submissionTimestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reports
    });
  } catch (error) {
    console.error('[ReportController] getReports error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Get single report by reportId or _id with activity logs
 */
export async function getReportById(req, res) {
  try {
    const { id } = req.params;
    let report = await Report.findOne({ reportId: id });
    if (!report && id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Report '${id}' not found.` });
    }

    const logs = await ActivityLog.find({ reportId: report.reportId }).sort({ timestamp: 1 });

    return res.json({
      success: true,
      data: report,
      logs
    });
  } catch (error) {
    console.error('[ReportController] getReportById error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Update report status (Pending -> Assigned -> In Progress -> Resolved)
 */
export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks = '', performedBy = 'ENFORCEMENT_HANDLER' } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    let report = await Report.findOne({ reportId: id });
    if (!report && id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Report '${id}' not found.` });
    }

    const previousStatus = report.status;
    report.status = status;
    if (remarks) report.remarks = remarks;

    // Handle workload decrement on resolution
    if (status === 'Resolved' && previousStatus !== 'Resolved') {
      report.resolvedTimestamp = new Date();
      if (report.handlerId && report.handlerId !== 'UNASSIGNED' && report.handlerId !== 'FALLBACK_CENTRAL') {
        const handler = await Handler.findOne({ handlerId: report.handlerId });
        if (handler && handler.currentWorkload > 0) {
          await Handler.findByIdAndUpdate(handler._id, { $inc: { currentWorkload: -1 } });
        }
      }
    }

    // If reopening a resolved report
    if (previousStatus === 'Resolved' && status !== 'Resolved') {
      report.resolvedTimestamp = null;
      if (report.handlerId && report.handlerId !== 'UNASSIGNED' && report.handlerId !== 'FALLBACK_CENTRAL') {
        await Handler.findOneAndUpdate({ handlerId: report.handlerId }, { $inc: { currentWorkload: 1 } });
      }
    }

    const updated = await report.save();

    await ActivityLog.create({
      reportId: report.reportId,
      action: status === 'Resolved' ? 'RESOLVED' : 'STATUS_CHANGE',
      previousStatus,
      newStatus: status,
      performedBy,
      remarks: remarks || `Status transitioned from ${previousStatus} to ${status}`
    });

    return res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('[ReportController] updateReportStatus error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Delete a report
 */
export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    let report = await Report.findOne({ reportId: id });
    if (!report && id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Report '${id}' not found.` });
    }

    // Decrement handler workload if report was active
    if (['Assigned', 'In Progress'].includes(report.status) && report.handlerId) {
      const handler = await Handler.findOne({ handlerId: report.handlerId });
      if (handler && handler.currentWorkload > 0) {
        await Handler.findByIdAndUpdate(handler._id, { $inc: { currentWorkload: -1 } });
      }
    }

    await Report.deleteOne({ _id: report._id });
    await ActivityLog.deleteMany({ reportId: report.reportId });

    return res.json({
      success: true,
      message: `Report ${report.reportId} deleted successfully.`
    });
  } catch (error) {
    console.error('[ReportController] deleteReport error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}
