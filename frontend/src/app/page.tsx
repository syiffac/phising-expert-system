"use client";

import { useState } from "react";

type TriggeredRule = {
  code: string;
  conclusion: string;
  severity: string;
  explanation: string;
  source: string;
};

type DetectResponse = {
  url: string;
  normalized_url: string;
  hostname: string;
  facts: Record<string, number>;
  evaluated_features: string[];
  expert_system: {
    initial_status: string;
    total_triggered_rules: number;
    triggered_rules: TriggeredRule[];
  };
  final_result: string;
  note: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDetect() {
    if (!url.trim()) {
      setErrorMessage("URL tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/detect/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan deteksi URL.");
      }

      const data: DetectResponse = await response.json();
      setResult(data);
    } catch (error) {
      setErrorMessage(
        "Backend belum aktif atau terjadi kesalahan saat memproses URL."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    if (status === "phishing") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (status === "suspicious") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            PhishGuard Expert System
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            Sistem Pakar Deteksi Website Phishing Berbasis Rule-Based System
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Sistem ini menggunakan knowledge base, rule IF-THEN, dan forward
            chaining untuk memberikan inferensi awal terhadap URL yang diuji.
            Model machine learning akan ditambahkan sebagai pendukung
            klasifikasi akhir pada tahap berikutnya.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Deteksi URL</h2>
            <p className="mt-2 text-sm text-slate-400">
              Masukkan URL yang ingin dianalisis oleh sistem pakar.
            </p>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="contoh: http://secure-login-bank@verify-update.com"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              />

              <button
                onClick={handleDetect}
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Menganalisis..." : "Analisis URL"}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">URL Normalisasi</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-100">
                    {result.normalized_url}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Hostname</p>
                  <p className="mt-1 text-sm font-medium text-slate-100">
                    {result.hostname || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Hasil Inferensi Awal</p>

                  <div
                    className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                      result.final_result
                    )}`}
                  >
                    {result.final_result}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Rule yang Terpicu</h2>
            <p className="mt-2 text-sm text-slate-400">
              Bagian ini menunjukkan alasan sistem pakar memberikan kesimpulan.
            </p>

            {!result && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
                Belum ada hasil. Masukkan URL terlebih dahulu.
              </div>
            )}

            {result && result.expert_system.triggered_rules.length === 0 && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                Tidak ada rule berbahaya yang terpicu pada fitur yang dievaluasi.
              </div>
            )}

            {result && result.expert_system.triggered_rules.length > 0 && (
              <div className="mt-6 space-y-3">
                {result.expert_system.triggered_rules.map((rule) => (
                  <div
                    key={rule.code}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {rule.code}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                          rule.conclusion
                        )}`}
                      >
                        {rule.conclusion}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {rule.explanation}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Sumber: {rule.source}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Fakta yang Dievaluasi</h2>
            <p className="mt-2 text-sm text-slate-400">{result.note}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {result.evaluated_features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-sm font-semibold text-slate-200">
                    {feature}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Nilai: {result.facts[feature]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}