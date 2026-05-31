from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


# Symbolic groups
HTML_FAILURE_FEATURES = [
    "F10", "F13", "F14", "F15", "F16", "F17", "F19", "F20", "F21", "F22", "F23", "F28", "F29", "F30"
]
WHOIS_RDAP_FAILURE_FEATURES = ["F09", "F24"]
DNS_FAILURE_FEATURES = ["F25"]

# Augmented raw numeric groups
HTML_FAILURE_RAW = [
    "nb_hyperlinks", "ratio_intHyperlinks", "ratio_extHyperlinks", "ratio_nullHyperlinks",
    "nb_extCSS", "ratio_extRedirection", "ratio_extErrors", "login_form",
    "external_favicon", "iframe", "popup_window", "safe_anchor", "empty_title",
    "domain_in_title", "domain_with_copyright", "submit_email", "sfh", "onmouseover", "right_clic"
]
WHOIS_RDAP_FAILURE_RAW = ["domain_registration_length", "domain_age"]
DNS_FAILURE_RAW = ["dns_record"]

FAILURE_SIMULATION_GROUPS = {
    "html": HTML_FAILURE_FEATURES + HTML_FAILURE_RAW,
    "whois_or_rdap": WHOIS_RDAP_FAILURE_FEATURES + WHOIS_RDAP_FAILURE_RAW,
    "dns": DNS_FAILURE_FEATURES + DNS_FAILURE_RAW,
}

FAILURE_RATES = {
    "mild": 0.05,
    "moderate": 0.10,
    "strong": 0.15,
}

ALL_FAILURE_COLS = (
    HTML_FAILURE_FEATURES + HTML_FAILURE_RAW +
    WHOIS_RDAP_FAILURE_FEATURES + WHOIS_RDAP_FAILURE_RAW +
    DNS_FAILURE_FEATURES + DNS_FAILURE_RAW
)


def simulate_extraction_failures(
    x: pd.DataFrame,
    random_state: int = 42,
    failure_rate: float = 0.15,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    if not 0 <= failure_rate <= 1:
        raise ValueError("failure_rate harus berada pada rentang 0 sampai 1.")

    # Only simulate for columns actually present in x
    present_failure_cols = [col for col in ALL_FAILURE_COLS if col in x.columns]

    rng = np.random.default_rng(random_state)
    simulated = x.copy(deep=True)
    masks: dict[str, np.ndarray] = {}
    imputed_counts: dict[str, int] = {}

    for feature in present_failure_cols:
        mask = rng.random(len(simulated)) < failure_rate
        # For both symbolic and numeric, setting failed features to 0
        simulated.loc[mask, feature] = 0
        masks[feature] = mask
        imputed_counts[feature] = int(mask.sum())

    rows_with_any_failure = np.logical_or.reduce(list(masks.values())) if masks else np.zeros(len(simulated), dtype=bool)
    
    metadata = {
        "failure_rate": failure_rate,
        "unknown_encoding": 0,
        "simulated_features": present_failure_cols,
        "imputed_counts": imputed_counts,
        "rows_with_any_failure": int(rows_with_any_failure.sum()),
        "total_rows": int(len(simulated)),
    }

    return simulated, metadata


def create_robust_training_data(
    x: pd.DataFrame,
    y: pd.Series,
    random_state: int = 42,
    failure_rate: float = 0.15,
) -> tuple[pd.DataFrame, pd.Series, dict[str, Any]]:
    simulated, metadata = simulate_extraction_failures(
        x=x,
        random_state=random_state,
        failure_rate=failure_rate,
    )
    # Concatenate clean training data and robust simulated data
    augmented_x = pd.concat([x, simulated], ignore_index=True)
    augmented_y = pd.concat(
        [y.reset_index(drop=True), y.reset_index(drop=True)],
        ignore_index=True,
    )
    metadata["augmented_rows"] = int(len(augmented_x))

    return augmented_x, augmented_y, metadata
