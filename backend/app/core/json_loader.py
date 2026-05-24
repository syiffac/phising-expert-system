import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[1]
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"


def load_json(filename: str) -> list[dict[str, Any]]:
    file_path = KNOWLEDGE_BASE_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError(f"File knowledge base tidak ditemukan: {filename}")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)