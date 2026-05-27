"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type ModelMetric = {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
};

type EvaluationGroup = {
  random_forest: ModelMetric;
  xgboost: ModelMetric;
  feature_columns?: string[];
  label_mapping?: Record<string, string>;
  training_mode?: string;
  note?: string;
};

type EvaluationData = {
  baseline_f01_f30: EvaluationGroup | null;
  dataset_87_features: EvaluationGroup | null;
};

function percent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function MetricCard({
  title,
  metric,
}: {
  title: string;
  metric: ModelMetric;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>

      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Accuracy</span>
          <span className="font-semibold text-slate-100">
            {percent(metric.accuracy)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Precision</span>
          <span className="font-semibold text-slate-100">
            {percent(metric.precision)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Recall</span>
          <span className="font-semibold text-slate-100">
            {percent(metric.recall)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">F1-score</span>
          <span className="font-semibold text-slate-100">
            {percent(metric.f1_score)}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="mb-2 text-sm text-slate-400">Confusion Matrix</p>

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="text-xs text-slate-500">True Legitimate</p>
            <p className="mt-1 font-semibold text-slate-100">
              {metric.confusion_matrix?.[0]?.[0] ?? "-"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="text-xs text-slate-500">False Phishing</p>
            <p className="mt-1 font-semibold text-slate-100">
              {metric.confusion_matrix?.[0]?.[1] ?? "-"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="text-xs text-slate-500">False Legitimate</p>
            <p className="mt-1 font-semibold text-slate-100">
              {metric.confusion_matrix?.[1]?.[0] ?? "-"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="text-xs text-slate-500">True Phishing</p>
            <p className="mt-1 font-semibold text-slate-100">
              {metric.confusion_matrix?.[1]?.[1] ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationSection({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: EvaluationGroup;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {description}
        </p>

        {data.note && (
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
            {data.note}
          </p>
        )}

        {data.feature_columns && (
          <p className="mt-2 text-xs text-slate-500">
            Jumlah fitur digunakan: {data.feature_columns.length}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <MetricCard title="Random Forest" metric={data.random_forest} />
        <MetricCard title="XGBoost" metric={data.xgboost} />
      </div>
    </section>
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
          throw new Error("Gagal mengambil data evaluasi.");
        }

        const result = await response.json();
        setData(result.data);
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-cyan-300 hover:underline">
          ← Kembali ke Deteksi
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            Model Evaluation
          </p>

          <h1 className="text-4xl font-bold">Evaluasi Model</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Halaman ini menampilkan hasil evaluasi Random Forest dan XGBoost.
            Model baseline digunakan untuk input URL manual, sedangkan model
            dataset 87 fitur digunakan sebagai pembanding performa utama pada
            tahap prototype.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
            Memuat data evaluasi model...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && data && (
          <div className="mt-8 space-y-10">
            {data.baseline_f01_f30 && (
              <EvaluationSection
                title="Baseline F01–F30"
                description="Model baseline ini menggunakan fitur F01–F30 yang dibentuk dari proses ekstraksi URL manual. Pada tahap prototype, sebagian fitur eksternal belum diekstraksi secara lengkap sehingga performanya masih terbatas."
                data={data.baseline_f01_f30}
              />
            )}

            {data.dataset_87_features && (
              <EvaluationSection
                title="Dataset 87 Fitur"
                description="Model ini dilatih menggunakan fitur numerik asli dari dataset. Hasil evaluasi pada bagian ini menjadi pembanding performa utama Random Forest dan XGBoost pada dataset yang sama."
                data={data.dataset_87_features}
              />
            )}

            {!data.baseline_f01_f30 && !data.dataset_87_features && (
              <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-sm text-slate-400">
                Data evaluasi model belum tersedia. Jalankan proses training
                model terlebih dahulu.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}