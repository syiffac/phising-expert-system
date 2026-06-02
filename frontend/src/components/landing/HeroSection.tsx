import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  ListChecks,
  Shield,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import FeatureValueBadge from "@/components/ui-custom/FeatureValueBadge";
import GlassCard from "@/components/ui-custom/GlassCard";
import MetricPill from "@/components/ui-custom/MetricPill";
import ProgressBar from "@/components/ui-custom/ProgressBar";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import BlurText from "@/components/BlurText";

const badges = [
  { label: "Rule-Based Expert System", icon: ShieldCheck },
  { label: "Forward Chaining", icon: GitBranch },
  { label: "XGBoost Primary Model", icon: Cpu },
  { label: "Random Forest Comparison", icon: Database },
];

export default function HeroSection() {
  return (
    <section
      className="relative isolate mx-auto grid w-full max-w-7xl items-center gap-10 overflow-hidden px-4 pt-28 pb-10 sm:px-6 md:px-8 md:pt-36 md:pb-16 lg:grid-cols-[1.02fr_0.98fr]"
      id="hero"
    >
      <Reveal>
        <div className="relative z-10 max-w-[22rem] sm:max-w-3xl">
          <div className="grid max-w-full gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            {badges.map(({ icon: Icon, label }) => (
              <GlassCard
                borderRadius={999}
                className="inline-flex w-fit max-w-full items-center gap-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 sm:text-[11px]"
                glassIntensity="soft"
                interactive={false}
                key={label}
                width="fit-content"
              >
                <Icon className="h-3.5 w-3.5 text-cyan-300" />
                <span className="truncate">{label}</span>
              </GlassCard>
            ))}
          </div>

          <h1 className="mt-7 max-w-[22rem] text-3xl font-black leading-tight tracking-tight text-slate-50 sm:max-w-4xl sm:text-4xl md:text-5xl lg:text-6xl flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
            <BlurText
              text="Hybrid Expert System for"
              delay={40}
              animateBy="words"
              className="inline"
            />
            <BlurText
              text="Phishing Website"
              delay={40}
              animateBy="words"
              className="inline text-cyan-200"
            />
            <BlurText
              text="Detection"
              delay={40}
              animateBy="words"
              className="inline"
            />
          </h1>

          <p className="mt-6 max-w-[22rem] text-base leading-8 text-slate-300 sm:max-w-2xl md:text-lg">
            Analyze suspicious URLs using forward chaining expert rules and
            optimized XGBoost machine learning.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full max-w-[22rem] items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition duration-200 hover:bg-cyan-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.34)] active:scale-[0.98] sm:w-auto"
              href="#analyze"
            >
              Analyze URL Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex w-full max-w-[22rem] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 transition duration-200 hover:border-cyan-300/30 hover:bg-white/[0.07] active:scale-[0.98] sm:w-auto"
              href="/evaluation"
            >
              <BarChart3 className="h-4 w-4 text-cyan-300" />
              View Model Evaluation
            </Link>
          </div>

          <div className="mt-10 grid max-w-[22rem] grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:max-w-none">
            <div>
              <p className="font-mono text-xl font-black text-cyan-200 sm:text-2xl">F01-F30</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Knowledge Base Facts
              </p>
            </div>
            <div>
              <p className="font-mono text-xl font-black text-teal-200 sm:text-2xl">91</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Augmented ML Features
              </p>
            </div>
            <div>
              <p className="font-mono text-xl font-black text-blue-200 sm:text-2xl">Runtime</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Optimized Hybrid XGBoost
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div className="relative z-10 hidden md:block lg:pl-2">
          <div className="absolute inset-4 rounded-3xl bg-cyan-300/10 blur-3xl" />
          <GlassCard className="relative min-h-[500px] p-4 sm:p-5 md:p-6" glow>
            <div className="relative z-10 flex h-full min-h-[452px] flex-col gap-4">
              <GlassCard
                borderRadius={20}
                className="flex items-center justify-between gap-4 p-4"
                glassIntensity="soft"
                interactive={false}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                    <Shield className="h-5 w-5 text-cyan-200" />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-300">
                      Hybrid Decision Preview
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-300">
                      Expert-first inference with ML validation
                    </p>
                  </div>
                </div>
                <StatusBadge status="legitimate" />
              </GlassCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricPill
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Final Result"
                  tone="emerald"
                  value="Legitimate"
                />
                <MetricPill
                  icon={<ListChecks className="h-3.5 w-3.5" />}
                  label="Feature Quality"
                  tone="cyan"
                  value="30/30"
                />
                <MetricPill
                  icon={<Cpu className="h-3.5 w-3.5" />}
                  label="XGBoost Confidence"
                  tone="blue"
                  value="99.03%"
                />
                <MetricPill
                  icon={<GitBranch className="h-3.5 w-3.5" />}
                  label="Rules Triggered"
                  tone="violet"
                  value="0"
                />
              </div>

              <GlassCard
                borderRadius={20}
                className="mt-auto p-4"
                glassIntensity="soft"
                interactive={false}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Live Pipeline
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                    <Activity className="h-3 w-3" />
                    Ready
                  </span>
                </div>

                <GlassCard
                  borderRadius={16}
                  className="mb-4 p-3"
                  glassIntensity="soft"
                  interactive={false}
                >
                  <ProgressBar
                    label="Expert Feature Quality"
                    max={30}
                    value={30}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <FeatureValueBadge status="available" value={1} />
                    <FeatureValueBadge status="available" value={0} />
                    <FeatureValueBadge status="available" value={-1} />
                  </div>
                </GlassCard>

                <div className="grid grid-cols-5 gap-1.5">
                  {["URL", "F01-F30", "Rules", "XGB", "Decision"].map(
                    (item, index) => (
                      <div className="min-w-0" key={item}>
                        <div className="h-1.5 rounded-full bg-cyan-300/20">
                          <div
                            className="h-full rounded-full bg-cyan-300"
                            style={{ width: `${100 - index * 10}%` }}
                          />
                        </div>
                        <p className="mt-2 truncate text-center font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </div>
      </Reveal>
    </section>
  );
}
