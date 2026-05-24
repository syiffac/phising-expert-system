from typing import Any


def compare_value(actual: Any, operator: str, expected: Any) -> bool:
    if operator == "==":
        return actual == expected
    if operator == "!=":
        return actual != expected
    if operator == ">":
        return actual > expected
    if operator == "<":
        return actual < expected
    if operator == ">=":
        return actual >= expected
    if operator == "<=":
        return actual <= expected

    return False


def is_rule_triggered(rule: dict, facts: dict) -> bool:
    conditions = rule.get("conditions", [])

    for condition in conditions:
        feature = condition.get("feature")
        operator = condition.get("operator")
        expected_value = condition.get("value")

        actual_value = facts.get(feature)

        if actual_value is None:
            return False

        if not compare_value(actual_value, operator, expected_value):
            return False

    return True


def determine_initial_status(triggered_rules: list[dict]) -> str:
    conclusions = [rule.get("conclusion") for rule in triggered_rules]

    if "phishing" in conclusions:
        return "phishing"

    if "suspicious" in conclusions:
        return "suspicious"

    return "legitimate"


def forward_chaining(facts: dict, rules: list[dict]) -> dict:
    triggered_rules = []

    for rule in rules:
        if is_rule_triggered(rule, facts):
            triggered_rules.append(rule)

    initial_status = determine_initial_status(triggered_rules)

    return {
        "initial_status": initial_status,
        "total_triggered_rules": len(triggered_rules),
        "triggered_rules": [
            {
                "code": rule.get("code"),
                "conclusion": rule.get("conclusion"),
                "severity": rule.get("severity"),
                "explanation": rule.get("explanation"),
                "source": rule.get("source"),
            }
            for rule in triggered_rules
        ],
    }