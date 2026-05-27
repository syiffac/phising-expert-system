import json
from collections import Counter
from pathlib import Path

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
FEATURES_PATH = ROOT_DIR / "backend" / "app" / "knowledge_base" / "features.json"
OUTPUT_JSON_PATH = (
    ROOT_DIR / "backend" / "app" / "knowledge_base" / "final_feature_mapping.json"
)
OUTPUT_DOC_PATH = ROOT_DIR / "docs" / "f01_f30_feature_mapping.md"


MAPPING_SPECS = {
    "F01": {
        "mapping_status": "direct",
        "dataset_columns": ["ip"],
        "transformation_type": "binary",
        "transformation_rule": "Jika ip = 1 (URL menggunakan alamat IP) maka -1; jika ip = 0 maka 1.",
        "safe_value_condition": "ip = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "ip = 1",
        "is_trainable": True,
        "notes": "Kolom ip secara langsung menyatakan penggunaan IP address pada hostname URL.",
    },
    "F02": {
        "mapping_status": "direct",
        "dataset_columns": ["length_url"],
        "transformation_type": "threshold",
        "transformation_rule": "Jika length_url < 54 maka 1; jika 54 <= length_url <= 75 maka 0; jika length_url > 75 maka -1.",
        "safe_value_condition": "length_url < 54",
        "suspicious_value_condition": "54 <= length_url <= 75",
        "danger_value_condition": "length_url > 75",
        "is_trainable": True,
        "notes": "Threshold mengikuti kategorisasi URL Length yang telah digunakan pada prototype ekstraksi URL.",
    },
    "F03": {
        "mapping_status": "direct",
        "dataset_columns": ["shortening_service"],
        "transformation_type": "binary",
        "transformation_rule": "Jika shortening_service = 1 maka -1; jika shortening_service = 0 maka 1.",
        "safe_value_condition": "shortening_service = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "shortening_service = 1",
        "is_trainable": True,
        "notes": "Kolom dataset langsung menandai penggunaan layanan pemendek URL.",
    },
    "F04": {
        "mapping_status": "direct",
        "dataset_columns": ["nb_at"],
        "transformation_type": "count_binary",
        "transformation_rule": "Jika nb_at = 0 maka 1; jika nb_at >= 1 maka -1.",
        "safe_value_condition": "nb_at = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "nb_at >= 1",
        "is_trainable": True,
        "notes": "Jumlah karakter @ dapat langsung ditransformasikan menjadi indikator keberadaan simbol @.",
    },
    "F05": {
        "mapping_status": "direct",
        "dataset_columns": ["nb_dslash"],
        "transformation_type": "binary",
        "transformation_rule": "Jika nb_dslash = 1 (double slash tambahan terdeteksi) maka -1; jika nb_dslash = 0 maka 1.",
        "safe_value_condition": "nb_dslash = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "nb_dslash = 1",
        "is_trainable": True,
        "notes": "Dataset menyediakan indikator double slash tambahan sebagai kolom biner.",
    },
    "F06": {
        "mapping_status": "direct",
        "dataset_columns": ["prefix_suffix"],
        "transformation_type": "binary",
        "transformation_rule": "Jika prefix_suffix = 1 maka -1; jika prefix_suffix = 0 maka 1.",
        "safe_value_condition": "prefix_suffix = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "prefix_suffix = 1",
        "is_trainable": True,
        "notes": "Kolom prefix_suffix mewakili penggunaan pola hubung pada domain.",
    },
    "F07": {
        "mapping_status": "direct",
        "dataset_columns": ["nb_subdomains"],
        "transformation_type": "threshold",
        "transformation_rule": "Jika nb_subdomains = 1 maka 1; jika nb_subdomains = 2 maka 0; jika nb_subdomains >= 3 maka -1.",
        "safe_value_condition": "nb_subdomains = 1",
        "suspicious_value_condition": "nb_subdomains = 2",
        "danger_value_condition": "nb_subdomains >= 3",
        "is_trainable": True,
        "notes": "Nilai dataset berada pada rentang 1 sampai 3 dan dapat dikategorikan berdasarkan banyaknya subdomain.",
    },
    "F08": {
        "mapping_status": "direct",
        "dataset_columns": ["tld_in_path"],
        "transformation_type": "binary",
        "transformation_rule": "Jika tld_in_path = 1 maka -1; jika tld_in_path = 0 maka 1.",
        "safe_value_condition": "tld_in_path = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "tld_in_path = 1",
        "is_trainable": True,
        "notes": "Kolom tld_in_path secara langsung menandai pola TLD pada bagian path URL.",
    },
    "F09": {
        "mapping_status": "direct",
        "dataset_columns": ["domain_registration_length"],
        "transformation_type": "threshold",
        "transformation_rule": "Jika domain_registration_length > 365 hari maka 1; jika 0 <= domain_registration_length <= 365 hari maka -1; jika nilainya < 0 maka 0 karena informasi tidak tersedia.",
        "safe_value_condition": "domain_registration_length > 365",
        "suspicious_value_condition": "domain_registration_length < 0",
        "danger_value_condition": "0 <= domain_registration_length <= 365",
        "is_trainable": True,
        "notes": "Kolom menyimpan panjang registrasi domain dalam satuan hari; nilai negatif dipertahankan sebagai kondisi data tidak tersedia.",
    },
    "F10": {
        "mapping_status": "direct",
        "dataset_columns": ["external_favicon"],
        "transformation_type": "binary",
        "transformation_rule": "Jika external_favicon = 1 maka -1; jika external_favicon = 0 maka 1.",
        "safe_value_condition": "external_favicon = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "external_favicon = 1",
        "is_trainable": True,
        "notes": "Kolom menyatakan apakah favicon berasal dari sumber eksternal.",
    },
    "F11": {
        "mapping_status": "direct",
        "dataset_columns": ["port"],
        "transformation_type": "binary",
        "transformation_rule": "Jika port = 1 (indikator port tidak umum tersedia) maka -1; jika port = 0 maka 1.",
        "safe_value_condition": "port = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "port = 1",
        "is_trainable": True,
        "notes": "Kolom port dipetakan sebagai indikator biner penggunaan port yang mencurigakan.",
    },
    "F12": {
        "mapping_status": "direct",
        "dataset_columns": ["https_token"],
        "transformation_type": "binary",
        "transformation_rule": "Jika https_token = 1 maka -1; jika https_token = 0 maka 1.",
        "safe_value_condition": "https_token = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "https_token = 1",
        "is_trainable": True,
        "notes": "Knowledge base diselaraskan dengan kolom https_token untuk mendeteksi token HTTPS yang muncul pada bagian URL yang tidak semestinya.",
    },
    "F13": {
        "mapping_status": "direct",
        "dataset_columns": ["ratio_extMedia"],
        "transformation_type": "ratio_threshold",
        "transformation_rule": "Jika ratio_extMedia < 22 maka 1; jika 22 <= ratio_extMedia <= 61 maka 0; jika ratio_extMedia > 61 maka -1.",
        "safe_value_condition": "ratio_extMedia < 22",
        "suspicious_value_condition": "22 <= ratio_extMedia <= 61",
        "danger_value_condition": "ratio_extMedia > 61",
        "is_trainable": True,
        "notes": "Rasio media eksternal mewakili resource halaman yang diminta dari domain lain.",
    },
    "F14": {
        "mapping_status": "direct",
        "dataset_columns": ["safe_anchor"],
        "transformation_type": "ratio_threshold",
        "transformation_rule": "Jika safe_anchor < 31 maka 1; jika 31 <= safe_anchor <= 67 maka 0; jika safe_anchor > 67 maka -1.",
        "safe_value_condition": "safe_anchor < 31",
        "suspicious_value_condition": "31 <= safe_anchor <= 67",
        "danger_value_condition": "safe_anchor > 67",
        "is_trainable": True,
        "notes": "Meskipun bernama safe_anchor, definisi sumber dataset menghitung anchor tidak aman seperti #, javascript, atau mailto; rasio tinggi lebih berbahaya.",
    },
    "F15": {
        "mapping_status": "direct",
        "dataset_columns": ["links_in_tags"],
        "transformation_type": "internal_ratio_threshold",
        "transformation_rule": "Jika links_in_tags > 81 maka 1; jika 17 <= links_in_tags <= 81 maka 0; jika links_in_tags < 17 maka -1.",
        "safe_value_condition": "links_in_tags > 81",
        "suspicious_value_condition": "17 <= links_in_tags <= 81",
        "danger_value_condition": "links_in_tags < 17",
        "is_trainable": True,
        "notes": "Sumber dataset mendefinisikan fitur sebagai rasio link internal pada tag Link; rasio internal rendah lebih berbahaya.",
    },
    "F16": {
        "mapping_status": "direct",
        "dataset_columns": ["sfh"],
        "transformation_type": "binary",
        "transformation_rule": "Jika sfh = 1 maka -1; jika sfh = 0 maka 1.",
        "safe_value_condition": "sfh = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "sfh = 1",
        "is_trainable": True,
        "notes": "Kolom sfh tersedia langsung, walaupun pada dataset saat ini nilai teramati hanya 0 sehingga daya diskriminasinya perlu dicatat.",
    },
    "F17": {
        "mapping_status": "direct",
        "dataset_columns": ["submit_email"],
        "transformation_type": "binary",
        "transformation_rule": "Jika submit_email = 1 maka -1; jika submit_email = 0 maka 1.",
        "safe_value_condition": "submit_email = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "submit_email = 1",
        "is_trainable": True,
        "notes": "Kolom submit_email tersedia langsung, walaupun pada dataset saat ini nilai teramati hanya 0 sehingga daya diskriminasinya perlu dicatat.",
    },
    "F18": {
        "mapping_status": "derived",
        "dataset_columns": ["abnormal_subdomain", "random_domain"],
        "transformation_type": "composite_binary",
        "transformation_rule": "Jika abnormal_subdomain = 1 atau random_domain = 1 maka -1; jika keduanya = 0 maka 1.",
        "safe_value_condition": "abnormal_subdomain = 0 AND random_domain = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "abnormal_subdomain = 1 OR random_domain = 1",
        "is_trainable": True,
        "notes": "Abnormal URL diturunkan dari indikator struktur subdomain abnormal atau domain acak yang tersedia pada dataset.",
    },
    "F19": {
        "mapping_status": "direct",
        "dataset_columns": ["nb_redirection"],
        "transformation_type": "threshold",
        "transformation_rule": "Jika nb_redirection <= 1 maka 1; jika 2 <= nb_redirection <= 3 maka 0; jika nb_redirection >= 4 maka -1.",
        "safe_value_condition": "nb_redirection <= 1",
        "suspicious_value_condition": "2 <= nb_redirection <= 3",
        "danger_value_condition": "nb_redirection >= 4",
        "is_trainable": True,
        "notes": "Jumlah redirect tersedia langsung dan dapat dikategorikan berdasarkan tingkat berlebihan.",
    },
    "F20": {
        "mapping_status": "direct",
        "dataset_columns": ["onmouseover"],
        "transformation_type": "binary",
        "transformation_rule": "Jika onmouseover = 1 maka -1; jika onmouseover = 0 maka 1.",
        "safe_value_condition": "onmouseover = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "onmouseover = 1",
        "is_trainable": True,
        "notes": "Kolom langsung menunjukkan penggunaan event onmouseover yang relevan dengan manipulasi tampilan URL.",
    },
    "F21": {
        "mapping_status": "direct",
        "dataset_columns": ["right_clic"],
        "transformation_type": "binary",
        "transformation_rule": "Jika right_clic = 1 maka -1; jika right_clic = 0 maka 1.",
        "safe_value_condition": "right_clic = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "right_clic = 1",
        "is_trainable": True,
        "notes": "Nama kolom dataset menggunakan right_clic dan memetakan gejala klik kanan dinonaktifkan.",
    },
    "F22": {
        "mapping_status": "direct",
        "dataset_columns": ["popup_window"],
        "transformation_type": "binary",
        "transformation_rule": "Jika popup_window = 1 maka -1; jika popup_window = 0 maka 1.",
        "safe_value_condition": "popup_window = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "popup_window = 1",
        "is_trainable": True,
        "notes": "Kolom dataset langsung menunjukkan keberadaan pop-up window.",
    },
    "F23": {
        "mapping_status": "direct",
        "dataset_columns": ["iframe"],
        "transformation_type": "binary",
        "transformation_rule": "Jika iframe = 1 maka -1; jika iframe = 0 maka 1.",
        "safe_value_condition": "iframe = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "iframe = 1",
        "is_trainable": True,
        "notes": "Kolom dataset langsung menunjukkan keberadaan iframe.",
    },
    "F24": {
        "mapping_status": "direct",
        "dataset_columns": ["domain_age"],
        "transformation_type": "threshold",
        "transformation_rule": "Jika domain_age >= 180 hari maka 1; jika 0 <= domain_age < 180 hari maka -1; jika domain_age < 0 maka 0 karena informasi tidak tersedia.",
        "safe_value_condition": "domain_age >= 180",
        "suspicious_value_condition": "domain_age < 0",
        "danger_value_condition": "0 <= domain_age < 180",
        "is_trainable": True,
        "notes": "Umur domain tersedia dalam hari; nilai negatif tidak dipaksa aman dan diperlakukan sebagai tidak diketahui.",
    },
    "F25": {
        "mapping_status": "direct",
        "dataset_columns": ["dns_record"],
        "transformation_type": "binary",
        "transformation_rule": "Jika dns_record = 1 (domain memiliki DNS record) maka 1; jika dns_record = 0 maka -1.",
        "safe_value_condition": "dns_record = 1",
        "suspicious_value_condition": None,
        "danger_value_condition": "dns_record = 0",
        "is_trainable": True,
        "notes": "Sumber dataset menyatakan DNS record yang hilang sebagai indikator phishing; mapping mempertahankan arti keberadaan record.",
    },
    "F26": {
        "mapping_status": "direct",
        "dataset_columns": ["web_traffic"],
        "transformation_type": "rank_threshold",
        "transformation_rule": "Jika 1 <= web_traffic <= 100000 maka 1; jika web_traffic > 100000 maka 0; jika web_traffic = 0 maka -1.",
        "safe_value_condition": "1 <= web_traffic <= 100000",
        "suspicious_value_condition": "web_traffic > 100000",
        "danger_value_condition": "web_traffic = 0",
        "is_trainable": True,
        "notes": "Web traffic diperlakukan sebagai ranking; nol menunjukkan ranking tidak tersedia.",
    },
    "F27": {
        "mapping_status": "direct",
        "dataset_columns": ["page_rank"],
        "transformation_type": "score_threshold",
        "transformation_rule": "Jika page_rank >= 5 maka 1; jika 3 <= page_rank < 5 maka 0; jika page_rank < 3 maka -1.",
        "safe_value_condition": "page_rank >= 5",
        "suspicious_value_condition": "3 <= page_rank < 5",
        "danger_value_condition": "page_rank < 3",
        "is_trainable": True,
        "notes": "Dataset menyediakan page_rank pada skala 0 sampai 10; threshold memisahkan skor rendah, menengah, dan tinggi.",
    },
    "F28": {
        "mapping_status": "direct",
        "dataset_columns": ["google_index"],
        "transformation_type": "binary",
        "transformation_rule": "Jika google_index = 1 (halaman terindeks Google) maka 1; jika google_index = 0 maka -1.",
        "safe_value_condition": "google_index = 1",
        "suspicious_value_condition": None,
        "danger_value_condition": "google_index = 0",
        "is_trainable": True,
        "notes": "Sumber dataset menyatakan halaman yang tidak terindeks Google sebagai indikator phishing.",
    },
    "F29": {
        "mapping_status": "direct",
        "dataset_columns": ["ratio_extHyperlinks"],
        "transformation_type": "threshold",
        "transformation_rule": "Deteksi skala ratio_extHyperlinks terlebih dahulu. Jika nilai maksimum <= 1: nilai <= 0.30 maka 1, 0.30 < nilai <= 0.50 maka 0, dan nilai > 0.50 maka -1. Jika nilai maksimum > 1: nilai <= 30 maka 1, 30 < nilai <= 50 maka 0, dan nilai > 50 maka -1.",
        "safe_value_condition": "ratio_extHyperlinks <= 0.30 atau <= 30, tergantung skala dataset",
        "suspicious_value_condition": "0.30 < ratio_extHyperlinks <= 0.50 atau 30 < ratio_extHyperlinks <= 50",
        "danger_value_condition": "ratio_extHyperlinks > 0.50 atau > 50",
        "is_trainable": True,
        "notes": "Kolom ratio_extHyperlinks tersedia langsung; dataset saat ini menggunakan skala 0 sampai 1 (nilai maksimum teramati 1.0).",
    },
    "F30": {
        "mapping_status": "direct",
        "dataset_columns": ["statistical_report"],
        "transformation_type": "binary_indicator",
        "transformation_rule": "Jika statistical_report = 0 maka 1; jika statistical_report > 0 maka -1.",
        "safe_value_condition": "statistical_report = 0",
        "suspicious_value_condition": None,
        "danger_value_condition": "statistical_report > 0",
        "is_trainable": True,
        "notes": "Nilai nonnol menunjukkan indikator laporan statistik/blacklist pada dataset.",
    },
}


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")

    return pd.read_csv(DATASET_PATH)


