"use client";

import { useState } from "react";
import { ChevronDown, Info, ListOrdered, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/ui-custom/GlassCard";
import { cn } from "@/lib/cn";

const steps = [
  "URL diubah menjadi fakta F01-F30 melalui proses ekstraksi fitur.",
  "Rule yang terpicu dihitung menjadi Expert Risk Score.",
  "XGBoost sebagai primary model menghasilkan ML Phishing Score.",
  "Hybrid Score dihitung dengan bobot 50:50 dari kedua skor.",
  "Final result mengikuti threshold hybrid dan safety guard.",
];

const badges = [
  { label: "0.5 x Expert + 0.5 x XGBoost", title: "Hybrid Score" },
  { label: "Primary Model", title: "XGBoost" },
  { label: "Comparison Only", title: "Random Forest" },
  { label: "Indikator Transparansi", title: "Imputed Unknown" },
];

export default function DecisionExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:px-8 md:pb-20">
      <RevealWrapper>
        <GlassCard className="p-5 sm:p-6" interactive={false}>
          <button
            className="flex w-full items-center justify-between gap-4 text-left"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Transparansi Keputusan
                </p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-slate-50 sm:text-xl">
                  Bagaimana Keputusan Ini Dibuat?
                </h2>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300",
                open && "rotate-180"
              )}
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              open ? "mt-5 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm leading-7 text-slate-300">
                PhishGuard menggabungkan Sistem Pakar dan XGBoost secara
                seimbang. Sistem Pakar memberi Expert Risk Score dari rule yang
                terpicu, XGBoost memberi ML Phishing Score dari prediksi dan
                confidence. Keduanya digabungkan dengan bobot 50:50. Random
                Forest hanya ditampilkan sebagai model pembanding.
              </p>

              <div className="mt-6 grid gap-3">
                {steps.map((step, index) => (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                    key={index}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 font-mono text-xs font-black text-cyan-200">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-300">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    className="flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                    key={badge.title}
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {badge.title}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-200">
                        {badge.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <div className="flex items-start gap-2">
                  <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <p className="text-xs leading-5 text-sky-200">
                    Contoh: 1 rule suspicious memberi Expert Risk Score 0.20.
                    Jika XGBoost legitimate dengan confidence 0.99, ML
                    Phishing Score menjadi 0.01 dan Hybrid Score 0.105, sehingga
                    final result adalah legitimate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </RevealWrapper>
    </section>
  );
}

function RevealWrapper({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
