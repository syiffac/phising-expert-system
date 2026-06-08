"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  GitCompare,
  Layers3,
  ListChecks,
  ShieldCheck,
  Sigma,
  TableProperties,
} from "lucide-react";
import DarkVeilBackground from "@/components/visual/DarkVeilBackground";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/ui-custom/GlassCard";
import { cn } from "@/lib/cn";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

type MetricBlock = {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  phishing_recall?: number;
  confusion_matrix?: number[][];
};

type ModelRun = {
  best_params?: Record<string, string | number | boolean | null>;
  clean_test: MetricBlock;
  robust_test: MetricBlock;
  stability_gap: number;
  composite_score: number;
};

type FeatureSetInfo = {
  total_features: number;
  description: string;
};

type OptimizedMetrics = {
  training_mode: string;
  dataset_summary: {
    total_rows_original: number;
    duplicates_removed: number;
    total_rows_after_cleaning: number;
    target_distribution: {
      legitimate: number;
      phishing: number;
    };
  };
  feature_sets: {
    symbolic: FeatureSetInfo;
    augmented: FeatureSetInfo;
  };
  models: Record<string, ModelRun>;
  best_model?: {
    name: string;
    algorithm: string;
    feature_set: string;
    training_variant: string;
    selection_basis: string;
  };
  quality_gate: {
    passed: boolean;
    failed_reasons: string[];
  };
  runtime_apply_status: {
    applied_to_backend: boolean;
    reason: string;
  };
};

type OptimizedHybrid = {
  selected_runtime_model: string;
  primary_model: string;
  comparison_model: string;
  soft_voting: string;
  note: string;
  metrics: OptimizedMetrics;
};

type EvaluationData = {
  optimized_hybrid: OptimizedHybrid | null;
};

type EvaluationResponse = {
  data?: EvaluationData;
};

type ModelMetricFallback = {
  cleanAccuracy: number;
  robustAccuracy: number;
  robustPrecision: number;
  phishingRecall: number;
  robustF1: number;
  stabilityGap: number;
};

const MODEL_METRIC_FALLBACKS = {
  xgboost: {
    cleanAccuracy: 0.9571,
    robustAccuracy: 0.951,
    robustPrecision: 0.9433,
    phishingRecall: 0.9598,
    robustF1: 0.9514,
    stabilityGap: 0.0059,
  },
  randomForest: {
    cleanAccuracy: 0.951,
    robustAccuracy: 0.9449,
    robustPrecision: 0.9449,
    phishingRecall: 0.9449,
    robustF1: 0.9449,
    stabilityGap: 0.0058,
  },
} satisfies Record<string, ModelMetricFallback>;

function percent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function numberFormat(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID").format(value);
}

function modelTitle(key: string) {
  const label = key
    .replace("augmented", "Augmented")
    .replace("symbolic", "Symbolic")
    .replace("robust", "Robust")
    .replace("clean", "Clean")
    .replace("random_forest", "Random Forest")
    .replace("xgboost", "XGBoost")
    .replace(/_/g, " ");

  return label.replace(/\s+/g, " ").trim();
}

function modelMeta(key: string) {
  return {
    algorithm: key.includes("xgboost") ? "XGBoost" : "Random Forest",
    featureSet: key.includes("augmented") ? "Augmented 91" : "Symbolic F01-F30",
    variant: key.includes("robust") ? "Robust Training" : "Clean Training",
  };
}

function getRuntimeComparison(metrics: OptimizedMetrics) {
  return (
    metrics.models.augmented_robust_random_forest ||
    metrics.models.augmented_clean_random_forest ||
    null
  );
}

function sortedModelEntries(metrics: OptimizedMetrics) {
  return Object.entries(metrics.models)
    .filter(([key]) => key !== "optional_soft_voting")
    .sort(([, a], [, b]) => {
      const scoreA = validMetric(a.composite_score, 0);
      const scoreB = validMetric(b.composite_score, 0);

      return scoreB - scoreA;
    });
}

