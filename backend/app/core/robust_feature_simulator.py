from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


HTML_FAILURE_FEATURES = [
    "F10",
    "F13",
    "F14",
    "F15",
    "F16",
    "F17",
    "F19",
    "F20",
    "F21",
    "F22",
    "F23",
    "F28",
    "F29",
    "F30",
]
WHOIS_RDAP_FAILURE_FEATURES = ["F09", "F24"]
DNS_FAILURE_FEATURES = ["F25"]
FAILURE_SIMULATION_GROUPS = {
    "html": HTML_FAILURE_FEATURES,
    "whois_or_rdap": WHOIS_RDAP_FAILURE_FEATURES,
    "dns": DNS_FAILURE_FEATURES,
}
FAILURE_RATES = {
    "mild": 0.05,
    "moderate": 0.10,
    "strong": 0.15,
}
FAILURE_FEATURES = (
    HTML_FAILURE_FEATURES + WHOIS_RDAP_FAILURE_FEATURES + DNS_FAILURE_FEATURES
)


def simulate_extraction_failures(
    x: pd.DataFrame,
    random_state: int = 42,
    failure_rate: float = 0.15,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    if not 0 <= failure_rate <= 1:
        raise ValueError("failure_rate harus berada pada rentang 0 sampai 1.")

    missing = [feature for feature in FAILURE_FEATURES if feature not in x.columns]
    if missing:
        raise ValueError("Fitur simulasi tidak ditemukan: " + ", ".join(missing))

    rng = np.random.default_rng(random_state)
    simulated = x.copy(deep=True)
    masks: dict[str, np.ndarray] = {}
    imputed_counts: dict[str, int] = {}

    for feature in FAILURE_FEATURES:
        mask = rng.random(len(simulated)) < failure_rate
        simulated.loc[mask, feature] = 0
        masks[feature] = mask
        imputed_counts[feature] = int(mask.sum())

    rows_with_any_failure = np.logical_or.reduce(list(masks.values()))
    metadata = {
        "failure_rate": failure_rate,
        "unknown_encoding": 0,
        "simulated_feature_groups": FAILURE_SIMULATION_GROUPS,
        "imputed_counts": imputed_counts,
        "rows_with_any_failure": int(rows_with_any_failure.sum()),
        "total_rows": int(len(simulated)),
    }

    return simulated.astype(int), metadata


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
    augmented_x = pd.concat([x, simulated], ignore_index=True)
    augmented_y = pd.concat(
        [y.reset_index(drop=True), y.reset_index(drop=True)],
        ignore_index=True,
    )
    metadata["augmented_rows"] = int(len(augmented_x))

    return augmented_x.astype(int), augmented_y.astype(int), metadata
