"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Cpu,
  Database,
  ExternalLink,
  History,
  ListChecks,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/ui-custom/GlassCard";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import { cn } from "@/lib/cn";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

type HistoryItem = {
  id: number;
  url: string;
  normalized_url: string | null;
  hostname: string | null;
  expert_status: string;
  final_result: string;
  triggered_rules: unknown[] | null;
  facts: Record<string, number> | null;
  rf_prediction: string | null;
  rf_confidence: number | null;
  xgb_prediction: string | null;
  xgb_confidence: number | null;
  created_at: string | null;
};

type HistoryResponse = {
  data?: HistoryItem[];
};

function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeStatus(status: string) {
  const lowered = status.toLowerCase();

  if (lowered.includes("phishing")) {
    return "phishing";
  }

  if (lowered.includes("suspicious")) {
    return "suspicious";
  }

  if (lowered.includes("legitimate")) {
    return "legitimate";
  }

  return "unknown";
}

function countFacts(facts: Record<string, number> | null) {
  return facts ? Object.keys(facts).length : 0;
}

function statusTone(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "phishing") {
    return "text-red-200";
  }

  if (normalized === "suspicious") {
    return "text-amber-200";
  }

  if (normalized === "legitimate") {
    return "text-emerald-200";
  }

  return "text-sky-200";
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-white/[0.08] bg-slate-950/35 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-3 truncate font-mono text-xl font-black text-slate-100">
        {value}
      </p>
    </div>
  );
}

function ModelStrip({
  label,
  prediction,
  confidence,
  icon,
}: {
  label: string;
  prediction: string | null;
  confidence: number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-cyan-300">{icon}</span>
          <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-300">
            {label}
          </p>
        </div>
        <p className="shrink-0 font-mono text-xs font-black text-cyan-200">
          {formatConfidence(confidence)}
        </p>
      </div>
      <p
        className={cn(
          "mt-3 truncate text-sm font-bold capitalize",
          statusTone(prediction || "unknown")
        )}
      >
        {prediction || "-"}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="mt-8 grid gap-4">
      {[0, 1, 2].map((item) => (
        <GlassCard
          className="h-44 animate-pulse p-5"
          interactive={false}
          key={item}
        >
          <div className="h-full rounded-2xl bg-white/[0.04]" />
        </GlassCard>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history/?limit=20`);

        if (!response.ok) {
          throw new Error("Failed to fetch detection history.");
        }

        const result = (await response.json()) as HistoryResponse;
        setHistories(Array.isArray(result.data) ? result.data : []);
      } catch {
        setErrorMessage(
          "Backend API is not reachable. Please start FastAPI server on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const summary = useMemo(() => {
    const phishing = histories.filter(
      (item) => normalizeStatus(item.final_result) === "phishing"
    ).length;
    const legitimate = histories.filter(
      (item) => normalizeStatus(item.final_result) === "legitimate"
    ).length;
    const suspicious = histories.filter(
      (item) => normalizeStatus(item.final_result) === "suspicious"
    ).length;

    return { legitimate, phishing, suspicious, total: histories.length };
  }, [histories]);

  return (
    <main className="relative min-h-screen overflow-x-hidden text-slate-100 selection:bg-cyan-300/25 selection:text-cyan-50">
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
                Detection History
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                Riwayat analisis URL dan keputusan hibrida
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Pantau hasil inferensi sistem pakar, model XGBoost utama, dan
                Random Forest pembanding dalam satu arsip ringkas.
              </p>
            </div>

            <GlassCard
              borderRadius={24}
              className="w-full p-4 lg:w-[22rem]"
              glassIntensity="soft"
              interactive={false}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <History className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Latest Records
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                    Limit 20 detection events
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-4">
            <MetricTile
              icon={<ListChecks className="h-4 w-4" />}
              label="Total"
              value={summary.total.toString()}
            />
            <MetricTile
              icon={<ShieldCheck className="h-4 w-4 text-emerald-300" />}
              label="Legitimate"
              value={summary.legitimate.toString()}
            />
            <MetricTile
              icon={<SearchX className="h-4 w-4 text-amber-300" />}
              label="Suspicious"
              value={summary.suspicious.toString()}
            />
            <MetricTile
              icon={<ExternalLink className="h-4 w-4 text-red-300" />}
              label="Phishing"
              value={summary.phishing.toString()}
            />
          </div>

          {loading && <LoadingRows />}

          {!loading && errorMessage && (
            <GlassCard
              className="mt-8 p-6"
              glassIntensity="strong"
              interactive={false}
            >
              <p className="text-sm font-semibold text-red-200">
                {errorMessage}
              </p>
            </GlassCard>
          )}

          {!loading && !errorMessage && histories.length === 0 && (
            <GlassCard
              className="mt-8 p-8 text-center"
              glassIntensity="strong"
              interactive={false}
            >
              <SearchX className="mx-auto h-8 w-8 text-cyan-300" />
              <p className="mt-4 text-base font-bold text-slate-100">
                Belum ada riwayat deteksi
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
                Jalankan analisis URL dari halaman utama, lalu hasilnya akan
                muncul di arsip ini.
              </p>
            </GlassCard>
          )}

          {!loading && !errorMessage && histories.length > 0 && (
            <div className="mt-8 grid gap-4">
              {histories.map((item) => (
                <GlassCard
                  className="p-4 sm:p-5"
                  interactive={false}
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={normalizeStatus(item.final_result)} />
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-bold text-slate-300">
                          <Clock3 className="h-3 w-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <p className="mt-4 break-all text-sm font-bold leading-6 text-slate-100 sm:text-base">
                        {item.url}
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-slate-400">
                        {item.hostname || item.normalized_url || "-"}
                      </p>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2 text-right sm:grid-cols-3 lg:w-[23rem]">
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Facts
                        </p>
                        <p className="mt-1 font-mono text-lg font-black text-cyan-200">
                          {countFacts(item.facts)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Rules
                        </p>
                        <p className="mt-1 font-mono text-lg font-black text-violet-200">
                          {item.triggered_rules?.length || 0}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 sm:col-span-1">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Expert
                        </p>
                        <p
                          className={cn(
                            "mt-1 truncate text-sm font-black capitalize",
                            statusTone(item.expert_status)
                          )}
                        >
                          {item.expert_status || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 md:auto-rows-fr">
                    <ModelStrip
                      confidence={item.xgb_confidence}
                      icon={<Cpu className="h-4 w-4" />}
                      label="XGBoost Primary"
                      prediction={item.xgb_prediction}
                    />
                    <ModelStrip
                      confidence={item.rf_confidence}
                      icon={<Database className="h-4 w-4" />}
                      label="Random Forest Comparison"
                      prediction={item.rf_prediction}
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
