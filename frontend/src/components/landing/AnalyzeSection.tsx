import { AlertOctagon, Check, Loader2, Search } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import GlassCard from "@/components/ui-custom/GlassCard";

interface AnalyzeSectionProps {
  errorMessage: string;
  inputUrl: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  observeReady?: boolean;
}

const technicalBadges = [
  "30 Expert Features",
  "91 ML Features",
  "Resilient Extraction",
  "Unknown-as-Suspicious",
];

export default function AnalyzeSection({
  errorMessage,
  inputUrl,
  loading,
  onInputChange,
  onSubmit,
  observeReady = true,
}: AnalyzeSectionProps) {
  return (
    <section
      className="border-y border-white/10 bg-transparent px-4 py-16 sm:px-6 md:px-8 md:py-20"
      id="analyze"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal observe={observeReady}>
          <div className="mb-8 text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
              Runtime mode: Optimized Hybrid XGBoost
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Analyze a Website URL
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              Enter a URL to evaluate phishing risk using expert rules and
              machine learning.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} observe={observeReady}>
          <GlassCard className="p-4 sm:p-6 md:p-8" glow interactive={false}>
            <form
              className="grid gap-4 lg:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <div className="min-w-0">
                <label
                  className="mb-2 block text-sm font-semibold text-slate-200"
                  htmlFor="detect-url-input"
                >
                  Website URL
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    autoComplete="url"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-slate-50 outline-none transition duration-200 placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
                    id="detect-url-input"
                    onChange={(event) => onInputChange(event.target.value)}
                    placeholder="https://example.com/login"
                    type="text"
                    value={inputUrl}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition duration-200 hover:bg-cyan-200 hover:shadow-[0_0_22px_rgba(34,211,238,0.30)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                  disabled={loading}
                  id="detect-url-button"
                  type="submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze URL"
                  )}
                </button>
              </div>
            </form>

            {errorMessage && (
              <GlassCard
                borderRadius={20}
                className="mt-5 flex items-start gap-3 border-rose-500/25 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100"
                glassIntensity="soft"
                interactive={false}
              >
                <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <p>{errorMessage}</p>
              </GlassCard>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2.5 border-t border-white/10 pt-5">
              {technicalBadges.map((badge) => (
                <GlassCard
                  borderRadius={999}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300"
                  glassIntensity="soft"
                  interactive={false}
                  key={badge}
                  width="fit-content"
                >
                  <Check className="h-3.5 w-3.5 text-cyan-300" />
                  {badge}
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
