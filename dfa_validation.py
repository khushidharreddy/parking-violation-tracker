#!/usr/bin/env python3
"""
PART A - AUTOMATA THEORY AND COMPUTABILITY
Project: P14 - Parking Violation Tracker
Demonstration of DFA (Deterministic Finite Automaton) and Regular Expression Validation
for Karnataka Vehicle Registration Numbers and Parking Violation Codes.

Formal Definition of Vehicle Registration DFA M = (Q, Sigma, delta, q0, F):
- Q = {q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q_dead}
- Sigma = {A-Z, 0-9}
- q0 = Start state
- F = {q10} (Accepting State)
- delta: Transition function defined below

Format Specification: [A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}
Examples:
  - KA03AB1234 -> Valid (2 letters)
  - KA05C5678  -> Valid (1 letter)
  - KA03A1234  -> Valid (1 letter)
  - K03AB1234  -> Invalid (Missing state char)
  - KA3AB1234  -> Invalid (Only 1 digit in district code)
  - KA03AB123  -> Invalid (Only 3 digits in serial number)

Violation Code Format: PV followed by exactly 2 digits: PV[0-9]{2}
Examples:
  - PV01 -> Valid
  - PV12 -> Valid
  - PV1  -> Invalid
  - PV123 -> Invalid
"""

import re
import sys
from typing import Dict, List, Tuple, Any

# ==========================================
# 1. VEHICLE REGISTRATION NUMBER DFA & REGEX
# ==========================================

VEHICLE_REGEX = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'

class VehicleRegistrationDFA:
    """
    DFA implementation for Karnataka Vehicle Number: [A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}
    """
    def __init__(self):
        self.states = {'q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q_dead'}
        self.start_state = 'q0'
        self.accept_states = {'q10'}
        self.dead_state = 'q_dead'

    def is_uppercase_letter(self, char: str) -> bool:
        return 'A' <= char <= 'Z'

    def is_digit(self, char: str) -> bool:
        return '0' <= char <= '9'

    def transition(self, current_state: str, char: str) -> str:
        """Delta transition function"""
        if current_state == 'q0':
            # 1st State Letter (e.g., 'K')
            return 'q1' if self.is_uppercase_letter(char) else self.dead_state

        elif current_state == 'q1':
            # 2nd State Letter (e.g., 'A')
            return 'q2' if self.is_uppercase_letter(char) else self.dead_state

        elif current_state == 'q2':
            # 1st District Digit (e.g., '0')
            return 'q3' if self.is_digit(char) else self.dead_state

        elif current_state == 'q3':
            # 2nd District Digit (e.g., '3')
            return 'q4' if self.is_digit(char) else self.dead_state

        elif current_state == 'q4':
            # 1st Series Letter (e.g., 'A' or 'C')
            return 'q5' if self.is_uppercase_letter(char) else self.dead_state

        elif current_state == 'q5':
            # Branching state:
            # - If another letter -> 2-letter series: go to q6
            # - If digit -> 1-letter series: this char is digit 1 of 4: go to q7
            if self.is_uppercase_letter(char):
                return 'q6'
            elif self.is_digit(char):
                return 'q7'
            return self.dead_state

        elif current_state == 'q6':
            # 2-letter series completed. Expects digit 1 of 4
            return 'q7' if self.is_digit(char) else self.dead_state

        elif current_state == 'q7':
            # Expects digit 2 of 4
            return 'q8' if self.is_digit(char) else self.dead_state

        elif current_state == 'q8':
            # Expects digit 3 of 4
            return 'q9' if self.is_digit(char) else self.dead_state

        elif current_state == 'q9':
            # Expects digit 4 of 4
            return 'q10' if self.is_digit(char) else self.dead_state

        elif current_state == 'q10':
            # Accept state reached; any extra character goes to dead state
            return self.dead_state

        return self.dead_state

    def validate(self, input_string: str) -> Tuple[bool, List[Dict[str, str]], str]:
        """
        Executes the DFA on input_string and returns:
        (is_valid, transition_trace, explanation)
        """
        trace = []
        current_state = self.start_state
        normalized = input_string.strip().upper()

        if not normalized:
            return False, [], "Input string is empty."

        for idx, char in enumerate(normalized):
            next_state = self.transition(current_state, char)
            trace.append({
                "step": idx + 1,
                "character": char,
                "from_state": current_state,
                "to_state": next_state
            })
            current_state = next_state
            if current_state == self.dead_state:
                # Still trace remaining chars to show failure point
                for rem_idx in range(idx + 1, len(normalized)):
                    trace.append({
                        "step": rem_idx + 1,
                        "character": normalized[rem_idx],
                        "from_state": self.dead_state,
                        "to_state": self.dead_state
                    })
                break

        is_accepted = current_state in self.accept_states
        if is_accepted:
            explanation = f"DFA Accepted: Ended in accepting state {current_state}."
        else:
            explanation = f"DFA Rejected: Final state is {current_state} (expected {self.accept_states})."

        return is_accepted, trace, explanation

