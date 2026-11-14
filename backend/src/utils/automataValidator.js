/**
 * PART A - AUTOMATA THEORY & COMPUTABILITY
 * Vehicle Registration & Violation Code Automata Validators (JavaScript backend implementation)
 *
 * Pattern for Karnataka Vehicle Number:
 * [A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}
 *
 * Pattern for Violation Code:
 * PV[0-9]{2}
 */

export const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
export const VIOLATION_REGEX = /^PV[0-9]{2}$/;

/**
 * Validates vehicle registration number using a Deterministic Finite Automaton (DFA)
 * @param {string} input - Vehicle registration string (e.g. "KA03AB1234")
 * @returns {object} { isValid, isAccepted, finalState, trace, explanation }
 */
export function validateVehicleDFA(input) {
  if (typeof input !== 'string') {
    return {
      isValid: false,
      isAccepted: false,
      finalState: 'q_dead',
      trace: [],
      explanation: 'Vehicle number must be a valid string.'
    };
  }

  const normalized = input.trim().toUpperCase();
  if (normalized.length === 0) {
    return {
      isValid: false,
      isAccepted: false,
      finalState: 'q0',
      trace: [],
      explanation: 'Vehicle number cannot be empty.'
    };
  }

  const startState = 'q0';
  const acceptStates = new Set(['q10']);
  const deadState = 'q_dead';
  let currentState = startState;
  const trace = [];

  const isLetter = (c) => c >= 'A' && c <= 'Z';
  const isDigit = (c) => c >= '0' && c <= '9';

  const transition = (state, char) => {
    switch (state) {
      case 'q0': // 1st letter of state code (e.g., 'K')
        return isLetter(char) ? 'q1' : deadState;
      case 'q1': // 2nd letter of state code (e.g., 'A')
        return isLetter(char) ? 'q2' : deadState;
      case 'q2': // 1st digit of district code (e.g., '0')
        return isDigit(char) ? 'q3' : deadState;
      case 'q3': // 2nd digit of district code (e.g., '3')
        return isDigit(char) ? 'q4' : deadState;
      case 'q4': // 1st letter of series code (e.g., 'A' or 'C')
        return isLetter(char) ? 'q5' : deadState;
      case 'q5': // Branching: 2nd letter of series OR 1st digit of 4-digit serial
        if (isLetter(char)) return 'q6';
        if (isDigit(char)) return 'q7';
        return deadState;
      case 'q6': // 2-letter series completed; expects 1st digit of serial
        return isDigit(char) ? 'q7' : deadState;
      case 'q7': // 2nd digit of 4-digit serial
        return isDigit(char) ? 'q8' : deadState;
      case 'q8': // 3rd digit of 4-digit serial
        return isDigit(char) ? 'q9' : deadState;
      case 'q9': // 4th digit of 4-digit serial
        return isDigit(char) ? 'q10' : deadState;
      case 'q10': // Accept state: any additional character fails to deadState
        return deadState;
      default:
        return deadState;
    }
  };

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextState = transition(currentState, char);
    trace.push({
      step: i + 1,
      char,
      fromState: currentState,
      toState: nextState
    });
    currentState = nextState;

    if (currentState === deadState) {
      // Record any trailing characters
      for (let j = i + 1; j < normalized.length; j++) {
        trace.push({
          step: j + 1,
          char: normalized[j],
          fromState: deadState,
          toState: deadState
        });
      }
      break;
    }
  }

  const isAccepted = acceptStates.has(currentState);

  let explanation = '';
  if (isAccepted) {
    explanation = `Vehicle registration '${normalized}' accepted by DFA. Ended in accepting state '${currentState}'.`;
  } else {
    explanation = `Vehicle registration '${normalized}' rejected by DFA. Ended in non-accepting state '${currentState}'.`;
  }

  return {
    isValid: isAccepted,
    isAccepted,
    finalState: currentState,
    trace,
    explanation,
    normalized
  };
}

/**
 * Validates vehicle registration number using Regular Expression
 */
