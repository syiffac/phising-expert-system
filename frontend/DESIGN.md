# Frontend Design System & Design System Guide (frontend/DESIGN.md)

Dokumen ini adalah pedoman desain antarmuka utama (*single source of truth*) untuk antarmuka pengguna (UI) **PhishGuard Expert System**. Pedoman ini dirancang secara akademik namun modern untuk menghadirkan visualisasi yang kredibel, premium, dan profesional, serta menjamin kebersihan tata letak tanpa elemen gimmick (*"AI slop"* atau *"crypto UI"*).

---

## 1. Project Design Identity
* **Tema Visual**: **Futuristic Glassmorphism Cyber Intelligence Dashboard**
* **Karakter Desain**:
  * **Dark Navy / Deep Blue Gradient**: Latar belakang bernuansa gelap dan tenang untuk visualisasi profesional.
  * **Glassmorphism**: Panel transparan dengan bias cahaya dan pembiasan blur berkualitas tinggi.
  * **Premium SaaS Feel**: Menggunakan tata letak dashboard modern cyber security intelligence tingkat lanjut.
  * **Expert System Centric**: Mengutamakan visualisasi data kepakaran (rules dan fakta) secara transparan dan berurutan.
  * **Clean, Readable & Akademik**: Menghindari elemen visual kekanak-kanakan, template agensi generik, skema warna crypto, atau hacker terminal hijau norak yang mengaburkan data ilmiah.

---

## 2. Anti AI-Slop Rules (Visual Integrity)
* **LAYOUT**: Dilarang menggunakan layout generik linear tanpa pembagian kolom, struktur, dan fokus visual yang jelas.
* **COLOR OVERLOAD**: Hindari penggunaan warna neon hijau cyber-hacker yang berlebihan atau gradasi acak. Gunakan palet harmonis dark navy dan soft cyan.
* **FANTASY GIMMICKS**: Dilarang menambahkan grafik crypto, koin mengambang, ilustrasi robot 3D kartun, atau blob acak yang tidak memiliki fungsi analitik.
* **HIERARCHICAL TRUTHS**: Sistem Pakar (Rule-Based System) harus selalu dieksekusi dan diposisikan secara visual sebagai benteng deteksi pertama, bukan disembunyikan di bawah Machine Learning.
* **DECEPTION-FREE**: Hanya XGBoost (Primary Model) dan Random Forest (Comparison Only) yang ditampilkan pada UI. UI hanya menampilkan model yang digunakan pada sistem final.
* **READABILITY FIRST**: Jangan pernah mengorbankan keterbacaan teks demi mengejar efek blur atau kegelapan latar belakang. Semua teks harus memiliki rasio kontras minimal 4.5:1.

---

## 3. Color System

| Kegunaan | Kode Hex / Nilai CSS | Peran |
| :--- | :--- | :--- |
| **Background Primary** | `#07111F` | Deep dark blue background |
| **Background Secondary**| `#0B1220` | Elevated dashboard backdrop |
| **Surface Glass** | `rgba(15, 23, 42, 0.60)` | Panel transparan glassmorphic |
| **Surface Elevated** | `rgba(30, 41, 59, 0.45)` | Modals, inputs, card elevated |
| **Border Glass** | `rgba(255, 255, 255, 0.08)`| Soft translucent border |
| **Accent Cyan** | `#22D3EE` | Informasi teknis, key labels |
| **Accent Blue** | `#3B82F6` | Primary action indicator |
| **Accent Teal** | `#14B8A6` | Hybrid components decoration |
| **Accent Violet** | `#8B5CF6` | Secondary highlight |
| **Text Primary** | `#F8FAFC` | High contrast body & titles |
| **Text Secondary** | `#CBD5E1` | Standard descriptive copy |
| **Text Muted** | `#94A3B8` | Subtitle, labels, timestamps, and compact meta |
| **Text Placeholder** | `#64748B` | Input placeholder and decorative disabled text only |
| **Legitimate State** | `#10B981` (Emerald) | Safe URL / aman |
| **Suspicious State** | `#F59E0B` (Amber) | Needs review / mencurigakan |
| **Phishing State** | `#EF4444` (Red) | Phishing website / bahaya, harus paling jelas |
| **Imputed/Unknown** | `#38BDF8` (Sky) | Resilient missing features indicator |

---

## 4. Typography System

Sistem menggunakan font Sans-Serif modern dan bersih (misal: *Outfit*, *Inter*, atau *Plus Jakarta Sans*) dengan dukungan *Monospace* untuk data teknis.

### Hierarchy Tekstual:
* **Hero Title**: `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight`
* **Section Title**: `text-2xl md:text-3xl font-bold tracking-tight`
* **Card Title**: `text-lg md:text-xl font-semibold`
* **Body / Copy**: `text-sm md:text-base leading-relaxed text-slate-300`
* **Technical labels / Codes**: `font-mono text-xs uppercase tracking-wider text-cyan-400`

### Text Contrast Rules (WCAG AA Compliance):
Pada background `#07111F`, kombinasi warna teks berikut WAJIB dipatuhi:

