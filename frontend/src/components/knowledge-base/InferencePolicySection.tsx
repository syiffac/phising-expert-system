import {
  ArrowDown,
  CheckCircle2,
  Cpu,
  GitBranch,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import GlassCard from "@/components/ui-custom/GlassCard";
import { cn } from "@/lib/cn";

const factValues = [
  {
    value: "1",
    label: "Legitimate / Aman",
    desc: "Fitur menunjukkan indikator positif bahwa URL aman.",
    tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  },
  {
    value: "0",
    label: "Suspicious / Tidak Pasti",
    desc: "Fitur tidak memberikan indikator kuat ke arah mana pun.",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  },
  {
    value: "-1",
    label: "Phishing / Berbahaya",
    desc: "Fitur menunjukkan indikator kuat bahwa URL berpotensi phishing.",
    tone: "border-red-500/30 bg-red-500/10 text-red-200",
  },
];

const hybridThresholds = [
  {
    condition: "Hybrid Score >= 0.65",
    result: "Phishing",
    tone: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  {
    condition: "0.35 <= Hybrid Score < 0.65",
    result: "Suspicious",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  },
  {
    condition: "Hybrid Score < 0.35",
    result: "Legitimate",
    tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  },
];

const expertScores = [
  "Tidak ada rule terpicu -> 0.00",
  "1 rule suspicious -> 0.20",
  "2-3 rule suspicious -> 0.40",
  "4+ rule suspicious -> 0.55",
  "1 rule phishing -> 0.75",
  "2+ rule phishing -> 0.90",
];

const mlScores = [
  "XGBoost phishing: ML Phishing Score = confidence phishing",
  "XGBoost legitimate: ML Phishing Score = 1 - confidence legitimate",
  "Random Forest hanya pembanding, tidak ikut menentukan final result",
];

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
        {text}
      </p>
    </div>
  );
}

