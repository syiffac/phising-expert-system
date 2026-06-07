"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  Database,
  Filter,
  GitBranch,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sigma,
} from "lucide-react";
import DarkVeilBackground from "@/components/visual/DarkVeilBackground";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/ui-custom/GlassCard";
import { cn } from "@/lib/cn";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

type FeatureItem = {
  code: string;
  name: string;
  description: string;
  source: string;
};

type RuleCondition = {
  feature: string;
  operator: string;
  value: number;
};

type RuleItem = {
  code: string;
  type?: string;
  conditions: RuleCondition[];
  conclusion: string;
  severity: string;
  explanation: string;
  source: string;
};

type ApiListResponse<T> = {
  total?: number;
  data?: T[];
};

function conclusionClasses(conclusion: string) {
  const normalized = conclusion.toLowerCase();

  if (normalized === "phishing") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }

  if (normalized === "suspicious") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
}

function severityClasses(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized === "high") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }

  if (normalized === "medium") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  return "border-sky-400/25 bg-sky-400/10 text-sky-200";
}

function conditionValueLabel(value: number) {
  if (value === -1) {
    return "Phishing indicator";
  }

  if (value === 0) {
    return "Suspicious or neutral";
  }

  if (value === 1) {
    return "Legitimate indicator";
  }

  return value.toString();
}