| Fungsi | Class Tailwind | Hex | Kontras Ratio |
| :--- | :--- | :--- | :--- |
| **Section Label (mono)** | `text-cyan-300` | `#67E8F9` | ~10.5:1 |
| **Card Label (mono)** | `text-slate-400` | `#94A3B8` | ~5.3:1 |
| **Body Text** | `text-slate-300` | `#CBD5E1` | ~7.6:1 |
| **Detail / Description** | `text-slate-300` | `#CBD5E1` | ~7.6:1 |
| **Muted Meta (status, source)** | `text-slate-400` | `#94A3B8` | ~5.3:1 |
| **Input Placeholder** | `placeholder:text-slate-500` | `#64748B` | ~3.9:1 |

**DILARANG** menggunakan:
* `text-slate-500` untuk label/teks utama — terlalu redup, hanya untuk placeholder
* `text-slate-600` di atas background gelap — hampir tidak terbaca
* `text-slate-450` — bukan class Tailwind valid
* `text-cyan-200/80` — opacity menyebabkan kontras kurang

### Page-Wide Readability Enforcement:
* Semua teks informatif pada card, tabel, list, dan panel wajib memakai minimal `text-slate-400`. Untuk copy paragraf dan deskripsi gunakan `text-slate-300`.
* `text-slate-500` hanya boleh dipakai untuk ikon dekoratif di dalam input, placeholder, atau teks non-esensial yang tidak perlu dibaca sebagai informasi utama.
* `text-slate-600` tidak dipakai pada dark navy shell.
* Untuk status phishing, gunakan red yang tegas: `border-red-500/35 bg-red-500/10 text-red-200` atau `text-red-300` untuk badge kecil.
* Jika panel memakai tint state (`bg-red-500/10`, `bg-amber-500/10`, `bg-cyan-300/10`), body text di dalamnya tetap `text-slate-200` atau state text terang (`text-red-100`, `text-amber-100`, `text-cyan-100`).

---

## 5. Layout & Grid System
* **Max Width Container**: `max-w-7xl mx-auto`
* **Section Padding**: `px-4 sm:px-6 md:px-8 py-16 md:py-24`
* **Desktop Layout**: Grid 2 Kolom untuk Hero Visual & Form Deteksi, dan Grid Dashboard Multikolom untuk hasil analisis.
* **Spacing Gap**: `gap-6` atau `gap-8` untuk visual cards.
* **Border Radius System**:
  * Panel Glass Utama: `rounded-3xl` (24px)
  * Badges & Buttons: `rounded-xl` (12px) atau `rounded-full`

### Card Sizing Consistency Rules:
Semua card dalam section/grid yang SAMA harus memiliki tinggi yang konsisten:

| Pola Grid | Class Wajib | Contoh |
| :--- | :--- | :--- |
| **Multi-card row** | `lg:auto-rows-fr` atau `md:auto-rows-fr` | StatTile 4-col, ProblemCards 3-col |
| **Two-column pair** | `lg:grid-cols-2 lg:auto-rows-fr` | RuntimeModelCard pair, Feature Set pair |
| **Four-column stats** | `lg:grid-cols-4 lg:auto-rows-fr` | Dashboard stat tiles |
| **Three-column stats** | `sm:grid-cols-3 sm:auto-rows-fr` | Feature Quality tiles |
| **Inner sub-grid** | `sm:grid-cols-2 sm:auto-rows-fr` | Expert System 4-card grid |
| **Card wrapper** | `h-full` pada GlassCard | Semua card dalam grid row |
| **Reveal wrapper** | `className="h-full"` pada `<Reveal>` | Semua card yang dibungkus animasi Reveal |
| **Content stretch** | `flex h-full flex-col` + `flex-1` pada body text | ProblemCards, SystemFlow |
| **Repeated list rows** | `grid gap-3 sm:auto-rows-fr` + row `flex h-full flex-col` | Feature catalog, rule cards, model strips |
| **Metric helper tile** | `flex h-full min-w-0 flex-col` | StatTile, MetricTile, ModelEvaluationStrip |
| **Two-panel page body** | `lg:grid-cols-[...] lg:auto-rows-fr` + children `h-full` | Dataset demo, evaluation model pair |

**DILARANG**:
* Grid multi-kolom tanpa `auto-rows-fr` jika card di section yang sama
* Card tanpa `h-full` jika berada dalam grid row
* `<Reveal>` tanpa `className="h-full"` saat membungkus card dalam grid sama tinggi
* Body text tanpa `flex-1` jika card perlu stretch ke tinggi yang sama
* Helper tile custom berbasis `<div>` tanpa `h-full` saat tampil dalam grid statistik
* Page baru yang memakai `bg-slate-950` flat, `border-slate-800`, atau card solid tanpa `DarkVeilBackground`, `Navbar`, dan `GlassCard` shell utama

### Section Consistency Contracts:
* Setiap section grid harus memilih satu pola tinggi: semua card sama tinggi (`auto-rows-fr`) atau semua item list bebas tinggi dalam satu kolom. Jangan mencampur keduanya dalam section yang sama.
* Jika sebuah row punya dua panel utama berdampingan, kedua panel wajib memakai `h-full`, padding setara (`p-5 sm:p-6`), border glass setara, dan heading scale setara.
* Card statistik harus punya tinggi stabil, label mono kecil, value mono tebal, dan detail memakai `flex-1` agar tinggi antar tile tidak meloncat.
* Card katalog/list yang berulang harus memakai border, radius, dan background yang sama. Status badge boleh berbeda warna, tetapi struktur card tidak boleh berubah antar item.
* Halaman utility seperti `dataset-demo` tetap memakai dark navy app shell yang sama dengan halaman utama: `DarkVeilBackground`, `Navbar`, `max-w-7xl`, section padding standar, dan `GlassCard`.
* Panel dense evidence seperti `Evaluated Facts F01-F30` dan `Triggered Expert Rules` harus memakai inner surface yang clear tetapi tetap navy, bukan putih transparan atau hitam pekat: gunakan wrapper `after:opacity-10`, container `bg-slate-900/65`, row `bg-slate-900/45`, hover `bg-slate-800/55`, dan border `border-white/[0.12]`.
* Nested metric/info tile di `ResultDashboard` jangan memakai glass blur lagi. Gunakan panel solid `rounded-[20px] border border-white/[0.12] bg-slate-900/60 p-4 shadow-inner` agar card utama sejajar dan isi mudah dibaca.

