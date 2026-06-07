import React from "react";
import {
  AlertTriangle,
  Cpu,
  Database,
  GitBranch,
  Globe2,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import FactsGrid from "@/components/landing/FactsGrid";
import TriggeredRules from "@/components/landing/TriggeredRules";
import GlassCard from "@/components/ui-custom/GlassCard";
import ProgressBar from "@/components/ui-custom/ProgressBar";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import type {
  DetectResponse,
  EvaluationData,
  KnowledgeFeature,
  RuntimeModelMetrics,
} from "@/types/detect";

interface ResultDashboardProps {
  evaluationData?: EvaluationData | null;
  featureCatalog?: KnowledgeFeature[];
  result: DetectResponse;
}

function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function normalizeStatus(status: string | undefined) {
  return (status || "unknown").trim().toLowerCase();
}

function formatModelName(value: string | undefined) {
  if (!value) {
    return "-";
  }

  return value
    .replace("augmented", "Augmented")
    .replace("symbolic", "Symbolic")
    .replace("robust", "Robust")
    .replace("clean", "Clean")
    .replace("xgboost", "XGBoost")
    .replace("random_forest", "Random Forest")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ModelEvaluationStrip({
  metrics,
}: {
  metrics?: RuntimeModelMetrics;
}) {
  if (!metrics) {
    return null;
  }

  const robust = metrics.robust_test;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {[
        ["Robust Accuracy", robust.accuracy],
        ["Robust F1", robust.f1_score],
        ["Phishing Recall", robust.phishing_recall ?? robust.recall],
      ].map(([label, value]) => (
        <div
          className="rounded-xl border border-white/[0.08] bg-slate-950/35 p-3"
          key={label as string}
        >
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 font-mono text-sm font-black text-slate-100">
            {formatConfidence(value as number)}
          </p>
        </div>
      ))}
    </div>
  );
}

function statusCopy(status: string | undefined) {
  const normalized = normalizeStatus(status);

  if (normalized === "phishing") {
    return {
      accent: "text-rose-200",
      border: "border-rose-500/25",
      icon: <ShieldAlert className="h-8 w-8 text-rose-200" />,
      message: "High-risk phishing indicators were found. Do not submit credentials.",
      panel: "bg-rose-500/10",
    };
  }

  if (normalized === "suspicious") {
    return {
      accent: "text-amber-200",
      border: "border-amber-500/25",
      icon: <AlertTriangle className="h-8 w-8 text-amber-200" />,
      message: "Mixed indicators need review before trusting this website.",
      panel: "bg-amber-500/10",
    };
  }

  if (normalized === "legitimate") {
    return {
      accent: "text-emerald-200",
      border: "border-emerald-500/25",
      icon: <ShieldCheck className="h-8 w-8 text-emerald-200" />,
      message: "The submitted URL was classified as legitimate by the hybrid runtime.",
      panel: "bg-emerald-500/10",
    };
  }

  return {
    accent: "text-sky-200",
    border: "border-sky-500/25",
    icon: <Info className="h-8 w-8 text-sky-200" />,
    message: "The backend returned an unknown final state.",
    panel: "bg-sky-500/10",
  };
}

const cardLabel = "font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500";
const cardValue = "mt-1 break-words text-sm font-semibold text-slate-100";

const ResultDashboard = React.forwardRef<HTMLElement, ResultDashboardProps>(
  function ResultDashboard(
    { evaluationData, featureCatalog = [], result },
    ref
  ) {
    const facts = result.facts ?? {};
    const featureStatus = result.feature_status ?? {};
    const featureSources = result.feature_sources ?? {};
    const featureQuality = result.feature_quality;
    const expertSystem = result.expert_system;
    const machineLearning = result.machine_learning;
    const evaluationModels =
      evaluationData?.optimized_hybrid?.metrics.models ?? {};
    const primaryModelKey =
      machineLearning?.primary_model?.name ||
      evaluationData?.optimized_hybrid?.selected_runtime_model ||
      "augmented_robust_xgboost";
    const comparisonModelKey =
      machineLearning?.comparison_model?.name || "augmented_robust_random_forest";
    const primaryMetrics = evaluationModels[primaryModelKey];
    const comparisonMetrics = evaluationModels[comparisonModelKey];
    const triggeredRules = expertSystem?.triggered_rules ?? [];
    const status = statusCopy(result.final_result);
    const mlFeatureTotal = machineLearning?.feature_set?.total_features ?? 91;
    const mlFeatureType = machineLearning?.feature_set?.type ?? "augmented";
    const mlFeatureQuality =
      machineLearning?.feature_quality || featureQuality;

    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20"
        id="result-dashboard"
        ref={ref}
      >
        <Reveal>
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
                Diagnostic Report
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
                Result Dashboard
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <GlassCard
                borderRadius={999}
                className="inline-flex items-center gap-2 px-3 py-1.5"
                glassIntensity="soft"
                interactive={false}
                width="fit-content"
              >
                <Globe2 className="h-3.5 w-3.5 text-cyan-300" />
                {result.hostname || "hostname unavailable"}
              </GlassCard>
              <GlassCard
                borderRadius={999}
                className="px-3 py-1.5 font-mono"
                glassIntensity="soft"
                interactive={false}
                width="fit-content"
              >
                {result.analysis_mode || "manual_url_optimized_hybrid_xgboost"}
              </GlassCard>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <GlassCard
              className={`${status.border} ${status.panel} h-full p-5 sm:p-6`}
              glow
              interactive={false}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cardLabel}>Final Result</p>
                  <h3 className={`mt-3 text-3xl font-black capitalize ${status.accent}`}>
                    {result.final_result || "unknown"}
                  </h3>
                </div>
                <GlassCard
                  borderRadius={20}
                  className="flex h-14 w-14 shrink-0 items-center justify-center"
                  glassIntensity="soft"
                  height={56}
                  interactive={false}
                  width={56}
                >
                  {status.icon}
                </GlassCard>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-200">{status.message}</p>

              <GlassCard
                borderRadius={20}
                className="mt-6 grid gap-3 p-4"
                glassIntensity="soft"
                interactive={false}
              >
                <div>
                  <p className={cardLabel}>Normalized URL</p>
                  <p className={cardValue}>{result.normalized_url || result.url || "-"}</p>
                </div>
                <div>
                  <p className={cardLabel}>Hostname</p>
                  <p className={cardValue}>{result.hostname || "-"}</p>
                </div>
              </GlassCard>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.08}>
            <GlassCard className="h-full p-5 sm:p-6" interactive={false}>
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className={cardLabel}>Expert System Inference</p>
                  <h3 className="mt-2 text-lg font-black text-slate-50">
                    Forward Chaining
                  </h3>
                </div>
                <GitBranch className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                  <p className={cardLabel}>Method</p>
                  <p className={cardValue}>Forward Chaining</p>
                </GlassCard>
                <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                  <p className={cardLabel}>Initial Status</p>
                  <div className="mt-2">
                    <StatusBadge status={expertSystem?.initial_status} />
                  </div>
                </GlassCard>
                <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                  <p className={cardLabel}>Triggered Rules Count</p>
                  <p className="mt-1 font-mono text-2xl font-black text-cyan-200">
                    {expertSystem?.total_triggered_rules ?? triggeredRules.length}
                  </p>
                </GlassCard>
                <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                  <p className={cardLabel}>Knowledge Base</p>
                  <p className={cardValue}>F01-F30</p>
                </GlassCard>
              </div>
            </GlassCard>
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal delay={0.1}>
            <GlassCard className="h-full p-5 sm:p-6" interactive={false}>
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className={cardLabel}>Machine Learning Prediction</p>
                  <h3 className="mt-2 text-lg font-black text-slate-50">
                    XGBoost primary, Random Forest comparison
                  </h3>
                </div>
                <Cpu className="h-5 w-5 text-cyan-300" />
              </div>

              {machineLearning?.available ? (
                <div className="grid gap-3">
                  <GlassCard
                    borderRadius={20}
                    className="border-cyan-300/20 bg-cyan-300/10 p-4"
                    glassIntensity="soft"
                    interactive={false}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-200">
                          PRIMARY MODEL
                        </p>
                        <h4 className="mt-2 text-base font-black text-slate-50">
                          {formatModelName(machineLearning.primary_model?.name)}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-200/80">
                          {machineLearning.primary_model?.algorithm || "xgboost"}
                        </p>
                      </div>
                      <StatusBadge status={machineLearning.primary_model?.prediction} />
                    </div>
                    <p className="mt-4 font-mono text-2xl font-black text-cyan-100">
                      {formatConfidence(machineLearning.primary_model?.confidence)}
                    </p>
                    <ModelEvaluationStrip metrics={primaryMetrics} />
                  </GlassCard>

                  <GlassCard
                    borderRadius={20}
                    className="p-4"
                    glassIntensity="soft"
                    interactive={false}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          COMPARISON ONLY
                        </p>
                        <h4 className="mt-2 text-base font-black text-slate-50">
                          {formatModelName(machineLearning.comparison_model?.name)}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {machineLearning.comparison_model?.algorithm ||
                            "random_forest"}
                        </p>
                      </div>
                      {machineLearning.comparison_model?.available === false ? (
                        <StatusBadge status="unknown" />
                      ) : (
                        <StatusBadge
                          status={machineLearning.comparison_model?.prediction}
                        />
                      )}
                    </div>
                    <p className="mt-4 font-mono text-xl font-black text-slate-200">
                      {formatConfidence(machineLearning.comparison_model?.confidence)}
                    </p>
                    <ModelEvaluationStrip metrics={comparisonMetrics} />
                  </GlassCard>
                </div>
              ) : (
                <GlassCard
                  borderRadius={20}
                  className="border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100"
                  glassIntensity="soft"
                  interactive={false}
                >
                  Machine learning prediction is not available from the backend.
                </GlassCard>
              )}

              <GlassCard
                borderRadius={20}
                className="mt-5 p-3 text-xs leading-6 text-slate-400"
                glassIntensity="soft"
                interactive={false}
              >
                Soft voting is not used in runtime.
              </GlassCard>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.16}>
            <GlassCard className="h-full p-5 sm:p-6" interactive={false}>
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className={cardLabel}>Feature Quality</p>
                  <h3 className="mt-2 text-lg font-black text-slate-50">
                    Extraction completeness and imputation
                  </h3>
                </div>
                <Database className="h-5 w-5 text-cyan-300" />
              </div>

              {mlFeatureQuality ? (
                <div className="grid gap-5">
                  <ProgressBar
                    imputedCount={mlFeatureQuality.imputed_unknown}
                    label="Available expert features"
                    max={mlFeatureQuality.total_features}
                    value={mlFeatureQuality.available}
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                      <p className={cardLabel}>Total Features</p>
                      <p className="mt-1 font-mono text-2xl font-black text-slate-50">
                        {mlFeatureQuality.total_features}
                      </p>
                    </GlassCard>
                    <GlassCard
                      borderRadius={20}
                      className="border-emerald-500/20 bg-emerald-500/10 p-4"
                      glassIntensity="soft"
                      interactive={false}
                    >
                      <p className={cardLabel}>Available</p>
                      <p className="mt-1 font-mono text-2xl font-black text-emerald-200">
                        {mlFeatureQuality.available}
                      </p>
                    </GlassCard>
                    <GlassCard
                      borderRadius={20}
                      className="border-sky-500/20 bg-sky-500/10 p-4"
                      glassIntensity="soft"
                      interactive={false}
                    >
                      <p className={cardLabel}>Imputed Unknown</p>
                      <p className="mt-1 font-mono text-2xl font-black text-sky-200">
                        {mlFeatureQuality.imputed_unknown}
                      </p>
                    </GlassCard>
                  </div>

                  {mlFeatureQuality.imputed_unknown > 0 && (
                    <GlassCard
                      borderRadius={20}
                      className="border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100"
                      glassIntensity="soft"
                      interactive={false}
                    >
                      Some features were encoded as unknown/suspicious because
                      extraction failed.
                    </GlassCard>
                  )}

                  <GlassCard borderRadius={20} className="p-4" glassIntensity="soft" interactive={false}>
                    <p className={cardLabel}>Imputed Features</p>
                    <p className={cardValue}>
                      {mlFeatureQuality.imputed_features.length > 0
                        ? mlFeatureQuality.imputed_features.join(", ")
                        : "None"}
                    </p>
                    <p className="mt-3 font-mono text-xs text-slate-500">
                      ML feature set: {mlFeatureTotal} {mlFeatureType} features
                    </p>
                  </GlassCard>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Feature quality was not returned by the backend.
                </p>
              )}
            </GlassCard>
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5">
          <Reveal delay={0.08}>
            <TriggeredRules rules={triggeredRules} />
          </Reveal>
          <Reveal delay={0.12}>
            <FactsGrid
              facts={facts}
              featureCatalog={featureCatalog}
              featureSources={featureSources}
              featureStatus={featureStatus}
            />
          </Reveal>
        </div>

        {result.note && (
          <Reveal delay={0.14}>
            <GlassCard
              className="mt-5 p-4 text-sm leading-7 text-slate-400"
              glassIntensity="soft"
              interactive={false}
            >
              <span className="font-semibold text-slate-200">Backend note:</span>{" "}
              {result.note}
            </GlassCard>
          </Reveal>
        )}
      </section>
    );
  }
);

export default ResultDashboard;

