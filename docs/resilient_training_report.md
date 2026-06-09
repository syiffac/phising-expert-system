# Laporan Training Resilient F01-F30

## Tujuan

Pipeline ini membandingkan clean model dan robust model untuk hybrid expert system. Alur tetap dimulai dari ekstraksi fitur, working memory F01-F30, rule-based forward chaining, lalu ML sebagai pendukung keputusan.

## Resilient Policy

Fitur yang gagal diekstrak karena HTML, DNS, RDAP, timeout, 404, SSL error, atau domain tidak resolve diberi nilai `0` sebagai unknown/suspicious. Nilai ini bukan default aman dan tidak pernah diubah menjadi `1`.

Fitur rawan gagal:

- HTML: F10, F13, F14, F15, F16, F17, F19, F20, F21, F22, F23, F28, F29, F30
- WHOIS/RDAP: F09, F24
- DNS: F25

## Dataset

- Jumlah data awal: 11430
- Duplikasi dihapus: 0
- Jumlah data setelah cleaning: 11430
- Missing values sumber: 0
- Distribusi label: {'legitimate': 5715, 'phishing': 5715}
- Low variance features: ['F16', 'F17']

## Clean vs Robust Candidates

| Model | Clean Accuracy | Clean F1 | Robust Accuracy | Robust F1 | Stability Gap | Composite |
|---|---:|---:|---:|---:|---:|---:|
| clean_random_forest | 0.8670 | 0.8645 | 0.8430 | 0.8370 | 0.0275 | 0.7630 |
| clean_xgboost | 0.8644 | 0.8620 | 0.8416 | 0.8338 | 0.0282 | 0.7603 |
| robust_random_forest | 0.8679 | 0.8651 | 0.8578 | 0.8533 | 0.0118 | 0.7721 |
| robust_xgboost | 0.8666 | 0.8645 | 0.8583 | 0.8547 | 0.0098 | 0.7727 |

Composite score = `(0.45 * clean_f1) + (0.45 * robust_f1) - (0.10 * stability_gap)`.

## Quality Gate

- Passed: False
- Failed reasons: ['clean_test f1_score dan accuracy masih di bawah 0.90', 'recall kelas phishing pada clean/robust test masih di bawah 0.85']
- Runtime apply status: {'applied_to_backend': False, 'reason': 'Quality gate belum terpenuhi; /api/detect/ tetap memakai rule-based resilient extractor tanpa model runtime baru.'}

## Best Model

Model terbaik berdasarkan composite score adalah `robust_xgboost` dengan clean F1 `0.8645` dan robust F1 `0.8547`. Stability gap: `0.0098`.

## Feature Importance

Fitur teratas best model: F18 (0.1569), F01 (0.1272), F28 (0.0766), F15 (0.0667), F14 (0.0601), F04 (0.0462), F24 (0.0394), F07 (0.0394)

Data lengkap tersimpan pada `backend/app/ml_models/resilient_feature_importance.json`.
