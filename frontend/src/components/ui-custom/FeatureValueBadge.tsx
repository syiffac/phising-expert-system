import React from "react";
import { cn } from "@/lib/cn";

interface FeatureValueBadgeProps {
  value?: number | string | null;
  status?: string | null;
  isImputed?: boolean;
  className?: string;
}

export default function FeatureValueBadge({
  value,
  status,
  isImputed,
  className,
}: FeatureValueBadgeProps) {
  const normalizedStatus = (status || "").toLowerCase();
  let classes = "border-slate-600/40 bg-slate-800/70 text-slate-300";
  let label = value === null || value === undefined ? "Unknown" : String(value);

  if (isImputed || normalizedStatus === "imputed_unknown" || normalizedStatus === "imputed") {
    // Imputed/Unknown: #38BDF8 (Sky) | Resilient missing features indicator
    classes = "border-sky-500/20 bg-sky-500/10 text-sky-400";
    label = "Imputed/Unknown";
  } else {
    const val = Number(value);
    if (val === 1) {
      // value = 1 (Aman): Berwarna hijau (text-emerald-400 bg-emerald-500/5).
      classes = "border-emerald-500/15 bg-emerald-500/5 text-emerald-400";
      label = "1 safe";
    } else if (val === 0) {
      // value = 0 (Mencurigakan/Netral): Berwarna kuning/amber (text-amber-400 bg-amber-500/5).
      classes = "border-amber-500/15 bg-amber-500/5 text-amber-400";
      label = "0 suspicious";
    } else if (val === -1) {
      // value = -1 (Berbahaya/Phishing): Berwarna merah/rose (text-rose-400 bg-rose-500/5).
      classes = "border-rose-500/15 bg-rose-500/5 text-rose-400";
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

