"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

function statusClass(status: string) {
  if (status === "phishing") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (status === "suspicious") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
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
          throw new Error("Gagal mengambil data riwayat.");
        }

        const result = await response.json();
        setHistories(result.data || []);
      } catch {
        setErrorMessage(
          "Backend belum aktif atau terjadi kesalahan saat mengambil riwayat deteksi."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-cyan-300 hover:underline">
          ← Kembali ke Deteksi
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            Detection History
          </p>

          <h1 className="text-4xl font-bold">Riwayat Deteksi</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Data pada halaman ini diambil dari tabel{" "}
            <span className="font-medium text-slate-300">
              detection_histories
            </span>{" "}
            di Supabase PostgreSQL. Riwayat ini menyimpan hasil inferensi sistem
            pakar, prediksi machine learning, dan hasil akhir deteksi.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
            Memuat data riwayat...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && histories.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-8 text-sm text-slate-400">
            Belum ada riwayat deteksi. Coba analisis URL terlebih dahulu pada
            halaman utama.
          </div>
        )}

        {!loading && !errorMessage && histories.length > 0 && (
          <div className="mt-8 space-y-4">
            {histories.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="break-all text-sm font-medium text-slate-100">
                      {item.url}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Hostname: {item.hostname || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Waktu: {formatDate(item.created_at)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold capitalize ${statusClass(
                      item.final_result
                    )}`}
                  >
                    {item.final_result}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-slate-500">Expert System</p>
                    <p className="mt-1 font-semibold capitalize text-slate-100">
                      {item.expert_status}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-slate-500">Random Forest</p>
                    <p className="mt-1 font-semibold capitalize text-slate-100">
                      {item.rf_prediction || "-"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      Confidence: {formatConfidence(item.rf_confidence)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-slate-500">XGBoost</p>
                    <p className="mt-1 font-semibold capitalize text-slate-100">
                      {item.xgb_prediction || "-"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      Confidence: {formatConfidence(item.xgb_confidence)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-500">Final Result</p>
                  <p className="mt-1 text-sm capitalize text-slate-200">
                    Sistem menyimpulkan URL ini sebagai{" "}
                    <span className="font-semibold">{item.final_result}</span>.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}