def validate_vehicle_regex(input_string: str) -> Tuple[bool, str]:
    normalized = input_string.strip().upper()
    match = re.match(VEHICLE_REGEX, normalized)
    if match:
        return True, f"Regex Match: '{normalized}' matches {VEHICLE_REGEX}"
    return False, f"Regex Mismatch: '{normalized}' does not match {VEHICLE_REGEX}"


# ==========================================
# 2. VIOLATION CODE DFA & REGEX
# ==========================================

VIOLATION_REGEX = r'^PV[0-9]{2}$'

class ViolationCodeDFA:
    """
    DFA implementation for Violation Code: PV followed by exactly 2 digits (PV[0-9]{2})
    States:
      s0: Start
      s1: 'P' seen
      s2: 'V' seen
      s3: 1st digit seen
      s4: 2nd digit seen (Accepting)
      s_dead: Trap/dead state
    """
    def __init__(self):
        self.start_state = 's0'
        self.accept_states = {'s4'}
        self.dead_state = 's_dead'

    def transition(self, current_state: str, char: str) -> str:
        if current_state == 's0':
            return 's1' if char == 'P' else self.dead_state
        elif current_state == 's1':
            return 's2' if char == 'V' else self.dead_state
        elif current_state == 's2':
            return 's3' if '0' <= char <= '9' else self.dead_state
        elif current_state == 's3':
            return 's4' if '0' <= char <= '9' else self.dead_state
        elif current_state == 's4':
            return self.dead_state
        return self.dead_state

    def validate(self, input_string: str) -> Tuple[bool, List[Dict[str, str]], str]:
        trace = []
        current_state = self.start_state
        normalized = input_string.strip().upper()

        if not normalized:
            return False, [], "Input violation code is empty."

        for idx, char in enumerate(normalized):
            next_state = self.transition(current_state, char)
            trace.append({
                "step": idx + 1,
                "character": char,
                "from_state": current_state,
                "to_state": next_state
            })
            current_state = next_state
            if current_state == self.dead_state:
                for rem_idx in range(idx + 1, len(normalized)):
                    trace.append({
                        "step": rem_idx + 1,
                        "character": normalized[rem_idx],
                        "from_state": self.dead_state,
                        "to_state": self.dead_state
                    })
                break

        is_accepted = current_state in self.accept_states
        if is_accepted:
            explanation = f"DFA Accepted: Ended in accepting state {current_state}."
        else:
            explanation = f"DFA Rejected: Final state is {current_state} (expected {self.accept_states})."

        return is_accepted, trace, explanation

def validate_violation_regex(input_string: str) -> Tuple[bool, str]:
    normalized = input_string.strip().upper()
    match = re.match(VIOLATION_REGEX, normalized)
    if match:
        return True, f"Regex Match: '{normalized}' matches {VIOLATION_REGEX}"
    return False, f"Regex Mismatch: '{normalized}' does not match {VIOLATION_REGEX}"


# ==========================================
# 3. VERIFICATION & TEST SUITE RUNNER
# ==========================================

