import React from "react";
import { cn } from "@/lib/cn";
import { AlertTriangle } from "lucide-react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  imputedCount?: number;
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  label,
  imputedCount = 0,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <span className="font-mono text-xs font-bold text-cyan-300">
            {value}/{safeMax}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          aria-valuemax={safeMax}
          aria-valuemin={0}
          aria-valuenow={value}
          className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/10 bg-slate-950/80"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-300 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        
        {imputedCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            <span>{imputedCount} Imputed (Resilient)</span>
          </div>
        )}
      </div>
    </div>
  );
}