---

## 6. Glassmorphism System (Translucent Class Pattern)

Untuk menciptakan efek kedalaman 3D yang elegan, setiap panel transparan wajib mematuhi aturan Tailwind berikut:

```css
/* Struktur Class Dasar */
.glass-panel {
  backdrop-filter: blur(16px);
  background-color: rgba(15, 23, 42, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
```

* **Tailwind Utility Pattern**: `bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-cyan-950/20`
* **Catatan Penting**: Jika konfigurasi Tailwind tidak mendukung opacity shorthand secara langsung pada file build tertentu, gunakan arbitrary value yang aman untuk menjamin validitas CSS:
  * `border-white/[0.08]` sebagai pengganti `border-white/8`
  * `bg-slate-900/[0.58]` sebagai pengganti `bg-slate-900/58`

---

## 7. Visual Motifs & Accent Assets
* **Elemen yang Disarankan**:
  * Soft grid overlay (efek jaring-jaring latar belakang tipis).
  * Radial gradient glow (pendaran cahaya lembut di belakang kartu).
  * Floating glass panel dengan bayangan dalam.
  * Shield dengan security check icon.
  * Tampilan jajaran teks matrix/glitch transparan berskala rendah (**Letter Glitch**) untuk mempertegas suasana intelegensi siber.
* **Elemen yang Harus Dihindari**:
  * Gambar kartun robot atau icon koin melayang.
  * Garis matrix falling rain penuh yang mengganggu performa dan keterbacaan teks.

---

### Hero Composition Rules
* Hero visual must support the headline, not dominate it.
* Use a distinctive central cybersecurity core with shield/check motif.
* Use orbit rings, 3 labeled nodes, one result capsule, and maximum 3 supporting chips.
* Keep the visual futuristic, clean, and interactive.
* Avoid repeatedly using the same large dashboard panel composition.
* Hero illustration should be visually memorable but not cluttered.
* Prioritize clarity, hierarchy, and spacing over visual complexity.
* Navbar must not overlap hero content — preserve top spacing.

### Technical Rules
* **Hero Illustration Direction**: Hero illustration menggunakan orbital intelligence core — central shield orb, 3 orbit rings, 3 flow nodes, 1 result capsule, 2 metric chips, 1 threat accent.
* **Layering**: `ambient bokeh glow -> thin glass plate -> SVG orbital system -> shield core -> nodes + lines -> result capsule -> floating chips`.
* **Shield**: ShieldCheck icon dari lucide-react dalam glass orb dengan glow pulse dan double halo ring.
* **3D Depth**: Mouse parallax interaktif dengan `perspective(1200px)`, max rotate 3-4deg, translate 6px. Desktop only. Lerp smoothing via requestAnimationFrame.
* **Orbit Rings**: 3 SVG circles dengan dashed stroke, berputar 20-24s linear infinite. Counter-clockwise ring untuk variasi.
* **Data Flow Lines**: SVG path tipis (`strokeWidth 1-1.2`) dengan dash animation menghubungkan core → nodes → result. Gradient cyan→violet→teal.
* **Glass Plate**: `rounded-[32px]`, `bg-cyan-950/[0.08]`, `backdrop-blur-md`. Tidak terlalu solid. Subtle grid texture.
* **Metric Chips**: Hanya 2 chip kecil di luar panel: `30/30 Features` (kanan atas) dan `91 ML Features` (kiri bawah). Jangan tambah Accuracy/Latency.
* **Motion**: Orbit ring 20-24s. Core glow pulse 4.5s. Node float 5.4s amplitude 4px. Data line dash 3.2-4.2s. Particle drift 8s. Entrance 0.9s ease-out. Reduced motion: disable semua loop.
* **No Hard Image Block**: Dilarang menampilkan hero illustration sebagai `<img>` polos.
* **Balance With Headline**: Visual kanan supporting, bukan mendominasi. Mobile: scale down, hide chips, disable parallax.

---

## 8. Letter Glitch Usage Rules

Untuk mempertahankan kesan visual intelegensi siber yang premium dan bersih, penggunaan komponen `<LetterGlitch />` harus diatur dengan aturan ketat berikut:

* **Lokasi Penggunaan**:
  * Hanya diizinkan pada area visual **Hero Section** atau panel dekoratif visual utama di bagian kanan hero.
  * Dilarang keras dipasang sebagai latar belakang halaman penuh (*full-page background*) karena dapat merusak performa *render* browser dan mengganggu kenyamanan membaca.
