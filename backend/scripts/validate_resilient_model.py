import json
import sys
from pathlib import Path

import joblib
import pandas as pd


BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.core.final_feature_builder import build_final_feature_dataframe, normalize_label  # noqa: E402
from app.core.robust_feature_simulator import simulate_extraction_failures  # noqa: E402


MODEL_DIR = BACKEND_DIR / "app" / "ml_models"
DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
METRICS_PATH = MODEL_DIR / "resilient_metrics.json"
MODEL_PATH = MODEL_DIR / "final_resilient_model.joblib"
MODEL_TYPE_PATH = MODEL_DIR / "final_resilient_model_type.json"
FEATURE_COLUMNS_PATH = MODEL_DIR / "final_resilient_feature_columns.json"


def load_json(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"File tidak ditemukan: {path}")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def main() -> None:
    if not METRICS_PATH.exists():
        raise FileNotFoundError(
            "resilient_metrics.json belum tersedia. Jalankan train_resilient_f01_f30_models.py."
        )

    metrics = load_json(METRICS_PATH)
    if not metrics.get("quality_gate", {}).get("passed"):
        print("Model resilient belum diterapkan karena quality gate belum terpenuhi.")
        print("Best model sementara:", metrics.get("best_model", {}).get("name"))
        print("Failed reasons:", metrics.get("quality_gate", {}).get("failed_reasons", []))
        return

    for path in (MODEL_PATH, MODEL_TYPE_PATH, FEATURE_COLUMNS_PATH):
        if not path.exists():
            raise FileNotFoundError(f"File model resilient resmi tidak tersedia: {path}")

    model = joblib.load(MODEL_PATH)
    model_type = load_json(MODEL_TYPE_PATH)
    feature_columns = load_json(FEATURE_COLUMNS_PATH)

    dataset = pd.read_csv(DATASET_PATH)
    features = build_final_feature_dataframe(dataset)
    y = dataset["status"].apply(normalize_label).astype(int)
    sample = features.iloc[[0]][feature_columns]
    robust_sample, simulation = simulate_extraction_failures(
        sample,
        random_state=99,
        failure_rate=0.5,
    )
    clean_prediction = int(model.predict(sample)[0])
    robust_prediction = int(model.predict(robust_sample[feature_columns])[0])

    print("Validasi model resilient berhasil.")
    print("sample index:", int(sample.index[0]))
    print("actual label:", int(y.iloc[0]))
    print("clean prediction:", clean_prediction)
    print("robust prediction:", robust_prediction)
    print("model type:", model_type)
    print("total features:", len(feature_columns))
    print("simulated imputed rows:", simulation["rows_with_any_failure"])


if __name__ == "__main__":
    main()
