import {
  ArrowRight,
  Cpu,
  GitBranch,
  Globe2,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import GlassCard from "@/components/ui-custom/GlassCard";

const steps = [
  {
    label: "URL Input",
    detail: "User submits a website address for defensive analysis.",
    icon: Globe2,
  },
  {
    label: "Feature Extraction",
    detail: "Runtime extracts symbolic facts F01-F30.",
    icon: ListChecks,
  },
  {
    label: "Forward Chaining",
    detail: "Expert rules evaluate working memory first.",
    icon: GitBranch,
  },
  {
    label: "XGBoost Prediction",
    detail: "Primary ML model validates the risk pattern.",
    icon: Cpu,
  },
  {
    label: "Hybrid Decision",
    detail: "Final result combines inference and ML evidence.",
    icon: ShieldCheck,
  },
];

interface SystemFlowProps {
  observeReady?: boolean;
}

export default function SystemFlow({ observeReady = true }: SystemFlowProps) {
  return (
    <section className="px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal observe={observeReady}>
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
                System Flow
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
                Expert-system-first detection pipeline
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              The visual order mirrors the backend runtime: rules and forward
              chaining come before the optimized ML decision layer.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-fr">
          {steps.map(({ detail, icon: Icon, label }, index) => (
            <Reveal
              className="h-full"
              delay={index * 0.06}
              key={label}
              observe={observeReady}
            >
              <div className="relative h-full">
                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(100%-8px)] top-1/2 z-20 hidden w-8 -translate-y-1/2 items-center justify-center text-cyan-300/50 lg:flex">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
                <GlassCard className="h-full min-h-[13.5rem] p-5" interactive={false}>
                  <div className="flex h-full flex-col">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                        <Icon className="h-5 w-5 text-cyan-200" />
                      </span>
                      <span className="font-mono text-[11px] font-black uppercase tracking-widest text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-50">
                      {label}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
                      {detail}
                    </p>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