def load_features() -> list[dict]:
    if not FEATURES_PATH.exists():
        raise FileNotFoundError(f"Knowledge base fitur tidak ditemukan: {FEATURES_PATH}")

    with open(FEATURES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def build_mapping(features: list[dict], dataset_columns: list[str]) -> list[dict]:
    columns = set(dataset_columns)
    mapping = []

    for feature in features:
        feature_code = feature["code"]

        if feature_code not in MAPPING_SPECS:
            raise ValueError(f"Spesifikasi mapping tidak tersedia untuk {feature_code}.")

        spec = MAPPING_SPECS[feature_code]
        missing_columns = [
            column for column in spec["dataset_columns"] if column not in columns
        ]

        if spec["is_trainable"] and missing_columns:
            raise ValueError(
                f"Kolom dataset untuk {feature_code} tidak ditemukan: "
                + ", ".join(missing_columns)
            )

        mapping.append(
            {
                "feature_code": feature_code,
                "feature_name": feature["name"],
                **spec,
            }
        )

    return mapping


def write_json_mapping(mapping: list[dict]) -> None:
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as file:
        json.dump(mapping, file, indent=2, ensure_ascii=True)
        file.write("\n")


def markdown_table_row(item: dict) -> str:
    columns = ", ".join(item["dataset_columns"]) or "-"
    transformation = item["transformation_rule"] or "Tidak ada transformasi valid."
    notes = item["notes"].replace("|", "/")

    return (
        f"| {item['feature_code']} | {item['feature_name']} | "
        f"{item['mapping_status']} | {columns} | {transformation} | "
        f"{'Ya' if item['is_trainable'] else 'Tidak'} | {notes} |"
    )


def write_documentation(
    mapping: list[dict],
    dataset: pd.DataFrame,
    dataset_columns: list[str],
) -> None:
    status_counts = Counter(item["mapping_status"] for item in mapping)
    trainable_count = sum(1 for item in mapping if item["is_trainable"])
    columns_text = ", ".join(f"`{column}`" for column in dataset_columns)
    table_rows = "\n".join(markdown_table_row(item) for item in mapping)

    content = f"""# Mapping Fitur Sistem Pakar F01-F30

## Tujuan

Dokumen ini memetakan kolom dataset asli ke fitur/gejala sistem pakar F01-F30 sebagai dasar penyusunan data training final. Mapping hanya menggunakan kolom yang tersedia atau transformasi yang eksplisit; fitur yang belum memiliki sumber valid tidak diisi dengan nilai default.

## Ringkasan Dataset

- Sumber data: `dataset/raw/dataset_phishing.csv`
- Jumlah baris: {len(dataset)}
- Jumlah kolom: {len(dataset_columns)}
- Kolom dataset: {columns_text}

## Ringkasan Mapping

- Total fitur F01-F30: {len(mapping)}
- Fitur trainable: {trainable_count}
- Direct: {status_counts.get('direct', 0)}
- Derived: {status_counts.get('derived', 0)}
- External required: {status_counts.get('external_required', 0)}
- Unmapped: {status_counts.get('unmapped', 0)}

F08, F12, dan F29 telah diselaraskan dengan kolom `tld_in_path`, `https_token`, dan `ratio_extHyperlinks`. Perubahan definisi knowledge base ini membuat ketiganya dapat ditransformasikan langsung dari dataset tanpa menggunakan nilai default.

Rule base terkait kini berjumlah 21 rule: R08 diperbarui untuk TLD in Path, R11 mempertahankan indikator HTTPS Token dengan penjelasan baru, dan R21 ditambahkan untuk External Hyperlink Ratio.

Rujukan definisi kandidat kolom: Hannousse & Yahiouche, *Web page phishing detection*, https://arxiv.org/abs/2010.12847.

## Tabel Mapping

| Kode | Nama Fitur | Status Mapping | Kolom Dataset | Transformasi | Trainable | Catatan |
|---|---|---|---|---|---|---|
{table_rows}
"""

    with open(OUTPUT_DOC_PATH, "w", encoding="utf-8") as file:
        file.write(content)


def main() -> None:
    dataset = load_dataset()
    features = load_features()
    dataset_columns = dataset.columns.tolist()

    print(f"Dataset: {DATASET_PATH}")
    print(f"Jumlah baris: {len(dataset)}")
    print(f"Jumlah kolom: {len(dataset_columns)}")
    print("\nDaftar seluruh kolom dataset:")

    for column in dataset_columns:
        print(f"- {column}")

    mapping = build_mapping(features, dataset_columns)
    write_json_mapping(mapping)
    write_documentation(mapping, dataset, dataset_columns)

    status_counts = Counter(item["mapping_status"] for item in mapping)
    trainable_count = sum(1 for item in mapping if item["is_trainable"])

    print("\nRingkasan mapping F01-F30:")
    print(f"- Total fitur: {len(mapping)}")
    print(f"- Trainable: {trainable_count}")
    print(f"- Direct: {status_counts.get('direct', 0)}")
    print(f"- Derived: {status_counts.get('derived', 0)}")
    print(f"- External required: {status_counts.get('external_required', 0)}")
    print(f"- Unmapped: {status_counts.get('unmapped', 0)}")
    print(f"\nJSON dibuat: {OUTPUT_JSON_PATH}")
    print(f"Dokumentasi dibuat: {OUTPUT_DOC_PATH}")


if __name__ == "__main__":
    main()
