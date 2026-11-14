/**
 * VIOLATION CLASSIFICATION ENGINE
 *
 * Predefined Categories:
 * 1. No-Permit
 * 2. Overstay
 * 3. Wrong-Zone
 * 4. Obstruction
 * 5. Disabled-Bay
 *
 * Deterministic Priority Rule:
 * Disabled-Bay (Weight 5) > Obstruction (Weight 4) > Wrong-Zone (Weight 3) > Overstay (Weight 2) > No-Permit (Weight 1)
 */

export const PREDEFINED_VIOLATION_CATALOG = {
  // 1. No-Permit Violations
  PV01: {
    code: 'PV01',
    category: 'No-Permit',
    title: 'Parked without valid parking permit or ticket',
    defaultUrgency: 'Normal',
    priorityRank: 1,
    fineAmount: 500,
    severity: 'LOW'
  },
  PV02: {
    code: 'PV02',
    category: 'No-Permit',
    title: 'Unauthorized commercial parking in private bay',
    defaultUrgency: 'Normal',
    priorityRank: 1,
    fineAmount: 750,
    severity: 'MEDIUM'
  },
  PV03: {
    code: 'PV03',
    category: 'No-Permit',
    title: 'Forged, defaced, or expired permit decal',
    defaultUrgency: 'High',
    priorityRank: 1,
    fineAmount: 1000,
    severity: 'MEDIUM'
  },

  // 2. Overstay Violations
  PV04: {
    code: 'PV04',
    category: 'Overstay',
    title: 'Meter expired parking (under 2 hours)',
    defaultUrgency: 'Normal',
    priorityRank: 2,
    fineAmount: 400,
    severity: 'LOW'
  },
  PV05: {
    code: 'PV05',
    category: 'Overstay',
    title: 'Extended overstay in restricted time bay (> 2 hours)',
    defaultUrgency: 'High',
    priorityRank: 2,
    fineAmount: 800,
    severity: 'MEDIUM'
  },
  PV06: {
    code: 'PV06',
    category: 'Overstay',
    title: 'Overnight unauthorized parking in daytime-only zone',
    defaultUrgency: 'Normal',
    priorityRank: 2,
    fineAmount: 600,
    severity: 'MEDIUM'
  },

  // 3. Wrong-Zone Violations
  PV07: {
    code: 'PV07',
    category: 'Wrong-Zone',
    title: 'Residential parking permit vehicle parked in commercial bay',
    defaultUrgency: 'Normal',
    priorityRank: 3,
    fineAmount: 600,
    severity: 'MEDIUM'
  },
  PV08: {
    code: 'PV08',
    category: 'Wrong-Zone',
    title: 'Heavy commercial vehicle parked in residential zone',
    defaultUrgency: 'High',
    priorityRank: 3,
    fineAmount: 1200,
    severity: 'HIGH'
  },
  PV09: {
    code: 'PV09',
    category: 'Wrong-Zone',
    title: 'Government / Consular reserved bay infringement',
    defaultUrgency: 'Critical',
    priorityRank: 3,
    fineAmount: 1500,
    severity: 'HIGH'
  },

  // 4. Obstruction Violations
  PV10: {
    code: 'PV10',
    category: 'Obstruction',
    title: 'Blocking emergency fire lane or fire hydrant',
    defaultUrgency: 'Critical',
    priorityRank: 4,
    fineAmount: 2000,
    severity: 'CRITICAL'
  },
  PV11: {
    code: 'PV11',
    category: 'Obstruction',
    title: 'Double parking obstructing active traffic lane or driveway',
    defaultUrgency: 'Critical',
    priorityRank: 4,
    fineAmount: 1500,
    severity: 'CRITICAL'
  },
  PV12: {
    code: 'PV12',
    category: 'Obstruction',
    title: 'Blocking pedestrian walkway, zebra crossing, or bicycle lane',
    defaultUrgency: 'High',
    priorityRank: 4,
    fineAmount: 1000,
    severity: 'HIGH'
  },

  // 5. Disabled-Bay Violations
  PV13: {
    code: 'PV13',
    category: 'Disabled-Bay',
    title: 'Parking in designated accessible handicap bay without valid disability badge',
    defaultUrgency: 'Critical',
    priorityRank: 5,
    fineAmount: 2500,
    severity: 'CRITICAL'
  },
  PV14: {
    code: 'PV14',
    category: 'Disabled-Bay',
    title: 'Obstructing wheelchair ramp, lowered curb, or tactile paving egress',
    defaultUrgency: 'Critical',
    priorityRank: 5,
    fineAmount: 2500,
    severity: 'CRITICAL'
  },
  PV15: {
    code: 'PV15',
    category: 'Disabled-Bay',
    title: 'Unauthorized display or fraudulent use of disabled patron badge',
    defaultUrgency: 'Critical',
    priorityRank: 5,
    fineAmount: 3000,
    severity: 'CRITICAL'
  }
};

