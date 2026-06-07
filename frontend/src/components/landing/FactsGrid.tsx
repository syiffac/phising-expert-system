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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {featureCodes.map(({ code, description, name, source: catalogSource }) => {
          const value = facts[code];
          const status =
            featureStatus[code] || (value === undefined ? "unknown" : "available");
          const source = featureSources[code] || catalogSource || "runtime extraction";

          return (
            <GlassCard
              borderRadius={20}
              className="min-w-0 p-4"
              glassIntensity="soft"
              interactive
              key={code}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-black text-cyan-200">
                    {code}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                    {name}
                  </p>
                </div>
                <FeatureValueBadge status={status} value={value} />
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs font-semibold capitalize text-slate-400">
                  {describeValue(value)}
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                  {description}
                </p>
                <p className="mt-2 break-words font-mono text-[11px] leading-5 text-slate-600">
                  {status} | {source}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </GlassCard>
  );
}
