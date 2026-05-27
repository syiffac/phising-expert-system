# Laporan Training Final Model F01-F30

## Tujuan

Training final ini membangun model Random Forest dan XGBoost pendukung hybrid expert system menggunakan fitur F01-F30 yang telah tervalidasi pada knowledge base dan rule base. Sistem pakar dengan working memory, inference engine, dan forward chaining tetap menjadi sumber penjelasan keputusan.

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
| Random Forest | 0.9309 | 0.9401 | 0.9204 | 0.9302 | 0.9355 +/- 0.0075 |
| XGBoost | 0.9243 | 0.9262 | 0.9221 | 0.9242 | 0.9344 +/- 0.0062 |

- Parameter terbaik Random Forest: `{"n_estimators": 200, "min_samples_split": 5, "min_samples_leaf": 1, "max_features": "sqrt", "max_depth": 20}`
- Parameter terbaik XGBoost: `{"subsample": 1.0, "n_estimators": 500, "max_depth": 5, "learning_rate": 0.1, "colsample_bytree": 0.9}`
- Confusion matrix Random Forest: `[[1076, 67], [91, 1052]]`
- Confusion matrix XGBoost: `[[1059, 84], [89, 1054]]`

## Feature Importance

- Lima fitur teratas Random Forest: F28 (0.3361), F27 (0.1569), F26 (0.1205), F14 (0.0505), F15 (0.0459)
- Lima fitur teratas XGBoost: F28 (0.5416), F27 (0.0832), F01 (0.0505), F04 (0.0342), F26 (0.0341)
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
| F18 | 1188 | 0 | 10242 |
| F19 | 38 | 790 | 10602 |
| F20 | 13 | 0 | 11417 |
| F21 | 16 | 0 | 11414 |
| F22 | 69 | 0 | 11361 |
| F23 | 15 | 0 | 11415 |
| F24 | 357 | 1837 | 9236 |
| F25 | 11200 | 0 | 230 |
| F26 | 4444 | 3727 | 3259 |
| F27 | 4954 | 2612 | 3864 |
| F28 | 5327 | 0 | 6103 |
| F29 | 2638 | 1378 | 7414 |
| F30 | 377 | 0 | 11053 |

## Kesimpulan

Model terbaik berdasarkan hasil evaluasi adalah `random_forest`. Pemilihan ini didasarkan pada F1 score test set dan accuracy sebagai pemecah seri, bukan asumsi sebelum training. Model prototype lama tidak dioverwrite; artefak final disimpan menggunakan nama file baru.
