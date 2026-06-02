import React from "react";
import { cn } from "@/lib/cn";

interface FeatureValueBadgeProps {
  value?: number | string | null;
  status?: string | null;
  className?: string;
}

export default function FeatureValueBadge({
  value,
  status,
  className,
}: FeatureValueBadgeProps) {
  const normalizedStatus = (status || "").toLowerCase();
  let classes = "border-slate-600/40 bg-slate-800/70 text-slate-300";
  let label = value === null || value === undefined ? "Unknown" : String(value);

  if (normalizedStatus === "imputed_unknown" || normalizedStatus === "imputed") {
    classes = "border-sky-500/25 bg-sky-500/10 text-sky-300";
    label = "0 imputed";
  } else {
    const val = Number(value);
    if (val === 1) {
      classes = "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
      label = "1 safe";
    } else if (val === 0) {
      classes = "border-amber-500/25 bg-amber-500/10 text-amber-300";
      label = "0 suspicious";
    } else if (val === -1) {
      classes = "border-rose-500/25 bg-rose-500/10 text-rose-300";
      label = "-1 phishing";
    }
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold uppercase leading-none",
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
