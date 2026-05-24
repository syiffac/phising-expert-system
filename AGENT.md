# AGENT.md — Panduan Pengembangan Proyek

## 1. Identitas Proyek

Nama proyek sementara: **PhishGuard Expert System**
Topik: **Sistem Pakar Deteksi Website Phishing Menggunakan Rule-Based System dengan Perbandingan Random Forest dan XGBoost**
Mata kuliah: **Sistem Pakar A**
Kelompok: **Kelompok 4**

Anggota:

1. Rizky Amelia Putri — H1D023017
2. Fatimah Nurmawati — H1D023019
3. Zaizafun Hanifah Zainnur Hanun — H1D023021
4. Aisyah Syifa Karima — H1D023043

Proyek ini dikembangkan sebagai aplikasi web sistem pakar hybrid untuk mendeteksi kemungkinan phishing pada sebuah website berdasarkan fitur berbasis URL, domain, dan indikator halaman web ringan. Fokus utama proyek adalah membangun sistem pakar yang memiliki **knowledge base**, **rule base**, dan **inference engine berbasis forward chaining**. Machine learning digunakan sebagai komponen pendukung untuk klasifikasi akhir, bukan sebagai pengganti sistem pakar.

---

## 2. Tujuan Utama Sistem

Sistem ini bertujuan untuk:

1. Mendeteksi apakah suatu website termasuk **phishing** atau **legitimate**.
2. Menampilkan alasan deteksi berdasarkan **rule IF-THEN** yang terpicu.
3. Menjalankan proses inferensi awal menggunakan **forward chaining**.
4. Membandingkan performa **Random Forest** dan **XGBoost** secara empiris menggunakan dataset yang sama.
5. Menyediakan aplikasi web yang dapat digunakan untuk demo input URL, melihat hasil deteksi, rule yang aktif, dan riwayat pengujian.

Catatan penting: sistem tidak boleh dibuat seolah-olah hanya proyek machine learning. Unsur sistem pakar harus selalu terlihat jelas melalui knowledge base, rule base, working memory, inference engine, dan penjelasan rule yang terpicu.

---

## 3. Ruang Lingkup Sistem

Sistem yang dikembangkan hanya mencakup:

1. Deteksi phishing berbasis fitur URL, domain, dan indikator halaman web ringan yang tersedia pada dataset.
2. Ekstraksi fitur yang relevan dengan rule F01–F30.
3. Standarisasi nilai fitur menjadi:

   * `1` = legitimate / aman
   * `0` = suspicious / mencurigakan
   * `-1` = phishing / berbahaya
4. Rule-based inference menggunakan metode forward chaining.
5. Klasifikasi akhir menggunakan Random Forest dan XGBoost.
6. Evaluasi model menggunakan akurasi, precision, recall, F1-score, dan confusion matrix.
7. Aplikasi web untuk input URL, hasil deteksi, daftar rule, dan riwayat deteksi.

Sistem tidak mencakup:

1. Deteksi malware, ransomware, atau serangan siber lain di luar phishing website.
2. Crawling massal ke website aktif tanpa batas.
3. Pengambilan data login, password, cookie, token, atau informasi sensitif pengguna.
4. Otomatisasi serangan, eksploitasi, bypass keamanan, atau tindakan ofensif lainnya.
5. Pengiriman form ke website target.
6. Integrasi ekstensi browser atau bot Telegram pada tahap awal, kecuali ditambahkan setelah fitur inti selesai.

---

## 4. Prinsip Pengembangan

Setiap pengembangan fitur harus mengikuti prinsip berikut:

1. **Rule-based system adalah inti sistem pakar.**
   Jangan menempatkan Random Forest atau XGBoost sebagai satu-satunya pusat keputusan.

2. **Machine learning adalah pendukung klasifikasi akhir.**
   ML digunakan untuk memperkuat hasil deteksi dan membandingkan performa model, bukan menggantikan knowledge base.

3. **Setiap rule harus memiliki dasar.**
   Rule tidak boleh dibuat hanya berdasarkan asumsi pribadi. Rule harus mengacu pada fitur yang sudah ada pada literatur, dataset, atau hasil feature importance.

4. **Jangan menyimpulkan Random Forest atau XGBoost lebih unggul sejak awal.**
   Keduanya sama-sama ensemble method. Performa akhir harus ditentukan berdasarkan hasil evaluasi pada dataset yang sama.

