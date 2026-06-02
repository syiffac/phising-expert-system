import React from "react";
import { cn } from "@/lib/cn";

interface MetricPillProps {
  label: string;
  value: string;
  tone?: "cyan" | "teal" | "blue" | "violet" | "emerald" | "amber" | "rose" | "slate";
  icon?: React.ReactNode;
  className?: string;
}

const toneClasses: Record<NonNullable<MetricPillProps["tone"]>, string> = {
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-200",
  slate: "border-slate-600/30 bg-slate-800/60 text-slate-200",
  teal: "border-teal-500/20 bg-teal-500/10 text-teal-200",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-200",
};

export default function MetricPill({
  label,
  value,
  tone = "cyan",
  icon,
  className,
}: MetricPillProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 shadow-lg shadow-black/10",
        toneClasses[tone],
        className
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider opacity-75">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 font-mono text-lg font-black leading-none text-slate-50">
        {value}
      </p>
    </div>
  );
}
