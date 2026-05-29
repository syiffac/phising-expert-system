import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


APP_DIR = Path(__file__).resolve().parents[1]
MAPPING_PATH = APP_DIR / "knowledge_base" / "final_feature_mapping.json"
EXPECTED_FEATURES = [f"F{number:02d}" for number in range(1, 31)]
ALLOWED_FEATURE_VALUES = {-1, 0, 1}


class FinalFeatureValidationError(ValueError):
    """Raised when final F01-F30 features cannot be constructed faithfully."""


def load_feature_mapping() -> list[dict]:
    if not MAPPING_PATH.exists():
        raise FileNotFoundError(f"Mapping final tidak ditemukan: {MAPPING_PATH}")

    with open(MAPPING_PATH, "r", encoding="utf-8") as file:
        mapping = json.load(file)

    if not isinstance(mapping, list):
        raise FinalFeatureValidationError(
            "final_feature_mapping.json harus berisi array mapping."
        )

    trainable = [item for item in mapping if item.get("is_trainable") is True]
    found_codes = [item.get("feature_code") for item in trainable]

    if found_codes != EXPECTED_FEATURES:
        raise FinalFeatureValidationError(
            "Mapping final harus memiliki tepat F01-F30 yang trainable dan terurut."
        )

    return trainable


def normalize_label(value: Any) -> int:
    if isinstance(value, str):
        value = value.strip().lower()

    if value in {"phishing", "malicious", "bad", "unsafe", "1", 1, -1}:
        return 1

    if value in {"legitimate", "benign", "safe", "normal", "0", 0}:
        return 0

    raise FinalFeatureValidationError(f"Label status tidak dikenali: {value!r}")


def _require_columns(df: pd.DataFrame, columns: list[str], feature_code: str) -> None:
    missing = [column for column in columns if column not in df.columns]
    if missing:
        raise FinalFeatureValidationError(
            f"{feature_code}: kolom dataset tidak tersedia: {', '.join(missing)}."
        )


def _numeric_column(df: pd.DataFrame, column: str, feature_code: str) -> pd.Series:
    series = pd.to_numeric(df[column], errors="coerce")
    missing_count = int(series.isna().sum())
    if missing_count:
        raise FinalFeatureValidationError(
            f"{feature_code}: kolom {column} memiliki {missing_count} nilai kosong "
            "atau non-numerik; transformasi tidak dapat dilakukan tanpa asumsi."
        )
    return series


def _binary_danger_indicator(
    series: pd.Series, feature_code: str, source_column: str
) -> pd.Series:
    invalid = sorted(set(series.unique()) - {0, 1})
    if invalid:
        raise FinalFeatureValidationError(
            f"{feature_code}: {source_column} harus biner 0/1, ditemukan {invalid}."
        )
    return series.map({0: 1, 1: -1}).astype(int)


def _binary_safe_indicator(
    series: pd.Series, feature_code: str, source_column: str
) -> pd.Series:
    invalid = sorted(set(series.unique()) - {0, 1})
    if invalid:
        raise FinalFeatureValidationError(
            f"{feature_code}: {source_column} harus biner 0/1, ditemukan {invalid}."
        )
    return series.map({0: -1, 1: 1}).astype(int)


def _categorized(
    conditions: list[pd.Series], choices: list[int], feature_code: str
) -> pd.Series:
    result = pd.Series(
        np.select(conditions, choices, default=np.nan),
        index=conditions[0].index,
    )
    if result.isna().any():
        raise FinalFeatureValidationError(
            f"{feature_code}: terdapat nilai yang tidak tercakup aturan transformasi."
        )
    return result.astype(int)