5. **Sistem harus dapat menjelaskan keputusan.**
   Output tidak cukup hanya “Phishing” atau “Legitimate”. Sistem harus menampilkan rule yang terpicu dan alasan singkatnya.

6. **Gunakan bahasa dan tampilan yang akademik tetapi tetap praktis.**
   Aplikasi dibuat untuk tugas besar mata kuliah, sehingga harus mudah dipresentasikan dan mudah dipahami dosen.

---

## 5. Tech Stack yang Digunakan

Frontend:

* Next.js
* TypeScript
* Tailwind CSS

Backend:

* FastAPI
* Python

Machine Learning:

* pandas
* scikit-learn
* XGBoost
* joblib

Database:

* PostgreSQL

Opsional:

* Docker Compose untuk menjalankan frontend, backend, dan database dalam satu perintah.

---

## 6. Struktur Folder Proyek

Gunakan struktur folder berikut agar proyek tetap rapi.

```text
phishing-expert-system/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   │
│   │   ├── api/
│   │   │   ├── routes_detection.py
│   │   │   ├── routes_rules.py
│   │   │   ├── routes_history.py
│   │   │   └── routes_evaluation.py
│   │   │
│   │   ├── core/
│   │   │   ├── feature_extraction.py
│   │   │   ├── feature_standardization.py
│   │   │   ├── rule_engine.py
│   │   │   ├── inference_engine.py
│   │   │   └── ml_predictor.py
│   │   │
│   │   ├── models/
│   │   │   ├── database_models.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── ml_models/
│   │   │   ├── random_forest_model.joblib
│   │   │   ├── xgboost_model.joblib
│   │   │   └── feature_columns.json
│   │   │
│   │   └── knowledge_base/
│   │       ├── features.json
│   │       ├── rules.json
│   │       └── thresholds.json
│   │
│   ├── requirements.txt
│   └── README.md
│
├── dataset/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_training_random_forest.ipynb
│   ├── 03_training_xgboost.ipynb
│   └── 04_evaluation.ipynb
│
├── docs/
│   ├── progress_4_design.md
│   ├── rule_base.md
│   ├── system_flow.md
│   └── references.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── AGENT.md
```

---

## 7. Alur Kerja Sistem

Alur utama sistem harus mengikuti urutan berikut:

```text
Input URL / pilih data dari dataset
        ↓
Ekstraksi fitur
        ↓
Standarisasi nilai fitur menjadi 1, 0, atau -1
        ↓
Fakta masuk ke working memory
        ↓
Forward chaining mencocokkan fakta dengan rule IF-THEN
        ↓
Hasil inferensi awal: legitimate / suspicious / phishing
        ↓
Random Forest dan XGBoost melakukan klasifikasi akhir
        ↓
Sistem membandingkan hasil model
        ↓
Output final + rule yang terpicu + alasan deteksi
```

Pada sistem hybrid ini, hasil rule-based tidak langsung diposisikan sebagai keputusan final mutlak. Rule-based system digunakan sebagai tahap inferensi awal dan penjelasan logis. Klasifikasi akhir diperkuat oleh model machine learning.

---

## 8. Komponen Sistem Pakar

### 8.1 Knowledge Base

Knowledge base berisi:

1. Daftar fitur/gejala F01–F30.
2. Interpretasi nilai fitur 1, 0, dan -1.
3. Threshold tiap fitur jika tersedia.
4. Daftar rule IF-THEN.
5. Sumber landasan rule dari literatur, dataset, atau feature importance.

Knowledge base sebaiknya disimpan dalam file JSON agar mudah dibaca backend dan mudah diperbarui.

Contoh struktur `features.json`:

```json
[
  {
    "code": "F01",
    "name": "Have IP Address",
    "description": "URL menggunakan IP address sebagai hostname",
    "safe_value": 1,
    "suspicious_value": 0,
    "danger_value": -1,
    "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"
  }
]
```

Contoh struktur `rules.json`:

```json
[
  {
    "code": "R01",
    "conditions": [
      { "feature": "F01", "operator": "==", "value": -1 }
    ],
    "conclusion": "phishing",
    "severity": "high",
    "explanation": "URL menggunakan IP address sebagai hostname sehingga identitas domain asli sulit diverifikasi.",
    "source": "Suwarno & Hardjianto (2024)"
  }
]
```

### 8.2 Working Memory

Working memory menyimpan fakta sementara dari URL yang sedang diuji.

Contoh:

```json
{
  "F01": -1,
  "F02": 0,
  "F03": 1,
  "F04": -1,
  "F08": -1
}
```

