import {
  ArrowDown,
  CheckCircle2,
  Cpu,
  GitBranch,
  Shield,
  ShieldAlert,
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

const hybridRules = [
  {
    condition: "Expert System = Phishing",
    result: "Phishing",
    tone: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  {
    condition: "Expert System = Suspicious + XGBoost = Phishing",
    result: "Phishing",
    tone: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  {
    condition: "Expert System = Legitimate + XGBoost = Phishing",
    result: "Suspicious",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  },
  {
    condition: "Expert System = Suspicious + XGBoost = Legitimate",
    result: "Suspicious",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  },
  {
    condition: "Expert System = Legitimate + XGBoost = Legitimate",
    result: "Legitimate",
    tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  },
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

      {/* C. Severity Tertinggi */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<ShieldAlert className="h-4 w-4 text-amber-300" />}
          text="C. Kebijakan Severity Tertinggi"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Hasil expert system ditentukan oleh severity tertinggi
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Hasil expert system tidak ditentukan hanya dari jumlah rule yang
          terpicu, tetapi dari <span className="font-bold text-amber-200">tingkat bahaya tertinggi</span> dari
          rule tersebut.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs font-bold text-red-200">
            Phishing
          </span>
          <ArrowDown className="h-4 w-4 rotate-[-90deg] text-slate-500" />
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-200">
            Suspicious
          </span>
          <ArrowDown className="h-4 w-4 rotate-[-90deg] text-slate-500" />
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-200">
            Legitimate
          </span>
        </div>

        <div className="mt-5 grid gap-2">
          {[
            {
              text: "Jika hanya rule suspicious yang terpicu, maka expert system = suspicious.",
              icon: <Shield className="h-4 w-4 text-amber-300" />,
            },
            {
              text: "Jika ada minimal satu rule phishing yang terpicu, maka expert system = phishing.",
              icon: <ShieldAlert className="h-4 w-4 text-red-300" />,
            },
            {
              text: "Jika tidak ada rule yang terpicu, maka expert system = legitimate.",
              icon: <ShieldCheck className="h-4 w-4 text-emerald-300" />,
            },
          ].map((item, index) => (
            <div
              className="flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
              key={index}
            >
              {item.icon}
              <p className="text-xs leading-5 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* D. Imputed Unknown Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<ShieldX className="h-4 w-4 text-sky-300" />}
          text="D. Kebijakan Imputed Unknown"
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

      {/* E. Primary ML Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<Cpu className="h-4 w-4 text-cyan-300" />}
          text="E. Kebijakan Model Machine Learning"
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

      {/* F. Hybrid Decision Policy */}
      <GlassCard className="p-5 sm:p-6" interactive={false}>
        <SectionLabel
          icon={<ShieldCheck className="h-4 w-4 text-cyan-300" />}
          text="F. Kebijakan Keputusan Hybrid"
        />
        <h3 className="mt-3 text-lg font-black text-slate-50">
          Aturan kombinasi expert system dan machine learning
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Hasil akhir ditentukan oleh kombinasi status sistem pakar dan prediksi
          XGBoost menggunakan aturan berikut:
        </p>

        {/* Mobile-friendly card list */}
        <div className="mt-5 grid gap-2">
          {hybridRules.map((rule, index) => (
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

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-5 text-amber-200">
              <span className="font-bold">Fallback:</span> Jika machine
              learning tidak tersedia, sistem menggunakan hasil expert system
              sebagai fallback agar sistem tetap dapat berjalan sebagai sistem
              pakar murni.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