export function validateVehicleRegex(input) {
  if (typeof input !== 'string') return { isValid: false, normalized: '', explanation: 'Not a string' };
  const normalized = input.trim().toUpperCase();
  const isValid = VEHICLE_REGEX.test(normalized);
  return {
    isValid,
    normalized,
    pattern: VEHICLE_REGEX.toString(),
    explanation: isValid
      ? `Matches pattern ${VEHICLE_REGEX.source}`
      : `Does not match pattern ${VEHICLE_REGEX.source}`
  };
}

/**
 * Validates violation code using DFA: PV followed by exactly 2 digits (e.g. PV01)
 */
export function validateViolationCodeDFA(input) {
  if (typeof input !== 'string') {
    return {
      isValid: false,
      isAccepted: false,
      finalState: 's_dead',
      trace: [],
      explanation: 'Violation code must be a string.'
    };
  }

  const normalized = input.trim().toUpperCase();
  if (normalized.length === 0) {
    return {
      isValid: false,
      isAccepted: false,
      finalState: 's0',
      trace: [],
      explanation: 'Violation code cannot be empty.'
    };
  }

  const startState = 's0';
  const acceptStates = new Set(['s4']);
  const deadState = 's_dead';
  let currentState = startState;
  const trace = [];

  const transition = (state, char) => {
    switch (state) {
      case 's0':
        return char === 'P' ? 's1' : deadState;
      case 's1':
        return char === 'V' ? 's2' : deadState;
      case 's2':
        return char >= '0' && char <= '9' ? 's3' : deadState;
      case 's3':
        return char >= '0' && char <= '9' ? 's4' : deadState;
      case 's4':
        return deadState;
      default:
        return deadState;
    }
  };

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextState = transition(currentState, char);
    trace.push({
      step: i + 1,
      char,
      fromState: currentState,
      toState: nextState
    });
    currentState = nextState;

    if (currentState === deadState) {
      for (let j = i + 1; j < normalized.length; j++) {
        trace.push({
          step: j + 1,
          char: normalized[j],
          fromState: deadState,
          toState: deadState
        });
      }
      break;
    }
  }

  const isAccepted = acceptStates.has(currentState);
  return {
    isValid: isAccepted,
    isAccepted,
    finalState: currentState,
    trace,
    explanation: isAccepted
      ? `Violation code '${normalized}' accepted by DFA in state '${currentState}'.`
      : `Violation code '${normalized}' rejected by DFA in state '${currentState}'.`,
    normalized
  };
}

/**
 * Validates violation code using Regex
 */
export function validateViolationCodeRegex(input) {
  if (typeof input !== 'string') return { isValid: false, normalized: '', explanation: 'Not a string' };
  const normalized = input.trim().toUpperCase();
  const isValid = VIOLATION_REGEX.test(normalized);
  return {
    isValid,
    normalized,
    pattern: VIOLATION_REGEX.toString(),
    explanation: isValid
      ? `Matches pattern ${VIOLATION_REGEX.source}`
      : `Does not match pattern ${VIOLATION_REGEX.source}`
  };
}

/**
 * Dual validation with agreement checking
 */
export function validateVehicleDual(input) {
  const dfaResult = validateVehicleDFA(input);
  const regexResult = validateVehicleRegex(input);
  const agreement = dfaResult.isValid === regexResult.isValid;

  return {
    isValid: dfaResult.isValid && regexResult.isValid,
    agreement,
    normalized: dfaResult.normalized,
    dfa: dfaResult,
    regex: regexResult
  };
}

/**
 * Dual validation for violation code
 */
export function validateViolationDual(input) {
  const dfaResult = validateViolationCodeDFA(input);
  const regexResult = validateViolationCodeRegex(input);
  const agreement = dfaResult.isValid === regexResult.isValid;

  return {
    isValid: dfaResult.isValid && regexResult.isValid,
    agreement,
    normalized: dfaResult.normalized,
    dfa: dfaResult,
    regex: regexResult
  };
}