### 8.3 Inference Engine

Inference engine menggunakan metode **forward chaining**.

Tugas inference engine:

1. Membaca fakta dari working memory.
2. Membandingkan fakta dengan kondisi pada rule base.
3. Menentukan rule mana saja yang aktif.
4. Menghasilkan kesimpulan awal.
5. Mengirim hasil inferensi awal ke modul prediksi dan frontend.

Output inference engine minimal berisi:

```json
{
  "initial_status": "phishing",
  "triggered_rules": ["R01", "R04", "R08"],
  "explanations": [
    "URL menggunakan IP address sebagai hostname.",
    "URL mengandung simbol @.",
    "SSL tidak valid atau tidak tersedia."
  ]
}
```

---

## 9. Fitur/Gejala yang Digunakan

Gunakan kode fitur F01–F30 yang sudah ditetapkan pada laporan progress.

Daftar fitur:

1. F01 — Have IP Address
2. F02 — URL Length
3. F03 — Shortening Service
4. F04 — Having @ Symbol
5. F05 — Double Slash Redirecting
6. F06 — Prefix-Suffix
7. F07 — Having Subdomain
8. F08 — SSL Final State
9. F09 — Domain Registration Length
10. F10 — Favicon
11. F11 — Port
12. F12 — HTTPS Token
13. F13 — Request URL
14. F14 — URL of Anchor
15. F15 — Links in Tags
16. F16 — SFH / Server Form Handler
17. F17 — Submitting to Email
18. F18 — Abnormal URL
19. F19 — Redirect
20. F20 — On MouseOver
21. F21 — Right Click Disabled
22. F22 — Pop-Up Window
23. F23 — IFrame
24. F24 — Age of Domain
25. F25 — DNS Record
26. F26 — Web Traffic
27. F27 — Page Rank
28. F28 — Google Index
29. F29 — Links Pointing to Page
30. F30 — Statistical Report

Catatan penting:

* Tidak semua fitur harus diekstraksi secara real-time pada tahap prototype.
* Fitur yang membutuhkan layanan eksternal, seperti page rank, web traffic, Google index, statistical report, atau umur domain, boleh menggunakan nilai dari dataset untuk mode demo.
* Untuk input URL manual, sistem dapat mengekstraksi fitur yang memungkinkan secara langsung, seperti panjang URL, simbol @, IP address, HTTPS token, jumlah subdomain, prefix-suffix, shortening service, dan double slash redirecting.

---

## 10. Rule Base

Rule utama menggunakan format IF-THEN.

Contoh rule dasar:

```text
R01: IF F01 = -1 THEN Phishing
R02: IF F02 = -1 THEN Suspicious
R03: IF F03 = -1 THEN Suspicious
R04: IF F04 = -1 THEN Phishing
R05: IF F05 = -1 THEN Phishing
```

Rule tidak harus selalu berbentuk kombinasi. Rule satu fitur tetap valid apabila fitur tersebut memang memiliki dasar literatur dan dianggap cukup kuat sebagai indikator phishing.

Rule kombinasi boleh ditambahkan pada tahap lanjutan sebagai **aturan agregasi risiko**, bukan sebagai rule utama tanpa dasar. Rule kombinasi harus berasal dari fitur-fitur yang sudah tervalidasi.

Contoh rule agregasi risiko:

```text
IF F02 = -1 AND F04 = -1 AND F07 = -1 THEN Phishing
```

Rule seperti ini hanya boleh digunakan apabila setiap fitur penyusunnya sudah memiliki dasar dari literatur, dataset, atau feature importance.

---

## 11. Machine Learning

Model yang digunakan:

1. Random Forest
2. XGBoost

Keduanya diperlakukan sebagai model ensemble yang dibandingkan secara empiris. Jangan menyatakan salah satu model pasti lebih baik sebelum hasil evaluasi dilakukan.

Tahapan ML:

1. Load dataset.
2. Pilih fitur yang relevan.
3. Preprocessing data.
4. Split data train-test.
5. Training Random Forest.
6. Training XGBoost.
7. Evaluasi performa.
8. Simpan model menggunakan joblib.
9. Load model di FastAPI untuk prediksi.

Metrik evaluasi:

1. Accuracy
2. Precision
3. Recall
4. F1-score
5. Confusion matrix

Output prediksi model minimal:

```json
{
  "random_forest": {
    "prediction": "phishing",
    "confidence": 0.94
  },
  "xgboost": {
    "prediction": "phishing",
    "confidence": 0.96
  }
}
```