function conditionText(condition: RuleCondition, featureMap: Map<string, FeatureItem>) {
  const feature = featureMap.get(condition.feature);

  return `${condition.feature}${feature ? ` (${feature.name})` : ""} ${
    condition.operator
  } ${conditionValueLabel(condition.value)}`;
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
  tone?: "cyan" | "emerald" | "amber" | "blue";
}) {
  const tones = {
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    blue: "border-blue-300/20 bg-blue-300/10 text-blue-200",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
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

function LoadingState() {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {[0, 1].map((item) => (
        <GlassCard className="h-80 animate-pulse p-5" interactive={false} key={item}>
          <div className="h-full rounded-2xl bg-white/[0.04]" />
        </GlassCard>
      ))}
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [conclusionFilter, setConclusionFilter] = useState("all");

  useEffect(() => {
    async function fetchKnowledgeBase() {
      try {
        const [featuresResponse, rulesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/features/`),
          fetch(`${API_BASE_URL}/api/rules/`),
        ]);

        if (!featuresResponse.ok || !rulesResponse.ok) {
          throw new Error("Failed to fetch knowledge base.");
        }

        const featuresResult =
          (await featuresResponse.json()) as ApiListResponse<FeatureItem>;
        const rulesResult =
          (await rulesResponse.json()) as ApiListResponse<RuleItem>;

        setFeatures(Array.isArray(featuresResult.data) ? featuresResult.data : []);
        setRules(Array.isArray(rulesResult.data) ? rulesResult.data : []);
      } catch {
        setErrorMessage(
          "Backend belum aktif atau terjadi kesalahan saat mengambil knowledge base."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeBase();
  }, []);

  const featureMap = useMemo(
    () => new Map(features.map((feature) => [feature.code, feature])),
    [features]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredFeatures = useMemo(() => {
    if (!normalizedQuery) {
      return features;
    }

    return features.filter((feature) =>
      [feature.code, feature.name, feature.description, feature.source]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [features, normalizedQuery]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesConclusion =
        conclusionFilter === "all" || rule.conclusion === conclusionFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          rule.code,
          rule.conclusion,
          rule.severity,
          rule.explanation,
          rule.source,
          ...rule.conditions.map((condition) => condition.feature),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesConclusion && matchesQuery;
    });
  }, [conclusionFilter, normalizedQuery, rules]);

  const summary = useMemo(() => {
    const highSeverity = rules.filter((rule) => rule.severity === "high").length;
    const mediumSeverity = rules.filter(
      (rule) => rule.severity === "medium"
    ).length;
    const qualityRules = rules.filter((rule) => rule.type === "quality_rule").length;

    return { highSeverity, mediumSeverity, qualityRules };
  }, [rules]);

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
                Knowledge Base
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                Basis pengetahuan F01-F30 dan rules pakar
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Daftar fakta simbolik dan aturan forward chaining yang menjadi
                lapisan deteksi pertama sebelum validasi machine learning.
              </p>
            </div>

            <GlassCard
              borderRadius={24}
              className="w-full p-4 lg:w-[24rem]"
              glassIntensity="soft"
              interactive={false}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <BookOpenCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Expert-first layer
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                    Transparent symbolic reasoning
                  </p>
                </div>
              </div>
            </GlassCard>
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

          {!loading && !errorMessage && (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  detail="Symbolic facts used by expert system and ML alignment"
                  icon={<Database className="h-4 w-4" />}
                  label="Features"
                  value={features.length.toString()}
                />
                <StatTile
                  detail="Forward chaining rules including resilience policy"
                  icon={<GitBranch className="h-4 w-4" />}
                  label="Rules"
                  tone="blue"
                  value={rules.length.toString()}
                />
                <StatTile
                  detail="Rules that conclude direct phishing risk"
                  icon={<ShieldAlert className="h-4 w-4" />}
                  label="High Severity"
                  tone="amber"
                  value={summary.highSeverity.toString()}
                />
                <StatTile
                  detail="Extraction quality guard for imputed unknown features"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Quality Rules"
                  tone="emerald"
                  value={summary.qualityRules.toString()}
                />
              </div>

              <GlassCard className="mt-8 p-4 sm:p-5" interactive={false}>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="h-12 w-full rounded-2xl border border-white/[0.08] bg-slate-950/50 pl-10 pr-4 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Cari fitur, rule, sumber, atau kode..."
                      type="search"
                      value={query}
                    />
                  </label>

                  <label className="relative block">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <select
                      className="h-12 w-full appearance-none rounded-2xl border border-white/[0.08] bg-slate-950/50 pl-10 pr-4 text-sm font-bold text-slate-100 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
                      onChange={(event) => setConclusionFilter(event.target.value)}
                      value={conclusionFilter}
                    >
                      <option value="all">All conclusions</option>
                      <option value="phishing">Phishing</option>
                      <option value="suspicious">Suspicious</option>
                      <option value="legitimate">Legitimate</option>
                    </select>
                  </label>
                </div>
              </GlassCard>

              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.85fr)]">
                <GlassCard className="p-5 sm:p-6" interactive={false}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                        Feature Catalog
                      </p>
                      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50">
                        F01-F30 symbolic facts
                      </h2>
                    </div>
                    <p className="font-mono text-xs font-bold text-slate-500">
                      {filteredFeatures.length}/{features.length} shown
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {filteredFeatures.map((feature) => (
                      <div
                        className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4"
                        key={feature.code}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[11px] font-black text-cyan-200">
                                {feature.code}
                              </span>
                              <h3 className="text-sm font-black text-slate-100 sm:text-base">
                                {feature.name}
                              </h3>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {feature.description}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Fact
                          </span>
                        </div>
                        <p className="mt-3 break-words font-mono text-[11px] leading-5 text-slate-500">
                          {feature.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5 sm:p-6" interactive={false}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                        Rule Base
                      </p>
                      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50">
                        Forward chaining rules
                      </h2>
                    </div>
                    <p className="font-mono text-xs font-bold text-slate-500">
                      {filteredRules.length}/{rules.length} shown
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {filteredRules.map((rule) => (
                      <div
                        className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4"
                        key={rule.code}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 font-mono text-[11px] font-black text-violet-200">
                            {rule.code}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-bold capitalize",
                              conclusionClasses(rule.conclusion)
                            )}
                          >
                            {rule.conclusion}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-bold capitalize",
                              severityClasses(rule.severity)
                            )}
                          >
                            {rule.severity}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {rule.conditions.map((condition, index) => (
                            <div
                              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                              key={`${rule.code}-${condition.feature}-${index}`}
                            >
                              <div className="flex items-start gap-2">
                                <Sigma className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                                <p className="text-xs leading-5 text-slate-300">
                                  {conditionText(condition, featureMap)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-400">
                          {rule.explanation}
                        </p>
                        <p className="mt-3 break-words font-mono text-[11px] leading-5 text-slate-500">
                          {rule.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
