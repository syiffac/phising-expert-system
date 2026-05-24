from pathlib import Path
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = ROOT_DIR / "dataset" / "raw"


def main():
    csv_files = list(RAW_DATA_DIR.glob("*.csv"))

    if not csv_files:
        print("Tidak ada file CSV di folder dataset/raw.")
        print(f"Folder dicek: {RAW_DATA_DIR}")
        return

    dataset_path = csv_files[0]
    print(f"Dataset ditemukan: {dataset_path}")

    df = pd.read_csv(dataset_path)

    print("\nUkuran dataset:")
    print(df.shape)

    print("\nDaftar kolom:")
    for col in df.columns:
        print("-", col)

    print("\nPreview data:")
    print(df.head())

    print("\nInfo nilai kosong:")
    print(df.isnull().sum().sort_values(ascending=False).head(20))


if __name__ == "__main__":
    main()