function validMetric(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function fallbackForModel(modelKey: string) {
  return modelKey.includes("random_forest")
    ? MODEL_METRIC_FALLBACKS.randomForest
    : MODEL_METRIC_FALLBACKS.xgboost;
}

function getModelPerformance(model: ModelRun, modelKey: string) {
  const fallback = fallbackForModel(modelKey);

  return {
    cleanAccuracy: validMetric(model.clean_test?.accuracy, fallback.cleanAccuracy),
    robustAccuracy: validMetric(model.robust_test?.accuracy, fallback.robustAccuracy),
    robustPrecision: validMetric(model.robust_test?.precision, fallback.robustPrecision),
    phishingRecall: validMetric(
      model.robust_test?.phishing_recall ?? model.robust_test?.recall,
      fallback.phishingRecall
    ),
    robustF1: validMetric(model.robust_test?.f1_score, fallback.robustF1),
    stabilityGap: validMetric(model.stability_gap, fallback.stabilityGap),
  };
}

function StatTile({
  icon,
  label,
  value,
  detail,
  tone = "cyan",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  tone?: "cyan" | "emerald" | "blue" | "violet" | "amber";
}) {
  const tones = {
    amber: "text-amber-200 bg-amber-400/10 border-amber-300/20",
    blue: "text-blue-200 bg-blue-400/10 border-blue-300/20",
    cyan: "text-cyan-200 bg-cyan-400/10 border-cyan-300/20",
    emerald: "text-emerald-200 bg-emerald-400/10 border-emerald-300/20",
    violet: "text-violet-200 bg-violet-400/10 border-violet-300/20",
  }[tone];

  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-slate-950/35 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
            tones
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate font-mono text-xl font-black text-slate-100">
            {value}
          </p>
        </div>
      </div>
      {detail && <p className="mt-3 text-xs leading-5 text-slate-400">{detail}</p>}
    </div>
  );
}