* **Tumpukan Visual (Stacking)**:
  * Harus diletakkan di bagian paling belakang dari komponen fungsional atau kartu glassmorphic (*behind floating glass cards*).
  * Di atas canvas Letter Glitch wajib diberikan lapisan overlay gradasi gelap (`bg-[#07111F]/35` atau sejenisnya) agar teks fungsional di depannya tetap mudah terbaca tanpa gangguan kontras.
* **Parameter Visual & Kecepatan**:
  * **Opacity Maksimal**: Batas opacity berkisar antara `0.08` sampai `0.16` di latar belakang, dan maksimal `0.60` saat di dalam sub-card dekoratif.
  * **Palet Warna**: Wajib menggunakan warna cyan (`#22D3EE`), biru (`#3B82F6`), violet (`#8B5CF6`), atau sky (`#38BDF8`) yang subtle. Hindari penggunaan warna hijau neon yang dominan agar tidak terkesan murahan.
  * **Batas Letak**: Dilarang diletakkan langsung di belakang elemen form input utama atau tabel fakta evaluasi.
* **Optimasi Performa & Aksesibilitas**:
  * **Mobile Viewport**: Di perangkat mobile (lebar layar `< 768px`), intensitas Letter Glitch harus dikurangi secara signifikan (misalnya diturunkan opacity-nya) atau disembunyikan sepenuhnya (`hidden md:block`) demi menjaga efisiensi baterai dan kenyamanan visual.
  * **Reduced Motion**: Apabila sistem mendeteksi preferensi *prefers-reduced-motion*, animasi Letter Glitch wajib dihentikan sepenuhnya atau digantikan dengan tekstur statis.

### Contoh Kasus Penggunaan (Usage Examples):
* **Hero right visual background**: `ALLOWED` (Menambah kedalaman visual cyber intelligence)
* **Small decorative security signal panel**: `ALLOWED` (Aksen kecil pendukung status monitor)
* **Full page animated noisy background**: `NOT ALLOWED` (Mengacaukan fokus membaca dan membebani GPU)
* **Behind body text**: `NOT ALLOWED` (Melanggar aturan kontras WCAG)
* **Behind facts table**: `NOT ALLOWED` (Mengganggu pembacaan data teknis yang presisi)

---

## 9. Responsive Design Rules

Antarmuka PhishGuard harus responsif dan adaptif di seluruh rentang ukuran layar tanpa menimbulkan tumpang tindih tata letak (*overlap*) maupun scrollbar horizontal yang tidak disengaja.

### Aturan Kolom dan Grid:
* **Desktop (>= 1024px)**:
  * **Hero Section**: Menggunakan layout 2 kolom seimbang (kiri: teks deskripsi & tombol tindakan, kanan: panel visual/glass dashboard).
  * **Hero Stability**: Kolom hero wajib memakai track `minmax(0, ...)` atau batas lebar eksplisit agar badge, headline, dan panel preview tidak saling mendorong atau menumpuk.
  * **Result Dashboard**: Menggunakan tata letak grid modular multi-kolom (2 atau 3 kolom) untuk menyajikan panel deteksi, metrik, dan tabel fakta secara efisien.
  * **System Flow**: Alur kerja digambarkan secara horizontal dari kiri ke kanan dengan garis konektor visual yang dinamis.
* **Tablet (>= 768px dan < 1024px)**:
  * **Hero Section**: Tetap menggunakan layout 2 kolom jika lebar layar mencukupi, atau otomatis beralih menjadi 1 kolom berjarak longgar.
  * **Result Dashboard**: Menggunakan grid 2 kolom teratur.
  * **System Flow**: Langkah-langkah alur kerja diperbolehkan melipat (*wrap*) menjadi 2 baris teratur.
* **Mobile (< 768px)**:
  * **Hero Section**: Wajib berubah menjadi layout 1 kolom vertikal tunggal.
  * **Hero Badges & Headline**: Badge kemampuan boleh memakai scroll horizontal internal yang terisolasi, tetapi tidak boleh menyebabkan scrollbar halaman. Headline hero harus berupa teks/inline element yang valid, bukan elemen block seperti `<p>` di dalam `<h1>`.
  * **Navigation Bar**: Navbar dilarang keras memaksa semua menu tampil horizontal. Wajib menyembunyikan navigasi sekunder atau menggunakan menu lipat (*hamburger menu*).
  * **Result Dashboard**: Tata letak wajib diatur penuh dalam 1 kolom vertikal agar data tidak berdesakan.
  * **History Page**: Riwayat deteksi wajib memakai app shell visual yang sama dengan halaman utama (dark navy background, floating navbar, glass panels) dan list kartu responsif dengan URL `break-all` agar domain panjang tidak menabrak kontainer.
  * **Facts Table**: Tabel fakta F01-F30 yang lebar harus dikonversi menjadi baris kartu ringkas (*compact grid/list*) atau diberi pembungkus scroll horizontal internal yang terisolasi dengan rapi.
  * **Visual Cleanliness**: Padding kartu glassmorphic dikurangi (misal dari `p-6` menjadi `p-4`) untuk menghemat ruang vertikal, namun tetap menjaga ruang antar elemen (*line-height* dan *gap*) agar teks tidak menumpuk.
  * **CTA & Inputs**: Kolom input URL dan tombol aksi utama wajib melebar penuh (*full-width*) agar mudah ditekan oleh ibu jari.