---

## 12. Integrasi Rule-Based dan Machine Learning

Alur integrasi hybrid:

1. Backend menerima URL atau data sampel.
2. Backend mengekstraksi fitur.
3. Fitur distandarisasi menjadi fakta F01–F30.
4. Inference engine menjalankan forward chaining.
5. Sistem mencatat rule yang terpicu.
6. Model Random Forest dan XGBoost melakukan prediksi.
7. Sistem menampilkan hasil akhir beserta alasan berbasis rule.

Format output akhir:

```json
{
  "url": "http://example-login@secure-update.com",
  "expert_system": {
    "initial_status": "phishing",
    "triggered_rules": ["R04", "R08"],
    "explanations": [
      "URL mengandung simbol @.",
      "SSL tidak valid atau tidak tersedia."
    ]
  },
  "machine_learning": {
    "random_forest": {
      "prediction": "phishing",
      "confidence": 0.94
    },
    "xgboost": {
      "prediction": "phishing",
      "confidence": 0.96
    }
  },
  "final_result": "phishing"
}
```

Keputusan final dapat menggunakan strategi sederhana pada tahap awal:

1. Jika rule-based menghasilkan phishing dan minimal satu model ML memprediksi phishing, maka final result = phishing.
2. Jika rule-based menghasilkan suspicious dan kedua model ML memprediksi phishing, maka final result = phishing.
3. Jika rule-based menghasilkan legitimate dan kedua model ML memprediksi legitimate, maka final result = legitimate.
4. Jika hasil berbeda, tampilkan status `needs_review` atau `suspicious` agar sistem tidak terlalu memaksakan keputusan.

Strategi ini boleh disesuaikan setelah hasil evaluasi diperoleh.

---

## 13. Endpoint Backend

Gunakan endpoint awal berikut:

```text
GET  /health
POST /api/detect
GET  /api/rules
GET  /api/features
GET  /api/history
GET  /api/evaluation
```