def run_test_suite():
    print("=" * 75)
    print("AUTOMATA THEORY VALIDATION SUITE: PART A DEMONSTRATION")
    print("Karnataka Vehicle Plate: [A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}")
    print("Parking Violation Code: PV[0-9]{2}")
    print("=" * 75)

    vehicle_dfa = VehicleRegistrationDFA()
    violation_dfa = ViolationCodeDFA()

    test_vehicles = [
        ("KA03AB1234", True, "Standard 2-letter series valid plate"),
        ("KA05C5678",  True, "Standard 1-letter series valid plate"),
        ("KA03A1234",  True, "Single letter series valid plate"),
        ("K03AB1234",  False, "Missing state character (Only 1 state letter)"),
        ("KA3AB1234",  False, "Only 1 district digit instead of 2"),
        ("KA03AB123",  False, "Only 3 digits in serial number instead of 4"),
        ("KA011234",   False, "Missing series alphabet section"),
        ("KA01ABC1234",False, "3 series alphabets exceeds maximum 2"),
        ("MH02CD9999", True, "Valid plate with another state code"),
        ("ka03ab1234", True, "Lower case normalized to valid plate"),
        ("KA01@1234",  False, "Contains invalid symbol @"),
        ("KA01AB12345",False, "5 digits in serial number exceeds maximum 4"),
    ]

    print("\n[SECTION 1: VEHICLE REGISTRATION VALIDATION]")
    print(f"{'Input':<15} | {'Expected':<8} | {'DFA Result':<10} | {'Regex Result':<12} | {'Agreement':<10} | {'Status'}")
    print("-" * 75)

    vehicle_all_passed = True
    for plate, expected, desc in test_vehicles:
        dfa_res, trace, _ = vehicle_dfa.validate(plate)
        regex_res, _ = validate_vehicle_regex(plate)
        agreement = (dfa_res == regex_res)
        passed = (dfa_res == expected) and agreement
        if not passed:
            vehicle_all_passed = False

        status_str = "PASS [OK]" if passed else "FAIL [X]"
        print(f"{plate:<15} | {str(expected):<8} | {str(dfa_res):<10} | {str(regex_res):<12} | {str(agreement):<10} | {status_str}")

    test_violations = [
        ("PV01",  True,  "Valid 2-digit violation code 01"),
        ("PV12",  True,  "Valid 2-digit violation code 12"),
        ("PV1",   False, "Invalid: only 1 digit"),
        ("PV123", False, "Invalid: 3 digits exceeds 2"),
        ("pv05",  True,  "Valid lowercase normalized to uppercase"),
        ("P01",   False, "Missing 'V' prefix letter"),
        ("VX01",  False, "Wrong prefix"),
        ("PV99",  True,  "Valid high range violation code"),
    ]

    print("\n[SECTION 2: VIOLATION CODE VALIDATION]")
    print(f"{'Input':<15} | {'Expected':<8} | {'DFA Result':<10} | {'Regex Result':<12} | {'Agreement':<10} | {'Status'}")
    print("-" * 75)

    violation_all_passed = True
    for code, expected, desc in test_violations:
        dfa_res, trace, _ = violation_dfa.validate(code)
        regex_res, _ = validate_violation_regex(code)
        agreement = (dfa_res == regex_res)
        passed = (dfa_res == expected) and agreement
        if not passed:
            violation_all_passed = False

        status_str = "PASS [OK]" if passed else "FAIL [X]"
        print(f"{code:<15} | {str(expected):<8} | {str(dfa_res):<10} | {str(regex_res):<12} | {str(agreement):<10} | {status_str}")

    print("\n[SECTION 3: SAMPLE DFA TRANSITION TRACE]")
    sample_plate = "KA03AB1234"
    valid, trace, expl = vehicle_dfa.validate(sample_plate)
    print(f"Tracing vehicle plate: {sample_plate}")
    for step in trace:
        print(f"  Step {step['step']:2d}: Char '{step['character']}' -> Transition: ({step['from_state']} -> {step['to_state']})")
    print(f"Final Decision: {expl}\n")

    if vehicle_all_passed and violation_all_passed:
        print(">>> ALL DFA AND REGEX TESTS PASSED WITH 100% MATHEMATICAL AGREEMENT <<<")
    else:
        print(">>> SOME TESTS FAILED <<<")

if __name__ == "__main__":
    run_test_suite()