### Batasan Pengujian Layar (Test Viewports):
Semua komponen layout wajib lolos verifikasi tampilan pada empat ukuran utama berikut:
1. `375px` (Mobile Small)
2. `768px` (Tablet Portret)
3. `1024px` (Laptop Standard)
4. `1440px` (Desktop Large)

---

## 10. Frontend Implementation Guardrails

Sebagai pedoman bagi pengembang dan agen AI coding, batasan implementasi (*guardrails*) berikut wajib dipatuhi untuk menjaga keselarasan dengan backend yang sudah final:

* **Backend Contract Integrity**:
  * Frontend dilarang keras mengubah format pertukaran data (*contract*) backend yang sudah disepakati.
  * Endpoint utama untuk pengujian deteksi adalah POST `/api/detect/`.
  * Data evaluasi model harus ditarik secara dinamis dari GET `/api/evaluation/`.
* **Visualisasi Model Machine Learning**:
  * **XGBoost** harus selalu disajikan dengan lencana/label jelas sebagai **PRIMARY MODEL** runtime deteksi.
  * **Random Forest** harus selalu disajikan dengan lencana/label jelas sebagai **COMPARISON ONLY** (model pembanding).
  * UI hanya menampilkan model yang digunakan pada sistem final.
* **Alur Keputusan (Hybrid Order)**:
  * Penilaian Sistem Pakar (Rule-Based System / Forward Chaining) harus divisualisasikan terlebih dahulu di bagian atas panel atau mendahului visualisasi Machine Learning untuk mencerminkan filosofi *expert-system-first*.
  * Parameter kelengkapan data (*feature quality*) wajib ditampilkan secara transparan kepada pengguna.
  * Persentase atau nilai `imputed_unknown` wajib ditampilkan secara tegas sebagai indikator transparansi jaringan (*transparency indicator*).
  * Pengguna harus dapat memeriksa daftar Fakta F01-F30 dan aturan yang terpicu (*triggered rules*) secara utuh dan terperinci.
* **Integritas Analisis & Penanganan Error**:
  * Dilarang keras melakukan *hardcode* hasil deteksi di frontend. Hasil analisis harus sepenuhnya dinamis berdasarkan respons JSON dari server backend.
  * Tampilan *placeholder* atau data demo (*dummy card preview*) hanya diizinkan tampil pada saat sebelum pengguna mengirimkan URL. Setelah tombol deteksi ditekan, semua visualisasi harus digantikan oleh data asli.
  * Apabila terjadi kegagalan koneksi atau error dari backend, frontend wajib menangani error tersebut secara anggun (*graceful error handling*), menampilkan pesan error yang mudah dipahami manusia tanpa membuat UI menjadi blank, beku, atau crash.
* **TypeScript & Type Safety**:
  * Hindari penggunaan tipe `any` pada parameter data utama. Buat antarmuka data yang terdefinisi secara statis untuk `DetectResponse` sesuai dengan skema JSON dari backend.
  * Jangan menampilkan metrik performa atau model yang tidak didukung atau tidak disediakan oleh endpoint `/api/evaluation/`.

---

## 11. Scroll & Glassmorphism Interaction Rules

Navigasi antarmuka yang premium memerlukan interaksi scroll yang presisi dan integrasi glassmorphism yang responsif terhadap pergerakan kursor.

### Floating Glass UI Direction
* Semua card utama harus terasa seperti panel mengambang di atas dark navy background.
* Gunakan layered glassmorphism, bukan flat cards.
* Card utama memakai backdrop blur, translucent surface, subtle inner highlight, dan soft shadow.
* Depth harus muncul dari kombinasi blur, border, shadow, dan spacing.
* Hindari card yang terlalu solid atau terlalu flat.
* Hover boleh memberi efek naik kecil (`hover:-translate-y-1`), tetapi jangan mengubah layout besar.
* Saat scroll, section dan cards boleh reveal halus agar terasa masuk ke viewport.
* Background tetap stabil, sementara UI panel terasa bergerak/reveal.

### Floating Navbar Rules
* Navbar menggunakan bentuk floating glass pill.
* Navbar berada di tengah atas layout, tidak melebar penuh (*not full-width*).
* Navbar tidak perlu sticky saat scrolling. Navbar cukup berada di bagian atas hero/page sebagai premium floating control bar.
* Lebar navbar mengikuti konten (*w-fit* atau *max-w-fit*) dengan padding horizontal yang cukup.
* Styling:
  * Latar belakang: `bg-slate-950/45`
  * Blur: `backdrop-blur-xl`
  * Outlines: `border border-white/[0.08]`
  * Border radius: `rounded-full` atau `rounded-2xl`
  * Bayangan: `shadow-lg shadow-cyan-950/20`
* Logo brand `icon.png` ( PhishGuard ) di sebelah kiri dan tombol CTA `Analyze URL` di sebelah kanan sebagai pill button yang terbaca jelas.
* Di mobile, navbar dikonfigurasi menjadi compact glass bar atau menu minimalis bertumpuk tanpa merusak layout atau menyebabkan horizontal scroll.

