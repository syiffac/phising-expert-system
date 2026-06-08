import GlassCard from "@/components/ui-custom/GlassCard";
import FeatureValueBadge from "@/components/ui-custom/FeatureValueBadge";
import type {
  Facts,
  FeatureSources,
  FeatureStatus,
  KnowledgeFeature,
} from "@/types/detect";

interface FactsGridProps {
  facts: Facts;
  featureCatalog?: KnowledgeFeature[];
  featureSources: FeatureSources;
  featureStatus: FeatureStatus;
}

const fallbackFeatureCodes = Array.from({ length: 30 }, (_, index) => ({
  code: `F${String(index + 1).padStart(2, "0")}`,
  description: "Feature metadata is unavailable from backend.",
  name: `Feature ${String(index + 1).padStart(2, "0")}`,
  source: "runtime extraction",
}));

function describeValue(value: number | undefined) {
  if (value === 1) {
    return "legitimate signal";
  }
  if (value === 0) {
    return "suspicious signal";
  }
  if (value === -1) {
    return "phishing signal";
  }
  return "not returned";
}

export default function FactsGrid({
  facts,
  featureCatalog = [],
  featureSources,
  featureStatus,
}: FactsGridProps) {
  const featureCodes =
    featureCatalog.length > 0
      ? featureCatalog
      : fallbackFeatureCodes;

  return (
    <GlassCard className="p-5 sm:p-6" interactive={false}>
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
            Working Memory
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-50">
            Evaluated Facts F01-F30
          </h3>
        </div>
        <GlassCard
          borderRadius={999}
          className="w-fit px-3 py-1.5 font-mono text-xs font-bold text-slate-300"
          glassIntensity="soft"
          interactive={false}
          width="fit-content"
        >
          {featureCodes.length} facts
        </GlassCard>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/[0.08] bg-slate-950/20 backdrop-blur-xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-slate-900/[0.20]">
              <th className="py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Feature Code</th>
              <th className="py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Feature Name & Description</th>
              <th className="py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Value & Interpretation</th>
              <th className="py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Source</th>
            </tr>
          </thead>
          <tbody>
            {featureCodes.map(({ code, description, name, source: catalogSource }) => {
              const value = facts[code];
              const status =
                featureStatus[code] || (value === undefined ? "unknown" : "available");
              const source = featureSources[code] || catalogSource || "runtime extraction";
              const isImputed = status === "imputed_unknown" || status === "imputed";

              return (
                <tr key={code} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-3.5 px-4 align-top font-mono text-xs font-black text-cyan-300">{code}</td>
                  <td className="py-3.5 px-4 align-top">
                    <p className="text-sm font-bold text-slate-200">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-450">{description}</p>
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-2 items-start">
                      <FeatureValueBadge isImputed={isImputed} status={status} value={value} />
                      <span className="text-xs font-semibold capitalize text-slate-400">
                        {describeValue(value)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono text-xs text-slate-400">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-300 capitalize">{source}</span>
                      <span className="text-[10px] text-slate-500">Status: {status}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact List View (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {featureCodes.map(({ code, description, name, source: catalogSource }) => {
          const value = facts[code];
          const status =
            featureStatus[code] || (value === undefined ? "unknown" : "available");
          const source = featureSources[code] || catalogSource || "runtime extraction";
          const isImputed = status === "imputed_unknown" || status === "imputed";

          return (
            <GlassCard
              borderRadius={20}
              className="min-w-0 p-4 flex flex-col justify-between"
              glassIntensity="soft"
              interactive
              key={code}
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/[0.08] pb-3 mb-3">
                <span className="font-mono text-xs font-black text-cyan-300">{code}</span>
                <FeatureValueBadge isImputed={isImputed} status={status} value={value} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-200">{name}</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400 line-clamp-3">{description}</p>
                <p className="mt-2 text-xs font-semibold capitalize text-slate-400">
                  Interpretation: {describeValue(value)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Source: {source}</span>
                <span>Status: {status}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </GlassCard>
  );
}
