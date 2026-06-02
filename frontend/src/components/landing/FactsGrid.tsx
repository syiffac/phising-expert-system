import GlassCard from "@/components/ui-custom/GlassCard";
import FeatureValueBadge from "@/components/ui-custom/FeatureValueBadge";
import type { Facts, FeatureSources, FeatureStatus } from "@/types/detect";

interface FactsGridProps {
  facts: Facts;
  featureSources: FeatureSources;
  featureStatus: FeatureStatus;
}

const featureNames = [
  "Have IP Address",
  "URL Length",
  "Shortening Service",
  "Having @ Symbol",
  "Double Slash Redirecting",
  "Prefix-Suffix",
  "Having Subdomain",
  "SSL Final State",
  "Domain Registration Length",
  "Favicon",
  "Port",
  "HTTPS Token",
  "Request URL",
  "URL of Anchor",
  "Links in Tags",
  "SFH / Server Form Handler",
  "Submitting to Email",
  "Abnormal URL",
  "Redirect",
  "On MouseOver",
  "Right Click Disabled",
  "Pop-Up Window",
  "IFrame",
  "Age of Domain",
  "DNS Record",
  "Web Traffic",
  "Page Rank",
  "Google Index",
  "Links Pointing to Page",
  "Statistical Report",
];

const featureCodes = featureNames.map((name, index) => ({
  code: `F${String(index + 1).padStart(2, "0")}`,
  name,
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
  featureSources,
  featureStatus,
}: FactsGridProps) {
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
          30 facts
        </GlassCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {featureCodes.map(({ code, name }) => {
          const value = facts[code];
          const status =
            featureStatus[code] || (value === undefined ? "unknown" : "available");
          const source = featureSources[code] || "runtime extraction";

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