### Scroll Interaction Rules (Lenis & GSAP)
* **Lenis**: Digunakan untuk global smooth scroll premium. Pergerakan scroll harus mengalir mulus tanpa terasa lambat atau membebani performa browser. Wajib memanggil fungsi *cleanup* saat unmount.
* **GSAP**: Digunakan hanya untuk reveal subtle pada sections dan card groups.
  * Animasi Reveal: `opacity 0 -> 1`, `y 28px -> 0`, `scale 0.98 -> 1` (opsional), `duration 0.7s - 0.9s`, dengan `ease: power3.out`.
  * Stagger: Gunakan efek delay kecil (`stagger: 0.05s`) khusus pada card groups. Jangan animasikan teks per kata secara berlebihan.
  * Tidak boleh ada parallax berat atau infinite animation pada content utama.
  * LetterGlitch tetap dibatasi hanya di hero background saja.
  * Wajib menghormati media query `prefers-reduced-motion` dengan mematikan seluruh pemicu scroll/animasi canvas secara otomatis.

---

## 12. Component Contracts

Setiap komponen visual di dalam antarmuka PhishGuard harus memiliki antarmuka (interface) pemrograman dan aturan render yang konsisten.

### A. GlassCard
Komponen dasar pembungkus panel glassmorphic.
* **Props Minimal**: `children: ReactNode`, `className?: string`, `borderRadius?: number`, `glow?: boolean`, `reactBits?: boolean`, `interactive?: boolean`, `glassIntensity?: "soft" | "medium" | "strong"`, `width?: number | string`
* **Varian Visual**:
  * `soft`: Opasitas latar belakang rendah (`0.16`), efek blur standar, cocok untuk kartu dekoratif pendukung di area padat.
  * `medium` (default): Opasitas latar belakang sedang (`0.20`), efek blur seimbang untuk kartu utama.
  * `strong`: Opasitas tinggi (`0.24`), efek blur maksimal (`18px`) untuk panel kritis atau modal dialog agar kontras teks tetap optimal.
* **React Bits Filter**: Properti `reactBits` hanya boleh digunakan pada navbar/brand shell yang jumlah elemennya kecil. Jangan aktifkan SVG displacement React Bits pada card list, history rows, dashboard result, atau hero preview karena dapat menurunkan performa scroll.
* **Interaksi**: Harus memiliki micro-translation ke atas (`hover:-translate-y-1`) dan peningkatan intensitas border glow jika parameter `interactive` bernilai true.

### B. StatusBadge
Lencana penanda status keamanan URL.
* **Props Minimal**: `status: "legitimate" | "suspicious" | "phishing" | "unknown"`, `className?: string`
* **Skema Visual**:
  * `legitimate`: Latar belakang hijau emerald transparan (`bg-emerald-500/10 border-emerald-500/20 text-emerald-400`).
  * `suspicious`: Latar belakang amber transparan (`bg-amber-500/10 border-amber-500/20 text-amber-400`).
  * `phishing`: Latar belakang merah transparan (`bg-red-500/10 border-red-500/35 text-red-300`).
  * `unknown`: Latar belakang sky/blue-gray transparan (`bg-sky-500/10 border-sky-500/20 text-sky-400`).
* **Aturan Keterbacaan**: Badge dilarang keras hanya mengandalkan kode warna untuk menandakan status. Teks label status (misalnya "Legitimate Site", "Phishing Danger") wajib ditulis dengan jelas dan tegas untuk menjamin aksesibilitas.

### C. FeatureValueBadge
Representasi status nilai dari fakta F01-F30 hasil ekstraksi.
* **Props Minimal**: `value: number`, `isImputed?: boolean`
* **Ketentuan Penampilan**:
  * `value = 1` (Aman): Berwarna hijau (`text-emerald-400 bg-emerald-500/5`).
  * `value = 0` (Mencurigakan/Netral): Berwarna kuning/amber (`text-amber-400 bg-amber-500/5`).
  * `value = -1` (Berbahaya/Phishing): Berwarna merah tegas (`text-red-300 bg-red-500/10`).
  * `isImputed = true` (Nilai tidak dapat diekstraksi/imputed): Wajib menampilkan lencana pendamping khusus berwarna biru muda sky (`text-sky-400 bg-sky-500/10`) bertuliskan `Imputed/Unknown` sebagai penanda transparansi.

### D. ProgressBar
Menggambarkan rasio kelengkapan data deteksi (*feature quality*).
* **Props Minimal**: `value: number`, `max: number`, `imputedCount?: number`
* **Ketentuan Visual**:
  * Nilai kelengkapan data disajikan dalam persentase progress bar horizontal berwarna cyan gradasi biru.
  * Jika nilai `imputedCount > 0`, progress bar wajib memunculkan ikon peringatan kecil bernuansa amber di sebelahnya dengan teks peringatan deskriptif bahwa sebagian data menggunakan estimasi nilai aman terdekat (*resilient mode*).

### E. ResultCard
Kartu utama penentu keputusan keputusan deteksi hibrida.
* **Aturan Tata Letak**:
  * **Keputusan Akhir (Final Decision)** wajib dicetak paling menonjol menggunakan ukuran teks yang besar, dilengkapi ikon status berskala makro untuk menegaskan kondisi situs (Aman, Rawan, Bahaya).
  * Blok penilaian **Expert System** dan **Machine Learning** diletakkan berdampingan di bawah keputusan akhir, namun visualisasi alur harus memprioritaskan atau memposisikan panel keputusan pakar lebih dulu guna memperkuat hierarki *expert-first*.

