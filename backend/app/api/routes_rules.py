from fastapi import APIRouter, HTTPException

from app.core.json_loader import load_json

router = APIRouter(prefix="/api/rules", tags=["Knowledge Base - Rules"])


@router.get("/")
def get_rules():
    rules = load_json("rules.json")

    return {
        "total": len(rules),
        "data": rules,
    }


@router.get("/{rule_code}")
def get_rule_by_code(rule_code: str):
    rules = load_json("rules.json")
    rule_code = rule_code.upper()

    for rule in rules:
        if rule["code"] == rule_code:
            return rule

    raise HTTPException(status_code=404, detail="Rule tidak ditemukan")