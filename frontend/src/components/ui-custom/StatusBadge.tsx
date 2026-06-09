import React from "react";
import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "unknown").trim().toLowerCase();
  let classes = "border-slate-500/20 bg-slate-500/10 text-slate-300";
  let label = status || "Unknown";

  if (normalized === "legitimate" || normalized === "safe") {
    classes = "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    label = "Legitimate";
  } else if (normalized === "suspicious" || normalized === "warning") {
    classes = "border-amber-500/25 bg-amber-500/10 text-amber-300";
    label = "Suspicious";
  } else if (normalized === "phishing" || normalized === "danger") {
    classes = "border-red-500/35 bg-red-500/10 text-red-300";
    label = "Phishing";
  } else if (normalized === "imputed_unknown" || normalized === "unknown") {
    classes = "border-sky-500/25 bg-sky-500/10 text-sky-300";
    label = normalized === "imputed_unknown" ? "Imputed" : "Unknown";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize leading-none",
        classes,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