### F. FactGrid / FactTable
Tabel penyaji fakta data F01-F30.
* **Aturan Kolom**: Harus memuat 4 parameter kolom utama secara lengkap:
  1. `Feature Code` (Kode Fitur, e.g. F05)
  2. `Feature Name & Description` (Nama Fitur)
  3. `Value` (Nilai Fitur yang diekstraksi beserta interpretasi status aman/bahaya)
  4. `Source` (Sumber asal data, e.g. HTML Parsing, DNS Lookup, RDAP WHOIS)
* **Mobile Transformation**: Di layar mobile, wajib dikonversi menjadi tata letak list kartu ringkas (*compact list layout*). Setiap kartu memuat kode fitur di sudut atas, nilai interpretasi dengan badge, dan sumber ekstraksi di bagian bawah.

---

## 13. Accessibility Rules
* **Contrast Compliance**: Semua kombinasi warna teks dan latar belakang wajib lolos standar WCAG AA. Hindari penulisan teks berwarna abu-abu redup (slate) di atas panel gelap yang sulit dibaca.
* **Form Inputs**: Kolom input wajib menyertakan atribut `id`, `placeholder` yang jelas, asosiasi label (*label association* atau `aria-label`), dan dapat difokuskan serta di-submit menggunakan keyboard (`Enter`).
* **Focus States**: Semua elemen interaktif (tombol, input, link) wajib memiliki outline focus ring bersinar yang jelas saat diakses via keyboard (`focus-visible:ring-2 focus-visible:ring-cyan-300`).
* **Loading State Accessibility**: Tombol pemicu analisis saat loading wajib dalam kondisi `disabled` namun tetap mudah dipahami statusnya menggunakan pembaca layar (*aria-live="polite"*).
* **Decorative Elements**: Ikon dekoratif yang tidak membawa muatan informasi wajib diberi atribut `aria-hidden="true"`. Komponen `<LetterGlitch />` wajib disematkan `aria-hidden="true"` dan `pointer-events-none`.
* **Prefers Reduced Motion**: Pengecekan media query `window.matchMedia('(prefers-reduced-motion: reduce)')` diaktifkan secara otomatis pada inisialisasi aplikasi untuk mematikan semua efek animasi GSAP, smooth scroll Lenis, dan canvas Letter Glitch.

---

## 14. Design QA Checklist

Gunakan checklist di bawah ini untuk memastikan tidak terjadi penyimpangan desain (*design drift*) selama proses pemeliharaan antarmuka frontend:

- [ ] **Bukan Landing Page Crypto**: UI tidak menggunakan visualisasi koin melayang, ilustrasi 3D mengkilap yang tidak relevan, atau grafik pips berantakan.
- [ ] **Bukan Hacker Terminal Murahan**: Tidak ada hujan matrix hijau neon yang berlebihan, jenis huruf terminal murni yang sulit dibaca, atau warna neon menyilaukan mata.
- [ ] **Letter Glitch Terkendali**: Komponen Letter Glitch hanya aktif di bagian Hero/visual aksen kanan dengan opacity rendah (8% - 16%), tidak di belakang teks artikel atau tabel.
- [ ] **Glassmorphic Konsisten**: Semua kartu utama menggunakan utility pattern border `border-white/[0.08]` dan blur yang presisi.
- [ ] **XGBoost Primary Model**: XGBoost dilabeli secara tegas sebagai `PRIMARY MODEL`.
- [ ] **Random Forest Comparison Only**: Random Forest dilabeli secara tegas sebagai `COMPARISON ONLY`.
- [ ] **Expert System Sebelum ML**: Analisis rules pakar dan forward chaining diposisikan mendahului Machine Learning pada antarmuka hasil.
- [ ] **Transparansi imputed_unknown**: Nilai imputasi data ditampilkan secara jelas sebagai indikator transparansi jaringan (*transparency indicator*).
- [ ] **Fakta F01-F30 Mudah Dibaca**: Seluruh 30 fitur beserta status ketersediaan datanya disajikan dalam bentuk tabel yang teratur atau list mobile yang responsif.
- [ ] **Responsive Viewports**: Tidak ada scrollbar horizontal yang bocor pada simulasi layar mobile `375px`, tablet `768px`, dan laptop `1024px`.
- [ ] **Aksesibilitas Kontras & Keyboard**: Teks memiliki rasio kontras tinggi, tombol deteksi dapat dipicu via `Enter` pada form input, dan focus ring muncul dengan tegas.
- [ ] **Prefers Reduced Motion Terbaca**: Animasi canvas dan transisi GSAP mati total saat preferensi aksesibilitas komputer aktif.
- [ ] **Backend Contract Aman**: Tidak ada manipulasi backend data model atau perubahan endpoint di luar API utama yang disepakati.

---

## 15. Performance & Clean Code Scrolling Guardrails

Untuk menjamin kenyamanan navigasi dan performa render konstan **60fps** tanpa lag, seluruh pengembangan elemen interaktif dan animasi di masa mendatang wajib mematuhi panduan teknis berikut:

### A. Viewport-Aware Animation Execution
* **Intersection Observer**: Komponen visual apa pun yang berjalan di atas `<canvas>` (kanvas 2D atau WebGL shader) atau mengeksekusi loop animasi `requestAnimationFrame` secara berkelanjutan **wajib** dipantau menggunakan `IntersectionObserver`.
* **Zero Idle CPU**: Hentikan (`cancelAnimationFrame`) loop render kanvas sepenuhnya saat elemen tersebut ter-scroll ke luar dari area tangkapan layar (viewport), sehingga mengonsumsi daya **0% CPU** saat pengguna membaca konten di bagian bawah halaman.

