import Link from "next/link";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type DatasetSample = {
  index: number;
  url: string;
  actual_label: string;
};

type ModelPrediction = {
  prediction: string;
  confidence: number | null;
  is_correct: boolean;
};

type DatasetPrediction = {
  index: number;
  url: string;
  actual_label: string;
  features_used: number;
  random_forest: ModelPrediction;
  xgboost: ModelPrediction;
  note: string;
};

type SamplesResponse = {
  total: number;
  data: DatasetSample[];
};

type DatasetDemoPageProps = {
  searchParams?: Promise<{
    index?: string | string[];
  }>;
};

function statusClass(status: string) {
  if (status === "phishing") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (status === "legitimate") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  return "border-slate-600 bg-slate-800 text-slate-200";
}

function correctnessClass(isCorrect: boolean) {
  return isCorrect
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    : "border-red-500/30 bg-red-500/10 text-red-200";
}

function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

async function readErrorMessage(response: Response) {
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
    // Response body is not JSON; use generic message below.
  }

  return "Terjadi kesalahan saat memproses request dataset.";
}

async function getSamples() {
  const response = await fetch(`${API_BASE_URL}/api/dataset/samples?limit=10`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as SamplesResponse;
}

async function predictSample(index: number) {
  const response = await fetch(`${API_BASE_URL}/api/dataset/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as DatasetPrediction;
}

function getSelectedIndex(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  if (!rawValue || !Number.isInteger(parsedValue)) {
    return null;
  }

  return parsedValue;
}

function PredictionCard({
  title,
  prediction,
}: {
  title: string;
  prediction: ModelPrediction;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-cyan-300">{title}</h3>
          <p className="mt-2 text-sm capitalize text-slate-300">
            Prediksi:{" "}
            <span className="font-semibold text-slate-100">
              {prediction.prediction || "-"}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Confidence: {formatConfidence(prediction.confidence)}
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${correctnessClass(
            prediction.is_correct
          )}`}
        >
          {prediction.is_correct ? "Benar" : "Tidak cocok"}
        </span>
      </div>
    </div>
  );
}

export default async function DatasetDemoPage({
  searchParams,
}: DatasetDemoPageProps) {
  const params = await searchParams;
  const selectedIndex = getSelectedIndex(params?.index);

  let samples: DatasetSample[] = [];
  let totalSamples = 0;
  let selectedResult: DatasetPrediction | null = null;
  let errorMessage = "";

  try {
    const samplesResponse = await getSamples();
    samples = samplesResponse.data || [];
    totalSamples = samplesResponse.total || 0;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal mengambil sample dataset.";
  }

  if (selectedIndex !== null) {
    try {
      selectedResult = await predictSample(selectedIndex);
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menjalankan prediksi dataset.";
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-cyan-300 hover:underline">
          Kembali ke Deteksi URL
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            Hybrid Expert System
          </p>

          <h1 className="text-4xl font-bold">Dataset Feature Mode</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Mode ini memakai sample dari dataset yang sudah memiliki 87 fitur
            lengkap. Model Random Forest dan XGBoost dataset digunakan untuk
            demo prediksi tanpa training ulang, terpisah dari Manual URL Mode
            yang tetap memakai rule base, working memory, inference engine, dan
            forward chaining.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {selectedResult && (
          <div className="mt-8 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-5">
            <p className="text-sm font-semibold text-cyan-200">
              Sample index {selectedResult.index} berhasil diprediksi.
            </p>
            <p className="mt-2 break-all text-sm text-slate-300">
              {selectedResult.url}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                  selectedResult.actual_label
                )}`}
              >
                Actual: {selectedResult.actual_label}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
                RF: {selectedResult.random_forest.prediction} (
                {formatConfidence(selectedResult.random_forest.confidence)})
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
                XGBoost: {selectedResult.xgboost.prediction} (
                {formatConfidence(selectedResult.xgboost.confidence)})
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Sample Dataset</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Pilih satu sample untuk menjalankan prediksi model 87 fitur.
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Total data tersedia: {totalSamples || "-"}
                </p>
              </div>

              <Link
                href="/dataset-demo"
                className="w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Muat Ulang
              </Link>
            </div>

            {samples.length === 0 && !errorMessage && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">
                Sample dataset belum tersedia.
              </div>
            )}

            {samples.length > 0 && (
              <div className="mt-6 space-y-3">
                {samples.map((sample) => (
                  <div
                    key={sample.index}
                    className={`rounded-xl border bg-slate-950 p-4 ${
                      selectedIndex === sample.index
                        ? "border-cyan-400/70"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-300">
                            Index {sample.index}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                              sample.actual_label
                            )}`}
                          >
                            {sample.actual_label}
                          </span>
                        </div>

                        <p className="mt-3 break-all text-sm font-medium text-slate-100">
                          {sample.url}
                        </p>
                      </div>

                      <form action="/dataset-demo#hasil-prediksi" method="get">
                        <button
                          type="submit"
                          name="index"
                          value={sample.index}
                          className="w-fit rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          Prediksi
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            id="hasil-prediksi"
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl"
          >
            <h2 className="text-xl font-semibold">Hasil Prediksi</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Output ini berasal dari model dataset 87 fitur, bukan dari input
              URL manual.
            </p>

            {!selectedResult && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">
                Belum ada sample yang diprediksi.
              </div>
            )}

            {selectedResult && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">Sample</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-100">
                    {selectedResult.url}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                        selectedResult.actual_label
                      )}`}
                    >
                      Actual: {selectedResult.actual_label}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
                      Fitur: {selectedResult.features_used}
                    </span>
                  </div>
                </div>

                <PredictionCard
                  title="Random Forest"
                  prediction={selectedResult.random_forest}
                />

                <PredictionCard
                  title="XGBoost"
                  prediction={selectedResult.xgboost}
                />

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs leading-5 text-slate-500">
                  {selectedResult.note}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
