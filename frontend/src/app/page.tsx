"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";

type TriggeredRule = {
  code?: string;
  conclusion?: string;
  severity?: string;
  explanation?: string;
  source?: string;
};

type MLModelResult = {
  prediction: string;
  confidence: number | null;
};

type MachineLearningResult = {
  available: boolean;
  mode?: string;
  note?: string;
  random_forest?: MLModelResult | null;
  xgboost?: MLModelResult | null;
};

type DetectResponse = {
  history_id?: number;
  url?: string;
  normalized_url?: string;
  hostname?: string;
  facts?: Record<string, number>;
  evaluated_features?: string[];
  expert_system?: {
    initial_status?: string;
    total_triggered_rules?: number;
    triggered_rules?: TriggeredRule[];
  };
  machine_learning?: MachineLearningResult;
  final_result?: string;
  note?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function getStatusStyle(status: string) {
  if (status === "phishing") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (status === "suspicious") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (status === "legitimate") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getDarkStatusStyle(status: string) {
  if (status === "phishing") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (status === "suspicious") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }

  if (status === "legitimate") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  return "border-slate-600 bg-slate-800 text-slate-200";
}

function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
}

async function getErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json();

    if (
      data &&
      typeof data === "object" &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      return data.detail;
    }
  } catch {
    // Response body is not JSON; fall through to status-based messages.
  }

  if (response.status === 400) {
    return "URL tidak valid atau tidak boleh kosong.";
  }

  if (response.status >= 500) {
    return "Backend gagal memproses atau menyimpan hasil deteksi.";
  }

  return "Gagal melakukan deteksi URL.";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function nativeFallbackScript(apiBaseUrl: string) {
  return `
(function () {
  var apiBaseUrl = ${JSON.stringify(apiBaseUrl)};

  function text(value) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  }

  function confidence(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }
    return (Number(value) * 100).toFixed(2) + "%";
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setMessage(message, isError) {
    var box = document.getElementById("native-detect-message");
    if (!box) return;
    box.className = isError
      ? "mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
      : "mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300";
    box.textContent = message;
    box.hidden = false;
  }

  function renderResult(data) {
    var output = document.getElementById("native-detect-output");
    if (!output) return;

    var rules = data && data.expert_system && Array.isArray(data.expert_system.triggered_rules)
      ? data.expert_system.triggered_rules
      : [];
    var features = data && Array.isArray(data.evaluated_features) ? data.evaluated_features : [];
    var facts = data && data.facts ? data.facts : {};
    var ml = data && data.machine_learning ? data.machine_learning : null;

    var rulesHtml = rules.length
      ? rules.map(function (rule) {
          return '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4">' +
            '<div class="flex items-center justify-between gap-3">' +
            '<span class="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-300">' + escapeHtml(rule.code) + '</span>' +
            '<span class="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-medium capitalize text-slate-200">' + escapeHtml(rule.conclusion) + '</span>' +
            '</div>' +
            '<p class="mt-3 text-sm leading-6 text-slate-200">' + escapeHtml(rule.explanation) + '</p>' +
            '<p class="mt-3 text-xs text-slate-500">Sumber: ' + escapeHtml(rule.source) + '</p>' +
            '</div>';
        }).join("")
      : '<div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">Tidak ada rule berbahaya yang terpicu pada fitur yang dievaluasi.</div>';

    var featuresHtml = features.length
      ? features.map(function (feature) {
          return '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4">' +
            '<p class="text-sm font-semibold text-slate-200">' + escapeHtml(feature) + '</p>' +
            '<p class="mt-1 text-sm text-slate-400">Nilai: ' + escapeHtml(facts[feature]) + '</p>' +
            '</div>';
        }).join("")
      : '<div class="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">Tidak ada daftar fitur yang dikembalikan backend.</div>';

    var mlHtml = ml && ml.available
      ? '<div class="mt-4 grid gap-3 md:grid-cols-2">' +
          '<div class="rounded-xl border border-slate-800 bg-slate-900 p-4">' +
            '<p class="text-sm font-semibold text-cyan-300">Random Forest</p>' +
            '<p class="mt-2 text-sm text-slate-300">Prediksi: <span class="font-semibold capitalize text-slate-100">' + escapeHtml(ml.random_forest && ml.random_forest.prediction) + '</span></p>' +
            '<p class="mt-1 text-sm text-slate-400">Confidence: ' + confidence(ml.random_forest && ml.random_forest.confidence) + '</p>' +
          '</div>' +
          '<div class="rounded-xl border border-slate-800 bg-slate-900 p-4">' +
            '<p class="text-sm font-semibold text-cyan-300">XGBoost</p>' +
            '<p class="mt-2 text-sm text-slate-300">Prediksi: <span class="font-semibold capitalize text-slate-100">' + escapeHtml(ml.xgboost && ml.xgboost.prediction) + '</span></p>' +
            '<p class="mt-1 text-sm text-slate-400">Confidence: ' + confidence(ml.xgboost && ml.xgboost.confidence) + '</p>' +
          '</div>' +
        '</div>' +
        '<p class="mt-4 text-xs leading-5 text-slate-500">' + escapeHtml(ml.note || "Prediksi machine learning berhasil diproses.") + '</p>'
      : '<div class="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">' + escapeHtml((ml && ml.note) || "Model machine learning belum tersedia.") + '</div>';

    output.innerHTML =
      '<div class="mt-6 space-y-4">' +
        '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4"><p class="text-sm text-slate-400">URL Normalisasi</p><p class="mt-1 break-all text-sm font-medium text-slate-100">' + escapeHtml(data && data.normalized_url) + '</p></div>' +
        '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4"><p class="text-sm text-slate-400">Hostname</p><p class="mt-1 text-sm font-medium text-slate-100">' + escapeHtml(data && data.hostname) + '</p></div>' +
        '<div class="grid gap-4 md:grid-cols-2">' +
          '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4"><p class="text-sm text-slate-400">Hasil Inferensi Awal</p><div class="mt-3 inline-flex rounded-full border bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700">' + escapeHtml(data && data.expert_system && data.expert_system.initial_status) + '</div></div>' +
          '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4"><p class="text-sm text-slate-400">Hasil Akhir</p><div class="mt-3 inline-flex rounded-full border bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700">' + escapeHtml(data && data.final_result) + '</div></div>' +
        '</div>' +
        '<div class="rounded-xl border border-slate-800 bg-slate-950 p-4"><p class="text-sm text-slate-400">Prediksi Machine Learning</p>' + mlHtml + '</div>' +
        '<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><h2 class="text-xl font-semibold">Rule yang Terpicu</h2><div class="mt-6 space-y-3">' + rulesHtml + '</div></div>' +
        '<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><h2 class="text-xl font-semibold">Fakta yang Dievaluasi</h2><p class="mt-2 text-sm leading-6 text-slate-400">' + escapeHtml(data && data.note) + '</p><div class="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">' + featuresHtml + '</div></div>' +
      '</div>';
    output.hidden = false;
  }

  function attachFallback() {
    var input = document.getElementById("detect-url-input");
    var button = document.getElementById("detect-url-button");
    if (!input || !button || button.dataset.nativeFallback === "true") return;

    button.dataset.nativeFallback = "true";

    async function runDetect() {
      var value = input.value.trim();
      if (!value) {
        setMessage("URL tidak boleh kosong.", true);
        return;
      }

      button.disabled = true;
      button.textContent = "Menganalisis...";
      setMessage("Fallback aktif. Mengirim request ke " + apiBaseUrl + "/api/detect/...", false);

      try {
        var response = await fetch(apiBaseUrl + "/api/detect/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value })
        });

        var data = await response.json();
        if (!response.ok) {
          throw new Error(data && data.detail ? data.detail : "Gagal melakukan deteksi URL.");
        }

        setMessage("Deteksi berhasil. Hasil ditampilkan di bawah.", false);
        renderResult(data);
      } catch (error) {
        setMessage(error && error.message ? error.message : "Terjadi kesalahan saat memproses URL.", true);
      } finally {
        button.disabled = false;
        button.textContent = "Analisis URL";
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      var startedAt = Date.now();
      window.setTimeout(function () {
        var reactClickedAt = Number(document.documentElement.dataset.phishGuardReactClicked || "0");
        if (reactClickedAt >= startedAt - 50) return;
        runDetect();
      }, 80);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        runDetect();
      }
    });
  }

  window.setTimeout(attachFallback, 1200);
})();
`;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const trimmedUrl = url.trim();
  const expertStatus = result?.expert_system?.initial_status || "";
  const finalStatus = result?.final_result || "";
  const triggeredRules = result?.expert_system?.triggered_rules ?? [];
  const evaluatedFeatures = result?.evaluated_features ?? [];
  const facts = result?.facts ?? {};
  const machineLearning = result?.machine_learning;

  useEffect(() => {
    document.documentElement.dataset.phishGuardHydrated = "true";
  }, []);

  async function handleDetect() {
    document.documentElement.dataset.phishGuardReactClicked = String(
      Date.now()
    );
    setStatusMessage("Tombol diklik. Menyiapkan request...");

    if (!trimmedUrl) {
      setErrorMessage("URL tidak boleh kosong.");
      setResult(null);
      setStatusMessage("Input kosong. Request dibatalkan.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setStatusMessage(`Mengirim request ke ${API_BASE_URL}/api/detect/...`);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/detect/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: DetectResponse = await response.json();
      setResult(data);
      setStatusMessage("Deteksi berhasil. Hasil ditampilkan di bawah.");
    } catch (error) {
      setErrorMessage(
        isAbortError(error)
          ? `Request ke ${API_BASE_URL}/api/detect/ terlalu lama. Pastikan backend FastAPI aktif.`
          : error instanceof TypeError
          ? `Backend belum aktif atau tidak dapat dihubungi di ${API_BASE_URL}. Pastikan FastAPI berjalan dan buka frontend melalui http://localhost:3000 atau http://127.0.0.1:3000.`
          : error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses URL."
      );
      setStatusMessage("Deteksi gagal. Lihat pesan error di bawah input.");
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
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
            Model machine learning digunakan sebagai komponen pendukung
            klasifikasi akhir pada tahap prototype.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/evaluation"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Evaluasi Model
            </Link>

            <Link
              href="/history"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Riwayat Deteksi
            </Link>

            <Link
              href="/dataset-demo"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Dataset Demo
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Deteksi URL</h2>

            <p className="mt-2 text-sm text-slate-400">
              Masukkan URL yang ingin dianalisis oleh sistem pakar.
            </p>

            <div
              className="mt-6 flex flex-col gap-3 md:flex-row"
            >
              <input
                id="detect-url-input"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setErrorMessage("");
                  setStatusMessage("");
                }}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleDetect();
                  }
                }}
                placeholder="contoh: http://secure-login-bank@verify-update.com"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              />

              <button
                id="detect-url-button"
                type="button"
                onClick={() => void handleDetect()}
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Menganalisis..." : "Analisis URL"}
              </button>
            </div>

            <div id="native-detect-message" hidden />
            <div id="native-detect-output" hidden />

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {statusMessage && (
              <div
                aria-live="polite"
                className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"
              >
                {statusMessage}
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">URL Normalisasi</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-100">
                    {displayValue(result.normalized_url)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Hostname</p>
                  <p className="mt-1 text-sm font-medium text-slate-100">
                    {displayValue(result.hostname)}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
                      Hasil Inferensi Awal
                    </p>

                    <div
                      className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                        expertStatus
                      )}`}
                    >
                      {displayValue(expertStatus)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Hasil Akhir</p>

                    <div
                      className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                        finalStatus
                      )}`}
                    >
                      {displayValue(finalStatus)}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">
                    Prediksi Machine Learning
                  </p>

                  {machineLearning?.available ? (
                    <>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-sm font-semibold text-cyan-300">
                            Random Forest
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            Prediksi:{" "}
                            <span className="font-semibold capitalize text-slate-100">
                              {displayValue(
                                machineLearning.random_forest?.prediction
                              )}
                            </span>
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Confidence:{" "}
                            {formatConfidence(
                              machineLearning.random_forest?.confidence
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-sm font-semibold text-cyan-300">
                            XGBoost
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            Prediksi:{" "}
                            <span className="font-semibold capitalize text-slate-100">
                              {displayValue(
                                machineLearning.xgboost?.prediction
                              )}
                            </span>
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Confidence:{" "}
                            {formatConfidence(
                              machineLearning.xgboost?.confidence
                            )}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        {machineLearning.note ||
                          "Prediksi machine learning berhasil diproses."}
                      </p>
                    </>
                  ) : (
                    <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                      {machineLearning?.note ||
                        "Model machine learning belum tersedia."}
                    </div>
                  )}
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

            {result && triggeredRules.length === 0 && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                Tidak ada rule berbahaya yang terpicu pada fitur yang
                dievaluasi.
              </div>
            )}

            {result && triggeredRules.length > 0 && (
              <div className="mt-6 space-y-3">
                {triggeredRules.map((rule, index) => (
                  <div
                    key={rule.code || index}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {displayValue(rule.code)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getDarkStatusStyle(
                          rule.conclusion || ""
                        )}`}
                      >
                        {displayValue(rule.conclusion)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {displayValue(rule.explanation)}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Sumber: {displayValue(rule.source)}
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

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.note || "Fitur URL berhasil dievaluasi."}
            </p>

            {evaluatedFeatures.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                Tidak ada daftar fitur yang dikembalikan backend.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {evaluatedFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-200">
                      {feature}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Nilai: {displayValue(facts[feature])}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: nativeFallbackScript(API_BASE_URL),
        }}
      />
    </main>
  );
}