def transform_feature(df: pd.DataFrame, mapping_item: dict) -> pd.Series:
    code = mapping_item["feature_code"]
    columns = mapping_item.get("dataset_columns", [])
    _require_columns(df, columns, code)

    if code in {
        "F01",
        "F03",
        "F05",
        "F06",
        "F08",
        "F10",
        "F11",
        "F12",
        "F16",
        "F17",
        "F20",
        "F21",
        "F22",
        "F23",
        "F26",
        "F27",
        "F30",
    }:
        values = _numeric_column(df, columns[0], code)
        return _binary_danger_indicator(values, code, columns[0])

    if code in {"F25", "F28"}:
        values = _numeric_column(df, columns[0], code)
        return _binary_safe_indicator(values, code, columns[0])

    if code == "F02":
        values = _numeric_column(df, "length_url", code)
        return _categorized(
            [values < 54, values.between(54, 75), values > 75], [1, 0, -1], code
        )

    if code == "F04":
        values = _numeric_column(df, "nb_at", code)
        if (values < 0).any():
            raise FinalFeatureValidationError("F04: nb_at tidak boleh negatif.")
        return _categorized([values == 0, values >= 1], [1, -1], code)

    if code == "F07":
        values = _numeric_column(df, "nb_subdomains", code)
        return _categorized(
            [values == 1, values == 2, values >= 3], [1, 0, -1], code
        )

    if code == "F09":
        values = _numeric_column(df, "domain_registration_length", code)
        return _categorized(
            [values > 365, values < 0, values.between(0, 365)], [1, 0, -1], code
        )

    if code in {"F13", "F14"}:
        values = _numeric_column(df, columns[0], code)
        if ((values < 0) | (values > 100)).any():
            raise FinalFeatureValidationError(
                f"{code}: {columns[0]} harus berada pada skala 0 sampai 100."
            )
        lower, upper = (22, 61) if code == "F13" else (31, 67)
        return _categorized(
            [values < lower, values.between(lower, upper), values > upper],
            [1, 0, -1],
            code,
        )

    if code == "F15":
        values = _numeric_column(df, "links_in_tags", code)
        if ((values < 0) | (values > 100)).any():
            raise FinalFeatureValidationError(
                "F15: links_in_tags harus berada pada skala 0 sampai 100."
            )
        return _categorized(
            [values > 81, values.between(17, 81), values < 17], [1, 0, -1], code
        )

    if code == "F18":
        values = _numeric_column(df, "phish_hints", code)
        if (values < 0).any():
            raise FinalFeatureValidationError("F18: phish_hints tidak boleh negatif.")
        return _categorized(
            [values == 0, values.between(1, 2), values > 2],
            [1, 0, -1],
            code,
        )

    if code == "F19":
        values = _numeric_column(df, "nb_redirection", code)
        if (values < 0).any():
            raise FinalFeatureValidationError("F19: nb_redirection tidak boleh negatif.")
        return _categorized(
            [values <= 1, values.between(2, 3), values >= 4], [1, 0, -1], code
        )

    if code == "F24":
        values = _numeric_column(df, "domain_age", code)
        return _categorized(
            [values >= 180, values < 0, values.between(0, 179)], [1, 0, -1], code
        )

    if code == "F29":
        values = _numeric_column(df, "ratio_extHyperlinks", code)
        if (values < 0).any():
            raise FinalFeatureValidationError(
                "F29: ratio_extHyperlinks tidak boleh negatif."
            )
        maximum = float(values.max())
        if maximum <= 1:
            return _categorized(
                [values <= 0.30, (values > 0.30) & (values <= 0.50), values > 0.50],
                [1, 0, -1],
                code,
            )
        if maximum <= 100:
            return _categorized(
                [values <= 30, (values > 30) & (values <= 50), values > 50],
                [1, 0, -1],
                code,
            )
        raise FinalFeatureValidationError(
            "F29: skala ratio_extHyperlinks tidak dikenali; maksimum melebihi 100."
        )

    raise FinalFeatureValidationError(
        f"{code}: transformasi belum diimplementasikan dari mapping final."
    )


def build_final_feature_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    mapping = load_feature_mapping()
    built = {
        item["feature_code"]: transform_feature(df, item)
        for item in mapping
    }
    features = pd.DataFrame(built, index=df.index)

    if features.columns.tolist() != EXPECTED_FEATURES:
        raise FinalFeatureValidationError(
            "Dataframe fitur final harus memiliki kolom F01 sampai F30."
        )
    if features.isna().any().any():
        raise FinalFeatureValidationError(
            "Dataframe fitur final mengandung missing value setelah transformasi."
        )

    unexpected_values = {
        column: sorted(set(features[column].unique()) - ALLOWED_FEATURE_VALUES)
        for column in features.columns
        if set(features[column].unique()) - ALLOWED_FEATURE_VALUES
    }
    if unexpected_values:
        raise FinalFeatureValidationError(
            f"Nilai fitur di luar -1, 0, 1 ditemukan: {unexpected_values}."
        )

    return features.astype(int)


def get_feature_value_distributions(features: pd.DataFrame) -> dict[str, dict[str, int]]:
    return {
        column: {
            str(value): int((features[column] == value).sum())
            for value in sorted(ALLOWED_FEATURE_VALUES)
        }
        for column in features.columns
    }


def get_low_variance_features(features: pd.DataFrame) -> list[str]:
    return [
        column for column in features.columns if int(features[column].nunique()) <= 1
    ]
