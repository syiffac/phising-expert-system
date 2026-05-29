# Laporan Training Final Model F01-F30

## Tujuan

Training final ini membangun model Random Forest dan XGBoost pendukung hybrid expert system menggunakan fitur F01-F30 yang telah tervalidasi pada knowledge base dan rule base. Sistem pakar dengan working memory, inference engine, dan forward chaining tetap menjadi sumber penjelasan keputusan.

## Revisi Fitur untuk Input Manual

Lima fitur yang sebelumnya sulit direproduksi dari input manual diganti dengan fitur dataset yang dapat dihitung dari URL atau HTML:

| Kode | Definisi Final | Kolom Dataset | Sumber Manual |
|---|---|---|---|
| F18 | Phishing Hints | `phish_hints` | URL string dan teks HTML |
| F26 | Brand in Path | `brand_in_path` | URL string |
| F27 | Suspicious TLD | `suspecious_tld` | URL string |
| F28 | Domain in Title | `domain_in_title` | HTML parsing |
| F30 | Empty Title | `empty_title` | HTML parsing |

Revisi ini menggantikan ketergantungan pada indikator eksternal lama agar mode URL manual dapat membentuk bukti tanpa API traffic, ranking, indexing, atau blacklist. Landasan pemilihan fitur berasal dari Hannousse & Yahiouche, didukung penggunaan fitur URL/HTML/text tanpa layanan pihak ketiga oleh Aljofey et al. (Scientific Reports, 2022) dan pendekatan URL/text oleh Shaukat et al. (Sensors, 2023).

## Dataset dan Cleaning

- Dataset: `dataset/raw/dataset_phishing.csv`
- Jumlah data awal: 11430
- Duplikasi dihapus: 0
- Jumlah data setelah cleaning: 11430
- Jumlah kolom awal: 89
- Missing value sumber: 0

Tidak ada `fillna` global. Pipeline berhenti dengan error jika kolom trainable hilang atau nilai sumber fitur tidak dapat ditransformasikan secara sah. Dataset yang digunakan pada training ini tidak memiliki missing value kritis.

## Label dan Fitur

- Normalisasi label: `0 = legitimate`, `1 = phishing`
- Distribusi label: legitimate: 5715, phishing: 5715
- Total fitur final: 30
- Fitur low variance: F16, F17
- Distribusi fitur lengkap: `backend/app/ml_models/final_feature_distribution.json`

Seluruh fitur F01-F30 dibentuk dari `final_feature_mapping.json`; tidak ada fitur yang diisi nilai default karena gagal dihitung. Seluruh nilai akhir fitur dibatasi pada `-1`, `0`, dan `1`.

## Split dan Validasi

- Train size: 9144
- Test size: 2286
- Test ratio: 0.2
- Random state: 42
- Stratified: true
- Cross-validation: 5-fold stratified
- Scoring tuning utama: `f1`, agar perbandingan memperhatikan kemampuan mendeteksi kelas phishing, bukan hanya akurasi keseluruhan.

Hyperparameter tuning dilakukan menggunakan `RandomizedSearchCV` dengan ruang pencarian terbatas agar realistis dijalankan pada perangkat pengembangan.

## Hasil Evaluasi

| Model | Accuracy | Precision | Recall | F1 Score | CV F1 Mean +/- Std |
|---|---:|---:|---:|---:|---:|
| Random Forest | 0.8670 | 0.8803 | 0.8495 | 0.8646 | 0.8639 +/- 0.0083 |
| XGBoost | 0.8622 | 0.8743 | 0.8460 | 0.8599 | 0.8628 +/- 0.0053 |

- Parameter terbaik Random Forest: `{"n_estimators": 200, "min_samples_split": 5, "min_samples_leaf": 1, "max_features": "log2", "max_depth": 20}`
- Parameter terbaik XGBoost: `{"subsample": 0.9, "n_estimators": 500, "max_depth": 5, "learning_rate": 0.1, "colsample_bytree": 1.0}`
- Confusion matrix Random Forest: `[[1011, 132], [172, 971]]`
- Confusion matrix XGBoost: `[[1004, 139], [176, 967]]`

## Feature Importance

- Lima fitur teratas Random Forest: F18 (0.1227), F15 (0.0950), F14 (0.0906), F01 (0.0814), F28 (0.0808)
- Lima fitur teratas XGBoost: F18 (0.1469), F01 (0.1395), F28 (0.0994), F04 (0.0900), F14 (0.0494)
- Data lengkap: `backend/app/ml_models/final_feature_importance.json`

## Distribusi Nilai Fitur

| Fitur | -1 | 0 | 1 |
|---|---:|---:|---:|
| F01 | 1721 | 0 | 9709 |
| F02 | 2536 | 2231 | 6663 |
| F03 | 1411 | 0 | 10019 |
| F04 | 245 | 0 | 11185 |
| F05 | 75 | 0 | 11355 |
| F06 | 2314 | 0 | 9116 |
| F07 | 3950 | 6178 | 1302 |
| F08 | 750 | 0 | 10680 |
| F09 | 7781 | 46 | 3603 |
| F10 | 5054 | 0 | 6376 |
| F11 | 27 | 0 | 11403 |
| F12 | 6983 | 0 | 4447 |
| F13 | 2408 | 700 | 8322 |
| F14 | 3220 | 1925 | 6285 |
| F15 | 3906 | 3214 | 4310 |
| F16 | 0 | 0 | 11430 |
| F17 | 0 | 0 | 11430 |
| F18 | 502 | 1539 | 9389 |
| F19 | 38 | 790 | 10602 |
| F20 | 13 | 0 | 11417 |
| F21 | 16 | 0 | 11414 |
| F22 | 69 | 0 | 11361 |
| F23 | 15 | 0 | 11415 |
| F24 | 357 | 1837 | 9236 |
| F25 | 11200 | 0 | 230 |
| F26 | 56 | 0 | 11374 |
| F27 | 205 | 0 | 11225 |
| F28 | 2562 | 0 | 8868 |
| F29 | 2638 | 1378 | 7414 |
| F30 | 1426 | 0 | 10004 |

## Kesimpulan

Model terbaik berdasarkan hasil evaluasi adalah `random_forest`. Pemilihan ini didasarkan pada F1 score test set dan accuracy sebagai pemecah seri, bukan asumsi sebelum training. Model prototype lama tidak dioverwrite; artefak final disimpan menggunakan nama file baru.
