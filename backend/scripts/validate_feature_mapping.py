import json
from collections import Counter
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
MAPPING_PATH = (
    ROOT_DIR / "backend" / "app" / "knowledge_base" / "final_feature_mapping.json"
)
VALID_STATUSES = {"direct", "derived", "external_required", "unmapped"}
EXPECTED_CODES = [f"F{number:02d}" for number in range(1, 31)]


def load_mapping() -> list[dict]:
    if not MAPPING_PATH.exists():
        raise FileNotFoundError(f"File mapping tidak ditemukan: {MAPPING_PATH}")

    with open(MAPPING_PATH, "r", encoding="utf-8") as file:
        mapping = json.load(file)

    if not isinstance(mapping, list):
        raise ValueError("Isi final_feature_mapping.json harus berupa array.")

    return mapping


def validate_mapping(mapping: list[dict]) -> None:
    errors = []

    if len(mapping) != 30:
        errors.append(f"Jumlah fitur harus tepat 30, ditemukan {len(mapping)}.")

    found_codes = [item.get("feature_code") for item in mapping]
    missing_codes = [code for code in EXPECTED_CODES if code not in found_codes]
    duplicate_codes = [
        code for code, count in Counter(found_codes).items() if count > 1
    ]
    unexpected_codes = [code for code in found_codes if code not in EXPECTED_CODES]

    if missing_codes:
        errors.append("Feature code belum ada: " + ", ".join(missing_codes))

    if duplicate_codes:
        errors.append("Feature code duplikat: " + ", ".join(duplicate_codes))

    if unexpected_codes:
        errors.append("Feature code tidak dikenal: " + ", ".join(unexpected_codes))

    for item in mapping:
        code = item.get("feature_code", "<tanpa kode>")
        status = item.get("mapping_status")

        if status not in VALID_STATUSES:
            errors.append(f"{code}: mapping_status tidak valid: {status}")

        if "is_trainable" not in item or not isinstance(item["is_trainable"], bool):
            errors.append(f"{code}: is_trainable harus berupa boolean.")
            continue

        if item["is_trainable"]:
            if not item.get("dataset_columns"):
                errors.append(
                    f"{code}: fitur trainable wajib memiliki dataset_columns."
                )

            if not item.get("transformation_rule"):
                errors.append(
                    f"{code}: fitur trainable wajib memiliki transformation_rule."
                )

            if status not in {"direct", "derived"}:
                errors.append(
                    f"{code}: fitur trainable harus berstatus direct atau derived."
                )
        elif status in {"direct", "derived"}:
            errors.append(
                f"{code}: fitur direct/derived harus ditandai trainable."
            )

    invalid_unmapped = [
        item.get("feature_code", "<tanpa kode>")
        for item in mapping
        if item.get("mapping_status") == "unmapped"
    ]
    invalid_external = [
        item.get("feature_code", "<tanpa kode>")
        for item in mapping
        if item.get("mapping_status") == "external_required"
    ]

    if invalid_unmapped:
        errors.append(
            "Mapping final tidak boleh menyisakan fitur unmapped: "
            + ", ".join(invalid_unmapped)
        )

    if invalid_external:
        errors.append(
            "Mapping final tidak boleh menyisakan fitur external_required: "
            + ", ".join(invalid_external)
        )

    if errors:
        raise ValueError("\n".join(f"- {error}" for error in errors))


def main() -> None:
    mapping = load_mapping()
    validate_mapping(mapping)

    status_counts = Counter(item["mapping_status"] for item in mapping)
    trainable_count = sum(1 for item in mapping if item["is_trainable"])

    print(f"Validasi berhasil: {MAPPING_PATH}")
    print(f"- Total fitur: {len(mapping)}")
    print(f"- Trainable: {trainable_count}")
    print(f"- Direct: {status_counts.get('direct', 0)}")
    print(f"- Derived: {status_counts.get('derived', 0)}")
    print(f"- External required: {status_counts.get('external_required', 0)}")
    print(f"- Unmapped: {status_counts.get('unmapped', 0)}")


if __name__ == "__main__":
    main()