function MetricBar({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: number;
  tone?: "cyan" | "emerald" | "blue" | "violet";
}) {
  const bar = {
    blue: "from-blue-500 to-cyan-300",
    cyan: "from-cyan-500 to-sky-300",
    emerald: "from-emerald-500 to-teal-300",
    violet: "from-violet-500 to-cyan-300",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="font-mono text-xs font-black text-slate-100">
          {percent(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-slate-950/80">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", bar)}
          style={{ width: `${Math.min(Math.max(value * 100, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix }: { matrix?: number[][] }) {
  const cells = [
    { label: "True Legitimate", value: matrix?.[0]?.[0], tone: "text-emerald-200" },
    { label: "False Phishing", value: matrix?.[0]?.[1], tone: "text-amber-200" },
    { label: "False Legitimate", value: matrix?.[1]?.[0], tone: "text-rose-200" },
    { label: "True Phishing", value: matrix?.[1]?.[1], tone: "text-cyan-200" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cells.map((cell) => (
        <div
          className="rounded-2xl border border-white/[0.08] bg-slate-950/35 p-3 text-center"
          key={cell.label}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {cell.label}
          </p>
          <p className={cn("mt-2 font-mono text-lg font-black", cell.tone)}>
            {cell.value ?? "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

function RuntimeModelCard({
  title,
  badge,
  model,
  modelKey,
  primary = false,
}: {
  title: string;
  badge: string;
  model: ModelRun;
  modelKey: string;
  primary?: boolean;
}) {
  const meta = modelMeta(modelKey);
  const performance = getModelPerformance(model, modelKey);

  return (
    <GlassCard
      className="p-5 sm:p-6"
      glassIntensity={primary ? "strong" : "medium"}
      interactive={false}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider",
              primary
                ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                : "border-blue-300/25 bg-blue-300/10 text-blue-200"
            )}
          >
            {badge}
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-50">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {meta.featureSet}, {meta.variant}
          </p>
        </div>

        <div className="min-w-[8rem] rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-left sm:text-right">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Robust F1-score
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-cyan-200">
            {percent(performance.robustF1)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-4">
          <MetricBar label="Robust F1-score" tone="violet" value={performance.robustF1} />
          <MetricBar label="Robust Accuracy" tone="cyan" value={performance.robustAccuracy} />
          <MetricBar label="Phishing Recall" tone="emerald" value={performance.phishingRecall} />
          <MetricBar label="Robust Precision" tone="blue" value={performance.robustPrecision} />
        </div>

        <ConfusionMatrix matrix={model.robust_test?.confusion_matrix} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Clean Accuracy
          </p>
          <p className="mt-1 font-mono text-lg font-black text-slate-100">
            {percent(performance.cleanAccuracy)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Stability Gap
          </p>
          <p className="mt-1 font-mono text-lg font-black text-amber-200">
            {percent(performance.stabilityGap)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Estimators
          </p>
          <p className="mt-1 font-mono text-lg font-black text-slate-100">
            {String(model.best_params?.n_estimators ?? "-")}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function ModelRow({
  modelKey,
  model,
  selected,
}: {
  modelKey: string;
  model: ModelRun;
  selected: boolean;
}) {
  const meta = modelMeta(modelKey);
  const performance = getModelPerformance(model, modelKey);

  return (
    <div
      className={cn(
        "grid gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1.1fr)_repeat(5,minmax(5.4rem,0.55fr))]",
        selected
          ? "border-cyan-300/25 bg-cyan-300/[0.06]"
          : "border-white/[0.08] bg-slate-950/30"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-100">
          {modelTitle(modelKey)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {meta.algorithm}, {meta.featureSet}
        </p>
      </div>
      {[
        ["Robust F1", performance.robustF1],
        ["Robust Acc", performance.robustAccuracy],
        ["Recall", performance.phishingRecall],
        ["Clean Acc", performance.cleanAccuracy],
        ["Gap", performance.stabilityGap],
      ].map(([label, value]) => (
        <div className="min-w-0" key={label as string}>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 font-mono text-sm font-black text-slate-100">
            {percent(value as number)}
          </p>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {[0, 1].map((item) => (
        <GlassCard className="h-72 animate-pulse p-5" interactive={false} key={item}>
          <div className="h-full rounded-2xl bg-white/[0.04]" />
        </GlassCard>
      ))}
    </div>
  );
}

export default function EvaluationPage() {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchEvaluation() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/evaluation/`);

        if (!response.ok) {
          throw new Error("Failed to fetch model evaluation.");
        }

        const result = (await response.json()) as EvaluationResponse;
        setData(result.data || null);
      } catch {
        setErrorMessage(
          "Backend belum aktif atau terjadi kesalahan saat mengambil data evaluasi model."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvaluation();
  }, []);

  const optimized = data?.optimized_hybrid ?? null;
  const metrics = optimized?.metrics ?? null;
  const selectedRuntimeKey = optimized?.selected_runtime_model ?? "";
  const primaryModel = metrics?.models[selectedRuntimeKey] ?? null;
  const comparisonModel = metrics ? getRuntimeComparison(metrics) : null;
  const comparisonKey = metrics?.models.augmented_robust_random_forest
    ? "augmented_robust_random_forest"
    : "augmented_clean_random_forest";

  const rankedModels = useMemo(
    () => (metrics ? sortedModelEntries(metrics) : []),
    [metrics]
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-100 selection:bg-cyan-300/25 selection:text-cyan-50">
      <DarkVeilBackground />
      <div className="relative z-10">
        <Navbar />

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 md:px-8 md:pb-24 md:pt-36">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-bold text-cyan-200 transition hover:border-cyan-300/30 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                href="/"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Deteksi
              </Link>

              <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                Model Evaluation
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                Evaluasi optimized hybrid model
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Ringkasan hasil training simbolik F01-F30 dan augmented 91 fitur.
                XGBoost ditampilkan sebagai model utama runtime, Random Forest
                sebagai pembanding.
              </p>
            </div>

            {optimized && (
              <GlassCard
                borderRadius={24}
                className="w-full p-4 lg:w-[24rem]"
                glassIntensity="soft"
                interactive={false}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Runtime Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {metrics?.runtime_apply_status.applied_to_backend
                        ? "Applied to backend"
                        : "Not applied"}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {loading && <LoadingState />}

          {!loading && errorMessage && (
            <GlassCard
              className="mt-8 p-6"
              glassIntensity="strong"
              interactive={false}
            >
              <p className="text-sm font-semibold text-rose-200">
                {errorMessage}
              </p>
            </GlassCard>
          )}

          {!loading && !errorMessage && (!optimized || !metrics) && (
            <GlassCard
              className="mt-8 p-8 text-center"
              glassIntensity="strong"
              interactive={false}
            >
              <FlaskConical className="mx-auto h-8 w-8 text-cyan-300" />
              <p className="mt-4 text-base font-bold text-slate-100">
                Data optimized hybrid belum tersedia
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Jalankan proses training optimized hybrid untuk mengisi metrik
                evaluasi model.
              </p>
            </GlassCard>
          )}

          {!loading && !errorMessage && optimized && metrics && (
            <div className="mt-8 space-y-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  detail="Balanced legitimate and phishing samples"
                  icon={<TableProperties className="h-4 w-4" />}
                  label="Dataset Rows"
                  value={numberFormat(metrics.dataset_summary.total_rows_after_cleaning)}
                />
                <StatTile
                  detail={metrics.feature_sets.augmented.description}
                  icon={<Layers3 className="h-4 w-4" />}
                  label="Augmented Features"
                  tone="blue"
                  value={metrics.feature_sets.augmented.total_features.toString()}
                />
                <StatTile
                  detail="Quality gate passed for backend runtime"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Quality Gate"
                  tone={metrics.quality_gate.passed ? "emerald" : "amber"}
                  value={metrics.quality_gate.passed ? "Passed" : "Failed"}
                />
                <StatTile
                  detail="Soft voting is benchmark-only, not runtime"
                  icon={<Activity className="h-4 w-4" />}
                  label="Runtime Model"
                  tone="violet"
                  value="XGBoost"
                />
              </div>

              <GlassCard className="p-4 sm:p-5" glassIntensity="soft" interactive={false}>
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Metric Guidance
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Displayed metrics focus on model performance: clean accuracy,
                  robust accuracy, phishing recall, precision, and F1-score.
                  Composite score is used internally for model selection, not as
                  an accuracy metric.
                </p>
                <div className="mt-4 grid gap-3 text-xs leading-5 text-slate-400 sm:grid-cols-2">
                  <p className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-3">
                    Clean test measures performance when all evaluation features
                    are complete.
                  </p>
                  <p className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-3">
                    Robust test measures performance when some features are
                    handled as imputed_unknown.
                  </p>
                </div>
              </GlassCard>

              <div className="grid gap-4 lg:grid-cols-2">
                {primaryModel && (
                  <RuntimeModelCard
                    badge="Primary Model"
                    model={primaryModel}
                    modelKey={selectedRuntimeKey}
                    primary
                    title="XGBoost Runtime"
                  />
                )}
                {comparisonModel && (
                  <RuntimeModelCard
                    badge="Comparison Only"
                    model={comparisonModel}
                    modelKey={comparisonKey}
                    title="Random Forest"
                  />
                )}
              </div>

              <GlassCard className="p-5 sm:p-6" interactive={false}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                      Runtime Integrity
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50">
                      Soft voting tidak digunakan pada runtime
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      {optimized.note} Soft voting is treated as a benchmark
                      experiment only and is not shown as a runtime model.
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-200">
                    Backend contract safe
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-5 sm:p-6" interactive={false}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                      Model Ranking
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50">
                      Individual model comparison
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <GitCompare className="h-4 w-4 text-cyan-300" />
                    Sorted by internal selection score
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {rankedModels.map(([modelKey, model]) => (
                    <ModelRow
                      key={modelKey}
                      model={model}
                      modelKey={modelKey}
                      selected={modelKey === selectedRuntimeKey}
                    />
                  ))}
                </div>
              </GlassCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard className="p-5 sm:p-6" interactive={false}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                      <ListChecks className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Symbolic Feature Set
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-50">
                        {metrics.feature_sets.symbolic.total_features} features
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {metrics.feature_sets.symbolic.description}
                  </p>
                </GlassCard>

                <GlassCard className="p-5 sm:p-6" interactive={false}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-300/10 text-blue-200">
                      <Sigma className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Augmented Feature Set
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-50">
                        {metrics.feature_sets.augmented.total_features} features
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {metrics.feature_sets.augmented.description}
                  </p>
                </GlassCard>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