### POST /api/detect

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "url": "https://example.com",
  "features": {
    "F01": 1,
    "F02": 0,
    "F04": 1
  },
  "expert_system": {
    "initial_status": "suspicious",
    "triggered_rules": ["R02"],
    "explanations": ["Panjang URL berada pada kategori mencurigakan."]
  },
  "machine_learning": {
    "random_forest": {
      "prediction": "legitimate",
      "confidence": 0.78
    },
    "xgboost": {
      "prediction": "legitimate",
      "confidence": 0.81
    }
  },
  "final_result": "legitimate"
}
```

---

## 14. Database

Gunakan PostgreSQL untuk menyimpan:

1. Features
2. Rules
3. Detection history
4. Triggered rules
5. Model evaluation results

Rancangan tabel awal:

### features

```text
id
code
name
description
safe_value
suspicious_value
danger_value
source
created_at
updated_at
```

### rules

```text
id
code
conditions_json
conclusion
severity
explanation
source
created_at
updated_at
```

### detection_histories

```text
id
url
expert_status
rf_prediction
rf_confidence
xgb_prediction
xgb_confidence
final_result
created_at
```

### triggered_rules

```text
id
detection_history_id
rule_code
explanation
created_at
```

### model_evaluations

```text
id
model_name
accuracy
precision
recall
f1_score
confusion_matrix_json
evaluated_at
```

---

## 15. Halaman Frontend

Frontend minimal memiliki halaman berikut:

1. **Dashboard**

   * Ringkasan jumlah URL diuji.
   * Jumlah hasil phishing, legitimate, dan suspicious.
   * Ringkasan model RF dan XGBoost.

2. **Deteksi URL**

   * Form input URL.
   * Tombol analisis.
   * Output hasil deteksi.
   * Rule yang terpicu.
   * Hasil prediksi Random Forest dan XGBoost.

3. **Knowledge Base**

   * Daftar fitur F01–F30.
   * Interpretasi nilai 1, 0, dan -1.
   * Sumber fitur.

4. **Rule Base**

   * Daftar rule R01–R20.
   * Kondisi IF.
   * Kesimpulan THEN.
   * Sumber rule.

5. **Riwayat Deteksi**

   * URL yang pernah diuji.
   * Hasil expert system.
   * Hasil RF dan XGBoost.
   * Final result.
   * Waktu pengujian.

6. **Evaluasi Model**

   * Accuracy.
   * Precision.
   * Recall.
   * F1-score.
   * Confusion matrix.

---

## 16. Standar UI

Gunakan gaya visual:

* modern akademik
* cyber security
* clean
* tidak terlalu neon
* dominan navy, cyan, putih, dan abu-abu
* card-based layout
* mudah dibaca saat demo

Komponen penting:

1. Badge status:

   * Legitimate
   * Suspicious
   * Phishing

2. Card rule yang terpicu.

3. Tabel knowledge base.

4. Tabel rule base.

5. Grafik evaluasi model jika memungkinkan.

---

## 17. Etika dan Keamanan

Proyek ini hanya untuk tujuan edukasi dan defensif. Sistem tidak boleh dikembangkan untuk membantu pembuatan phishing, eksploitasi, pencurian data, atau aktivitas berbahaya lainnya.

Dilarang membuat fitur:

1. Generator URL phishing.
2. Generator halaman login palsu.
3. Pengambil credential.
4. Simulasi pencurian data.
5. Otomatisasi submit form ke website target.
6. Crawling agresif ke website publik.
7. Bypass blacklist, firewall, captcha, atau sistem keamanan.

Apabila membutuhkan contoh URL untuk demo, gunakan URL dummy atau data dari dataset, bukan URL phishing aktif yang berbahaya.

---

## 18. Prioritas Pengembangan

Urutan pengerjaan yang disarankan:

1. Setup repository dan struktur folder.
2. Setup backend FastAPI.
3. Setup frontend Next.js.
4. Setup PostgreSQL.
5. Buat knowledge base `features.json`, `rules.json`, dan `thresholds.json`.
6. Buat rule engine dan forward chaining.
7. Buat endpoint `/api/detect` versi rule-based saja.
8. Training Random Forest dan XGBoost di notebook.
9. Simpan model dengan joblib.
10. Integrasikan model ke backend.
11. Hubungkan frontend dengan backend.
12. Buat halaman rule base dan knowledge base.
13. Buat halaman riwayat deteksi.
14. Buat halaman evaluasi model.
15. Rapikan UI untuk demo.
16. Siapkan laporan dan dokumentasi.

Jangan mengerjakan fitur tambahan sebelum fitur inti selesai.

---

## 19. Kriteria Selesai

Sistem dianggap selesai untuk prototype apabila sudah memenuhi:

1. User dapat memasukkan URL atau memilih data sampel.
2. Sistem dapat mengekstraksi atau membaca fitur.
3. Sistem dapat mengubah fitur menjadi fakta F01–F30.
4. Forward chaining berjalan dan menghasilkan rule yang terpicu.
5. Sistem menampilkan hasil inferensi awal.
6. Random Forest dan XGBoost dapat memberikan prediksi.
7. Sistem menampilkan hasil akhir phishing atau legitimate.
8. Sistem menampilkan alasan deteksi berbasis rule.
9. Riwayat deteksi tersimpan.
10. Evaluasi model dapat ditampilkan.

---

## 20. Catatan untuk AI Coding Agent

Saat membantu mengembangkan proyek ini:

1. Jangan keluar dari scope sistem pakar deteksi phishing.
2. Jangan mengubah topik menjadi cyber security umum.
3. Jangan membuat fitur ofensif.
4. Jangan menghapus unsur knowledge base dan inference engine.
5. Jangan membuat sistem hanya mengandalkan ML.
6. Jangan mengklaim Random Forest atau XGBoost lebih unggul sebelum evaluasi.
7. Selalu pertahankan istilah utama: knowledge base, rule base, working memory, inference engine, forward chaining, dan hybrid expert system.
8. Kode harus rapi, modular, dan mudah dijelaskan saat presentasi.
9. Setiap fitur baru harus mendukung kebutuhan laporan progress 4, 5, 6, dan final.
10. Prioritaskan implementasi yang bisa didemokan dengan jelas di depan dosen.

---

## 21. Narasi Singkat untuk Presentasi Teknis

Sistem ini dibangun sebagai aplikasi web dengan arsitektur Next.js sebagai frontend, FastAPI sebagai backend, dan PostgreSQL sebagai database. FastAPI digunakan karena proses utama sistem, seperti ekstraksi fitur, forward chaining, dan integrasi model Random Forest serta XGBoost, lebih sesuai dijalankan pada lingkungan Python. Pada sistem ini, rule-based system tetap menjadi inti sistem pakar melalui knowledge base dan inference engine. Machine learning digunakan sebagai komponen pendukung untuk memperkuat klasifikasi akhir dan membandingkan performa dua model ensemble secara empiris.
