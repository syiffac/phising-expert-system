import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Cpu,
  Database,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import GlassCard from "@/components/ui-custom/GlassCard";
import LetterGlitchHero from "@/components/visual/LetterGlitchHero";
import HeroIllustration from "@/components/visual/HeroIllustration";
import BlurText from "@/components/BlurText";

const badges = [
  { label: "Rule-Based Expert System", icon: ShieldCheck },
  { label: "Forward Chaining", icon: GitBranch },
  { label: "XGBoost Primary Model", icon: Cpu },
  { label: "Random Forest Comparison", icon: Database },
];

interface HeroSectionProps {
  observeReady?: boolean;
}

export default function HeroSection({
  observeReady = true,
}: HeroSectionProps) {
  return (
    <section
      className="relative isolate mx-auto grid w-full max-w-7xl items-center gap-10 overflow-hidden px-4 pt-28 pb-10 sm:px-6 md:px-8 md:pt-36 md:pb-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:gap-8 xl:gap-12"
      id="hero"
    >
      <Reveal observe={observeReady}>
        <div className="relative z-10 min-w-0 max-w-[21.5rem] sm:max-w-[42rem]">
          <div
            aria-label="Detection capabilities"
            className="-mx-4 flex max-w-[calc(100vw-1rem)] flex-nowrap gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {badges.map(({ icon: Icon, label }) => (
              <GlassCard
                borderRadius={999}
                className="inline-flex shrink-0 items-center gap-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 sm:px-3.5 sm:text-[11px]"
                glassIntensity="soft"
                interactive={false}
                key={label}
                width="auto"
              >
                <Icon className="h-3.5 w-3.5 text-cyan-300" />
                <span className="whitespace-nowrap">{label}</span>
              </GlassCard>
            ))}
          </div>

          <h1 className="mt-7 max-w-[21.5rem] text-3xl font-black leading-[1.08] tracking-tight text-slate-50 sm:max-w-[40rem] sm:text-4xl md:text-5xl xl:text-6xl">
            <span className="block sm:hidden">
              <BlurText
                text="Hybrid Expert"
                delay={120}
                animateBy="words"
                direction="bottom"
                className="text-3xl font-black leading-[1.08] tracking-tight text-slate-50"
                stepDuration={0.4}
                startAnimation={observeReady}
              />
            </span>
            <span className="block sm:hidden">
              <BlurText
                text="System for"
                delay={120}
                animateBy="words"
                direction="bottom"
                className="text-3xl font-black leading-[1.08] tracking-tight text-slate-50"
                stepDuration={0.4}
                startAnimation={observeReady}
              />
            </span>
            <span className="hidden sm:block">
              <BlurText
                text="Hybrid Expert System for"
                delay={120}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-slate-50"
                stepDuration={0.4}
                startAnimation={observeReady}
              />
            </span>
            <span className="block">
              <BlurText
                text="Phishing Website"
                delay={120}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-cyan-200"
                stepDuration={0.4}
                startAnimation={observeReady}
              />
            </span>
            <span className="block">
              <BlurText
                text="Detection"
                delay={120}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-slate-50"
                stepDuration={0.4}
                startAnimation={observeReady}
              />
            </span>
          </h1>

          <p className="mt-6 max-w-[21.5rem] text-base leading-8 text-slate-300 sm:max-w-[37rem] md:text-lg">
            Analyze suspicious URLs using forward chaining expert rules and
            optimized XGBoost machine learning.
          </p>

          <div className="mt-8 flex max-w-[21.5rem] flex-col gap-3 sm:max-w-[37rem] sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition duration-200 hover:bg-cyan-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.34)] active:scale-[0.98] sm:w-auto"
              href="#analyze"
            >
              Analyze URL Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 transition duration-200 hover:border-cyan-300/30 hover:bg-white/[0.07] active:scale-[0.98] sm:w-auto"
              href="/evaluation"
            >
              <BarChart3 className="h-4 w-4 text-cyan-300" />
              View Model Evaluation
            </Link>
          </div>

          <div className="mt-10 grid max-w-[21.5rem] grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:max-w-[37rem] sm:grid-cols-3">
            <div className="min-w-0">
              <p className="font-mono text-xl font-black text-cyan-200 sm:text-2xl">
                F01-F30
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Knowledge Base Facts
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xl font-black text-teal-200 sm:text-2xl">
                91
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Augmented ML Features
              </p>
            </div>
            <div className="min-w-0">
              <p className="break-words font-mono text-xl font-black text-blue-200 sm:text-2xl">
                Runtime
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Optimized Hybrid XGBoost
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="relative z-10" delay={0.16} observe={observeReady}>
        <div className="hero-visual-enter relative mx-auto mt-4 w-full max-w-[21.5rem] sm:max-w-[43rem] md:mt-0 lg:max-w-none lg:-ml-4">
          {/* Ambient glow behind illustration */}
          <div
            aria-hidden="true"
            className="hero-visual-glow absolute -inset-10 rounded-[48px] bg-[radial-gradient(circle_at_60%_42%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.14),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(20,184,166,0.12),transparent_36%)] blur-3xl"
          />

          <div className="hero-visual-float relative">
            {/* Soft depth shadow */}
            <div className="absolute inset-x-6 top-12 bottom-0 rounded-[36px] bg-cyan-950/15 blur-3xl" />

            {/* Glass wrapper for illustration */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-slate-950/[0.18] shadow-[0_24px_80px_rgba(8,145,178,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
              {/* LetterGlitch as subtle background accent */}
              <LetterGlitchHero className="opacity-60" />

              {/* Vignette overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_60%_45%,transparent_30%,rgba(7,17,31,0.45)_100%)]"
              />

              {/* The illustration */}
              <div className="relative z-[2] p-4 md:p-6">
                <HeroIllustration />
              </div>

              {/* Top highlight */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px z-[3] bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />

              {/* Inner ring */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[3] rounded-[32px] ring-1 ring-inset ring-cyan-200/[0.06]"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