export const CATEGORY_PRIORITY_ORDER = [
  'Disabled-Bay', // Rank 1 (Highest imperative)
  'Obstruction',  // Rank 2 (Public safety / traffic clearance)
  'Wrong-Zone',   // Rank 3 (Jurisdiction / zone violation)
  'Overstay',     // Rank 4 (Meter / duration violation)
  'No-Permit'     // Rank 5 (Fee compliance)
];

/**
 * Classifies a violation code with strict deterministic rules
 * Handles unknown codes, conflicting patterns, and invalid identifiers.
 * NEVER silently assigns an unknown code to a valid category!
 *
 * @param {string} code - Violation code (e.g., 'PV01')
 * @param {string} [secondaryHint] - Optional secondary pattern/flag for testing conflicting conditions
 * @returns {object} Classification outcome
 */
export function classifyViolation(code, secondaryHint = null) {
  if (!code || typeof code !== 'string') {
    return {
      success: false,
      category: 'Unclassified',
      error: 'INVALID_IDENTIFIER',
      message: 'Violation code must be a non-empty string.',
      isUnknown: true
    };
  }

  const normalized = code.trim().toUpperCase();

  // Strict catalog lookup
  const match = PREDEFINED_VIOLATION_CATALOG[normalized];

  if (!match) {
    return {
      success: false,
      category: 'Unclassified',
      error: 'UNKNOWN_VIOLATION_CODE',
      message: `Unknown violation code '${normalized}'. Code does not match any of the five predefined categories. Flagged for manual review.`,
      isUnknown: true,
      originalCode: normalized
    };
  }

  // Handle hypothetical multi-condition or conflicting classification pattern
  let resolvedCategory = match.category;
  let resolvedUrgency = match.defaultUrgency;
  let conflictingResolutionNote = null;

  if (secondaryHint && typeof secondaryHint === 'string') {
    const hintNorm = secondaryHint.trim();
    // If a secondary pattern conflicts with the primary code
    if (CATEGORY_PRIORITY_ORDER.includes(hintNorm) && hintNorm !== match.category) {
      const primaryIndex = CATEGORY_PRIORITY_ORDER.indexOf(match.category);
      const hintIndex = CATEGORY_PRIORITY_ORDER.indexOf(hintNorm);

      // Deterministic rule: lower index in CATEGORY_PRIORITY_ORDER has higher priority
      if (hintIndex < primaryIndex) {
        resolvedCategory = hintNorm;
        conflictingResolutionNote = `Conflict detected between code '${normalized}' (${match.category}) and secondary signal (${hintNorm}). Deterministic priority applied: escalated to '${hintNorm}' (Rank ${hintIndex + 1} over Rank ${primaryIndex + 1}).`;
        if (hintNorm === 'Disabled-Bay' || hintNorm === 'Obstruction') {
          resolvedUrgency = 'Critical';
        }
      } else {
        conflictingResolutionNote = `Conflict detected between code '${normalized}' (${match.category}) and secondary signal (${hintNorm}). Deterministic priority preserved: maintained '${match.category}' (Rank ${primaryIndex + 1} over Rank ${hintIndex + 1}).`;
      }
    }
  }

  return {
    success: true,
    code: normalized,
    category: resolvedCategory,
    title: match.title,
    defaultUrgency: resolvedUrgency,
    priorityRank: match.priorityRank,
    fineAmount: match.fineAmount,
    severity: match.severity,
    conflictResolution: conflictingResolutionNote,
    isUnknown: false
  };
}
