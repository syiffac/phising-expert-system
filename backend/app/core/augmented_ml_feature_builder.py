import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.core.final_feature_builder import (
    EXPECTED_FEATURES,
    build_final_feature_dataframe,
)

CORE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CORE_DIR.parent
MODEL_DIR = BACKEND_DIR / "ml_models"

# 60 manual-reproducible raw/numeric features
RAW_ML_FEATURE_COLS = [
    "length_url",
    "length_hostname",
    "nb_dots",
    "nb_hyphens",
    "nb_at",
    "nb_qm",
    "nb_and",
    "nb_or",
    "nb_eq",
    "nb_underscore",
    "nb_tilde",
    "nb_percent",
    "nb_slash",
    "nb_star",
    "nb_colon",
    "nb_comma",
    "nb_semicolumn",
    "nb_dollar",
    "nb_space",
    "nb_www",
    "nb_com",
    "nb_dslash",
    "http_in_path",
    "https_token",
    "ratio_digits_url",
    "ratio_digits_host",
    "punycode",
    "port",
    "tld_in_path",
    "tld_in_subdomain",
    "nb_subdomains",
    "prefix_suffix",
    "shortest_word_host",
    "longest_words_raw",
    "longest_word_path",
    "phish_hints",
    "nb_hyperlinks",
    "ratio_intHyperlinks",
    "ratio_extHyperlinks",
    "ratio_nullHyperlinks",
    "nb_extCSS",
    "ratio_extRedirection",
    "ratio_extErrors",
    "login_form",
    "external_favicon",
    "iframe",
    "popup_window",
    "safe_anchor",
    "empty_title",
    "domain_in_title",
    "domain_with_copyright",
    "suspecious_tld",
    "brand_in_path",
    "brand_in_subdomain",
    "submit_email",
    "sfh",
    "onmouseover",
    "right_clic",
    "dns_record",
    "domain_registration_length",
    "domain_age"
]

AUGMENTED_FEATURES = EXPECTED_FEATURES + RAW_ML_FEATURE_COLS


def build_symbolic_features(df: pd.DataFrame) -> pd.DataFrame:
    """Mengubah dataset raw ke F01-F30 symbolic features (-1, 0, 1)."""
    return build_final_feature_dataframe(df)


def build_augmented_ml_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Menggabungkan F01-F30 symbolic dengan raw numeric features dari dataset.
    Melakukan casting aman ke format float/int.
    """
    # 1. Build symbolic F01-F30
    symbolic_df = build_symbolic_features(df)
    
    # 2. Extract raw features
    raw_extracted = {}
    for col in RAW_ML_FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Kolom raw '{col}' tidak ditemukan di dataset.")
        # Simpan sebagai numeric, fillna dengan 0 jika ada missing value tak terduga
        series = pd.to_numeric(df[col], errors="coerce").fillna(0)
        raw_extracted[col] = series
        
    raw_df = pd.DataFrame(raw_extracted, index=df.index)
    
    # 3. Concatenate
    augmented_df = pd.concat([symbolic_df, raw_df], axis=1)
    
    # Validation against expected columns order
    augmented_df = augmented_df[AUGMENTED_FEATURES]
    
    return augmented_df


def get_augmented_feature_columns() -> list[str]:
    """Mengembalikan daftar semua fitur augmented (symbolic + raw)."""
    return list(AUGMENTED_FEATURES)


def validate_augmented_features(x: pd.DataFrame) -> None:
    """Validasi akhir kesesuaian input terhadap target leakage dan format."""
    expected = get_augmented_feature_columns()
    if list(x.columns) != expected:
        raise ValueError(
            f"Kolom dataframe tidak cocok dengan skema augmented. "
            f"Ditemukan {len(x.columns)} kolom, seharusnya {len(expected)}."
        )
        
    leakage_keywords = {"status", "target", "label", "url_raw", "original_url"}
    leaked = [col for col in x.columns if col.lower() in leakage_keywords]
    if leaked:
        raise ValueError(f"Ditemukan potensi target leakage pada kolom: {leaked}")
        
    # Validasi symbolic F01-F30
    for col in EXPECTED_FEATURES:
        unique_vals = set(x[col].unique())
        invalid = unique_vals - {-1, 0, 1}
        if invalid:
            raise ValueError(f"Kolom symbolic '{col}' mengandung nilai tidak valid: {invalid}")