### B. Optimal Canvas Frame Rendering
* **Zero Regex inside Frame Loop**: Dilarang keras melakukan parsing format string warna, eksekusi regular expression (`hex.match`), atau manipulasi manipulasi string CSS di dalam loop animasi utama.
* **Pre-Computed Arrays**: Lakukan konversi format warna hex atau RGB ke struktur data numerik mentah `{ r, g, b }` satu kali saja pada saat inisialisasi (*mounting*). Semua transisi warna di dalam loop wajib menggunakan kalkulasi linier aritmatika langsung.
* **Sparser Cell Density**: Batasi kerapatan elemen gambar atau teks kanvas agar tidak menutupi keterbacaan teks utama di depannya.

### C. Single Smooth Scroll Library
* **Lenis Discipline**: Sistem kinetik *smooth scroll* dikelola terpadu oleh pustaka `Lenis` melalui [SmoothScrollProvider](file:///c:/laragon/www/phishing-expert-system/frontend/src/components/motion/SmoothScrollProvider.tsx).
* **No Conflicting Scroll Handlers**: Dilarang keras memasang event listener scroll manual di window, event monitoring wheel ganda, atau pustaka penjelajah berat seperti GSAP ScrollTrigger secara bersamaan karena berpotensi merusak sinkronisasi frame render browser dan memicu stuttering visual.

### D. SVG Glass Filter Scope
* **React Bits GlassSurface**: Filter SVG displacement asli React Bits hanya boleh aktif secara opt-in untuk navbar atau brand mark (`reactBits`). Permukaan konten besar harus memakai glassmorphism CSS biasa dengan `backdrop-filter: blur(...)`, border tipis, dan shadow ringan.
* **Scrollable Lists**: Halaman dengan banyak record seperti History wajib menghindari SVG displacement per-row. Gunakan `GlassCard` default agar scroll tetap responsif.

---

## 16. Welcome Loading Screen Rules

Welcome loading screen adalah overlay sambutan yang tampil saat pertama kali user membuka aplikasi dalam satu sesi browser.

### Tujuan
* Memberikan kesan premium dan profesional sebelum konten utama muncul.
* Menampilkan brand PhishGuard dengan logo yang sudah ada.
* Memvisualisasikan proses *system initialization* secara futuristik.

### Aturan Desain
* **Style**: Wajib mengikuti tema *Futuristic Glassmorphism Cyber Intelligence Dashboard*.
* **Background**: Dark navy gradient (`#07111F` → `#0a1628` → `#07111F`) dengan subtle radial cyan glow.
* **Logo**: Gunakan `icon.png` yang sudah ada tanpa mengubah, mewarnai ulang, memotong, atau menambah filter apapun.
* **Glassmorphism**: Container logo memakai pola glass yang konsisten (`bg-slate-900/60 backdrop-blur-xl border border-white/[0.08]`).
* **Grid Overlay**: Bokeh grid halus dengan opacity sangat rendah (`0.03`) untuk tekstur cyber.

### Initialization Steps
Teks inisialisasi harus relevan dengan sistem dan tampil berurutan:
1. `Initializing Expert System`
2. `Loading F01–F30 Knowledge Base`
3. `Preparing Forward Chaining Engine`
4. `Loading XGBoost Runtime Model`
5. `Checking Feature Extraction Pipeline`
6. `System Ready`

### Motion Rules
* **Logo Reveal**: `opacity 0 → 1`, `scale 0.92 → 1`, durasi `0.8s`, easing `cubic-bezier(0.23, 1, 0.32, 1)`.
* **Brand Text**: `y 12px → 0`, `opacity 0 → 1`, delay `0.3s` setelah logo.
* **Progress Bar**: Gradient cyan→blue→violet, glow pada leading edge, bergerak linear dari `0%` ke `100%`.
* **Step Text**: Fade in/out halus antar step, durasi `0.2s`.
* **Exit Transition**: `opacity 1 → 0`, sedikit `scale 1.02`, `blur 8px`, durasi `0.4s`.
* **Reduced Motion**: Seluruh animasi harus menggunakan transition sederhana tanpa scale/blur saat `prefers-reduced-motion: reduce` aktif.

### Durasi & Behavior
* **Durasi Total**: Maksimal `2.5 detik` (default `2.4s` + exit `0.4s`).
* **Session Storage**: Gunakan `sessionStorage` key `phishguard-welcome-seen` agar loader hanya muncul sekali per sesi browser.
* **Tidak Memblokir**: Loader tidak menghentikan render konten utama di belakang overlay.
* **Tidak Mengganggu Detect Form**: Loader tidak memengaruhi loading state form deteksi URL.
* **Fallback**: Jika `sessionStorage` tidak tersedia, loader tetap berjalan tanpa error.

### Komponen
* File: `frontend/src/components/welcome/WelcomeLoader.tsx`
* Integrasi: `frontend/src/app/page.tsx`
* Library Animasi: `motion/react` (Framer Motion) dengan `AnimatePresence` untuk exit.

### Larangan
* Jangan menggunakan glitch full-screen berlebihan.
* Jangan menunggu response backend.
* Jangan menambahkan musik atau suara.
* Jangan menggunakan elemen crypto, robot 3D, atau neon berlebihan.
* Jangan membuat loader muncul ulang setiap navigasi internal.