export default function InferencePolicySection() {
  return (
    <div className="mt-12 space-y-8">
      {/* Header */}
      <div>
        <SectionLabel
          icon={<Shield className="h-4 w-4 text-cyan-300" />}
          text="Kebijakan Inferensi dan Keputusan Hybrid"
        />
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          Bagaimana sistem ini mengambil keputusan
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          PhishGuard menggunakan pendekatan hybrid yang menggabungkan sistem
          pakar berbasis aturan dengan model machine learning. Berikut adalah
          kebijakan lengkap yang mengatur proses inferensi dan pengambilan
          keputusan.
        </p>
      </div>

      {/* A. Kebijakan Nilai Fakta */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<GitBranch className="h-4 w-4 text-cyan-300" />}
          text="A. Kebijakan Nilai Fakta"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Interpretasi nilai fakta F01–F30
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Setiap fakta yang diekstraksi dari URL memiliki nilai numerik yang
          merepresentasikan indikator keamanan:
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {factValues.map((item) => (
            <div
              className={cn(
                "rounded-2xl border p-4",
                item.tone
              )}
              key={item.value}
            >
              <p className="font-mono text-2xl font-black">{item.value}</p>
              <p className="mt-2 text-sm font-bold">{item.label}</p>
              <p className="mt-2 text-xs leading-5 opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* B. Forward Chaining */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<GitBranch className="h-4 w-4 text-cyan-300" />}
          text="B. Forward Chaining"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Evaluasi aturan IF–THEN
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sistem pakar menggunakan <span className="font-bold text-cyan-200">forward chaining</span> untuk
          mengevaluasi aturan IF–THEN berdasarkan fakta F01–F30. Setiap
          aturan memiliki kondisi yang diperiksa terhadap fakta yang tersedia.
          Aturan yang seluruh kondisinya terpenuhi akan masuk ke daftar{" "}
          <span className="font-bold text-cyan-200">triggered rules</span>.
        </p>
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
          <p className="text-xs leading-5 text-cyan-200">
            Forward chaining dimulai dari fakta yang tersedia, kemudian
            mencocokkan dengan kondisi setiap rule secara berurutan. Rule yang
            terpicu akan menghasilkan kesimpulan (conclusion) berupa status
            phishing, suspicious, atau legitimate.
          </p>
        </div>
      </GlassCard>

      {/* C. Imputed Unknown Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<ShieldX className="h-4 w-4 text-sky-300" />}
          text="C. Kebijakan Imputed Unknown"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Penanganan fitur yang gagal diekstraksi
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Fitur dengan status <span className="font-bold text-sky-200">imputed_unknown</span> adalah fitur
          yang gagal diekstraksi atau tidak tersedia saat analisis runtime.
          Sistem menangani fitur ini dengan kebijakan berikut:
        </p>

        <div className="mt-4 grid gap-2">
          {[
            {
              label: "Expert System",
              text: "imputed_unknown tidak digunakan untuk memicu rule individual. Fitur ini di-skip saat evaluasi aturan.",
              tone: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
            },
            {
              label: "Machine Learning",
              text: "Nilainya tetap dikodekan sebagai 0 agar model menerima feature vector lengkap tanpa missing value.",
              tone: "border-violet-500/20 bg-violet-500/10 text-violet-200",
            },
            {
              label: "Transparansi",
              text: "Nilai ini ditampilkan sebagai indikator transparansi, bukan otomatis sebagai bukti phishing.",
              tone: "border-sky-500/20 bg-sky-500/10 text-sky-200",
            },
          ].map((item) => (
            <div
              className={cn("rounded-xl border p-3", item.tone)}
              key={item.label}
            >
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-5">{item.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* D. Primary ML Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<Cpu className="h-4 w-4 text-cyan-300" />}
          text="D. Kebijakan Model Machine Learning"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          XGBoost sebagai model utama
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sistem menggunakan dua model machine learning dengan peran yang
          berbeda:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Primary Model
            </p>
            <p className="mt-2 text-base font-black text-slate-50">
              XGBoost
            </p>
            <p className="mt-2 text-xs leading-5 text-cyan-200">
              Digunakan pada keputusan runtime. Jika XGBoost dan Random Forest
              berbeda prediksi, keputusan ML mengikuti XGBoost.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Comparison Only
            </p>
            <p className="mt-2 text-base font-black text-slate-50">
              Random Forest
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Hanya model pembanding. Ditampilkan untuk referensi, tidak
              digunakan dalam keputusan akhir.
            </p>
          </div>
        </div>

      </GlassCard>

      {/* E. Hybrid Decision Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<ShieldCheck className="h-4 w-4 text-cyan-300" />}
          text="E. Kebijakan Keputusan Hybrid"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Skor 50:50 dari Sistem Pakar dan XGBoost
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Hasil akhir dihitung dari Expert Risk Score dan ML Phishing Score
          dengan bobot seimbang. Formula yang digunakan adalah{" "}
          <span className="font-bold text-cyan-200">
            Hybrid Score = 0.5 x Expert Risk Score + 0.5 x ML Phishing Score
          </span>
          .
        </p>

        <div className="mt-5 grid gap-2">
          {hybridThresholds.map((rule, index) => (
            <div
              className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
              key={index}
            >
              <p className="text-xs leading-5 text-slate-300 sm:text-sm">
                {rule.condition}
              </p>
              <div className="flex items-center gap-2">
                <ArrowDown className="hidden h-3 w-3 rotate-[-90deg] text-slate-500 sm:block" />
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize",
                    rule.tone
                  )}
                >
                  {rule.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Expert Risk Score
            </p>
            <div className="mt-3 grid gap-2">
              {expertScores.map((item) => (
                <p className="text-xs leading-5 text-cyan-100" key={item}>
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-cyan-200">
              Jika rule suspicious dan phishing muncul bersamaan, skor phishing
              diprioritaskan.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300">
              ML Phishing Score
            </p>
            <div className="mt-3 grid gap-2">
              {mlScores.map((item) => (
                <p className="text-xs leading-5 text-violet-100" key={item}>
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-violet-200">
              Contoh: XGBoost phishing confidence 0.95 menjadi 0.95. XGBoost
              legitimate confidence 0.99 menjadi 0.01.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <p className="text-xs leading-5 text-sky-200">
              <span className="font-bold">Contoh:</span> 1 rule suspicious
              memberi Expert Risk Score 0.20. Jika XGBoost legitimate dengan
              confidence 0.99, ML Phishing Score = 0.01 dan Hybrid Score =
              0.105. Final result menjadi legitimate, jadi satu rule
              suspicious ringan tidak otomatis mengalahkan XGBoost yang sangat
              yakin legitimate.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-5 text-amber-200">
              <span className="font-bold">Safety guard:</span> Jika Expert Risk
              Score cukup tinggi atau XGBoost sangat yakin phishing, hasil
              minimal dapat dinaikkan menjadi suspicious. Status phishing tetap
              terutama ditentukan oleh Hybrid Score {">="} 0.65.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
