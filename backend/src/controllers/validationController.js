import {
  validateVehicleDFA,
  validateVehicleRegex,
  validateVehicleDual,
  validateViolationCodeDFA,
  validateViolationCodeRegex,
  validateViolationDual
} from '../utils/automataValidator.js';
import { classifyViolation, PREDEFINED_VIOLATION_CATALOG } from '../utils/classifier.js';
import { ZONE_CONFIGURATIONS, extractRoutingKey } from '../utils/router.js';

/**
 * Validate vehicle registration number
 * POST /api/validate/vehicle
 */
export async function validateVehicle(req, res) {
  try {
    const { vehicleNumber } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        isValid: false,
        error: 'EMPTY_INPUT',
        message: 'Vehicle registration number is required.'
      });
    }

    const dfaResult = validateVehicleDFA(vehicleNumber);
    const regexResult = validateVehicleRegex(vehicleNumber);
    const agreement = dfaResult.isValid === regexResult.isValid;

    let routingKey = '';
    let zoneInfo = null;

    if (dfaResult.isValid) {
      routingKey = extractRoutingKey(dfaResult.normalized);
      zoneInfo = ZONE_CONFIGURATIONS[routingKey] || {
        zone: 'Unknown Zone',
        zoneName: 'Unassigned Territory'
      };
    }

    return res.json({
      success: true,
      input: vehicleNumber,
      normalized: dfaResult.normalized,
      isValid: dfaResult.isValid && regexResult.isValid,
      agreement,
      routingKey,
      zoneInfo,
      dfa: {
        isValid: dfaResult.isValid,
        finalState: dfaResult.finalState,
        trace: dfaResult.trace,
        explanation: dfaResult.explanation
      },
      regex: {
        isValid: regexResult.isValid,
        pattern: regexResult.pattern,
        explanation: regexResult.explanation
      }
    });
  } catch (error) {
    console.error('[ValidationController] validateVehicle error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}

/**
 * Validate violation code
 * POST /api/validate/violation
 */
export async function validateViolation(req, res) {
  try {
    const { violationCode, secondaryHint } = req.body;

    if (!violationCode) {
      return res.status(400).json({
        success: false,
        isValid: false,
        error: 'EMPTY_INPUT',
        message: 'Violation code is required.'
      });
    }

    const dfaResult = validateViolationCodeDFA(violationCode);
    const regexResult = validateViolationCodeRegex(violationCode);
    const agreement = dfaResult.isValid === regexResult.isValid;

    // Classification lookup
    let classification = null;
    if (dfaResult.isValid) {
      classification = classifyViolation(violationCode, secondaryHint);
    }

    return res.json({
      success: true,
      input: violationCode,
      normalized: dfaResult.normalized,
      isValid: dfaResult.isValid && regexResult.isValid,
      agreement,
      classification,
      catalog: PREDEFINED_VIOLATION_CATALOG[dfaResult.normalized] || null,
      dfa: {
        isValid: dfaResult.isValid,
        finalState: dfaResult.finalState,
        trace: dfaResult.trace,
        explanation: dfaResult.explanation
      },
      regex: {
        isValid: regexResult.isValid,
        pattern: regexResult.pattern,
        explanation: regexResult.explanation
      }
    });
  } catch (error) {
    console.error('[ValidationController] validateViolation error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
}
