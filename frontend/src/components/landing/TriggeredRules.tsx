import { CheckCircle2, FileWarning } from "lucide-react";
import GlassCard from "@/components/ui-custom/GlassCard";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import type { TriggeredRule } from "@/types/detect";

interface TriggeredRulesProps {
  rules: TriggeredRule[];
}

export default function TriggeredRules({ rules }: TriggeredRulesProps) {
  return (
    <GlassCard className="p-5 sm:p-6" interactive={false}>
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
            IF-THEN Rule Base
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-50">
            Triggered Expert Rules
          </h3>
        </div>
        <GlassCard
          borderRadius={999}
          className="w-fit px-3 py-1.5 font-mono text-xs font-bold text-slate-300"
          glassIntensity="soft"
          interactive={false}
          width="fit-content"
        >
          {rules.length} triggered
        </GlassCard>
      </div>

      {rules.length === 0 ? (
        <GlassCard
          borderRadius={20}
          className="flex items-start gap-3 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100"
          glassIntensity="soft"
          interactive={false}
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <p>No expert rules triggered.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {rules.map((rule, index) => (
            <GlassCard
              borderRadius={20}
              className="p-4"
              glassIntensity="soft"
              interactive
              key={`${rule.code || "rule"}-${index}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                    <FileWarning className="h-5 w-5 text-amber-200" />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-black text-cyan-200">
                      {rule.code || `R${index + 1}`}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Severity: {rule.severity || "not provided"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={rule.conclusion || rule.severity || "suspicious"} />
              </div>

              {rule.explanation && (
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {rule.explanation}
                </p>
              )}

              {rule.source && (
                <p className="mt-3 break-words font-mono text-[11px] leading-5 text-slate-500">
                  Source: {rule.source}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
