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
import CyberHeroIllustration from "@/components/hero/CyberHeroIllustration";
import BlurText from "@/components/BlurText";
import FuzzyPhishingText from "@/components/landing/FuzzyPhishingText";

const badges = [
  { label: "Rule-Based System", icon: ShieldCheck },
  { label: "Forward Chaining", icon: GitBranch },
  { label: "XGBoost Primary", icon: Cpu },
  { label: "RF Comparison", icon: Database },
];

interface HeroSectionProps {
  observeReady?: boolean;
}

export default function HeroSection({
  observeReady = true,
}: HeroSectionProps) {
  return (
    <section
      className="relative isolate mx-auto grid w-full max-w-7xl items-center gap-8 overflow-hidden px-4 pt-20 pb-10 sm:px-6 sm:pt-24 md:px-8 md:pt-24 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1fr)] lg:gap-10 xl:gap-14"
      id="hero"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_42%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_86%_62%,rgba(139,92,246,0.12),transparent_28%),linear-gradient(90deg,rgba(7,17,31,0)_0%,rgba(11,18,32,0.30)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[16%] -z-10 h-[58%] w-[58%] rounded-full bg-cyan-300/[0.07] blur-3xl"
      />
      <Reveal observe={observeReady}>
        <div className="relative z-10 min-w-0">
          {/* Badges — compact */}
          <div
            aria-label="Detection capabilities"
            className="flex flex-wrap gap-1.5 sm:flex-nowrap sm:gap-2"
          >
            {badges.map(({ icon: Icon, label }) => (
              <GlassCard
                borderRadius={999}
                className="inline-flex shrink items-center gap-1 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:shrink-0 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]"
                glassIntensity="soft"
                interactive={false}
                key={label}
                width="auto"
              >
                <Icon className="h-2.5 w-2.5 text-cyan-400/70 sm:h-3 sm:w-3" />
                <span className="whitespace-nowrap">{label}</span>
              </GlassCard>
            ))}
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-3xl font-black leading-[1.08] tracking-tight text-slate-50 sm:text-4xl md:mt-7 md:text-5xl xl:text-6xl">
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
              <FuzzyPhishingText startAnimation={observeReady} />
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

          {/* Subtitle */}
          <p className="mt-5 max-w-[34rem] text-sm leading-7 text-slate-300 sm:text-base md:mt-6 md:text-lg md:leading-8">
            Analyze suspicious URLs using forward chaining expert rules and
            optimized XGBoost machine learning.
          </p>

          {/* CTA */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-8">
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

          {/* Stats */}
          <div className="mt-8 grid max-w-[20rem] grid-cols-3 gap-5 border-t border-white/10 pt-5 sm:max-w-[28rem]">
            <div className="min-w-0">
              <p className="font-mono text-lg font-black text-cyan-200 sm:text-xl">
                F01-F30
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                Knowledge Base
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-lg font-black text-teal-200 sm:text-xl">
                91
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                ML Features
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-lg font-black text-blue-200 sm:text-xl">
                Hybrid
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                XGBoost Runtime
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="relative z-10 flex items-start" delay={0.16} observe={observeReady}>
        <div className="hero-visual-enter relative mx-auto w-full max-w-[22rem] sm:max-w-[30rem] lg:max-w-[640px]">
          <CyberHeroIllustration />
        </div>
      </Reveal>
    </section>
  );
}
