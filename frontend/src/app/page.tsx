"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AnalyzeSection from "@/components/landing/AnalyzeSection";
import DarkVeilBackground from "@/components/visual/DarkVeilBackground";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";
import ProblemCards from "@/components/landing/ProblemCards";
import ResultDashboard from "@/components/landing/ResultDashboard";
import SystemFlow from "@/components/landing/SystemFlow";
import type {
  DetectResponse,
  EvaluationData,
  KnowledgeFeature,
} from "@/types/detect";

const WelcomeLoader = dynamic(
  () => import("@/components/welcome/WelcomeLoader"),
  { ssr: false }
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function parseBackendError(response: Response) {
  try {
    const payload: unknown = await response.json();

    if (
      payload &&
      typeof payload === "object" &&
      "detail" in payload &&
      typeof payload.detail === "string"
    ) {
      return payload.detail;
    }
  } catch {
    // Keep the fallback message below when the body is not JSON.
  }

  if (response.status === 400) {
    return "The submitted URL could not be analyzed. Please check the format and try again.";
  }

  return "Backend returned an error while processing the URL.";
}

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [features, setFeatures] = useState<KnowledgeFeature[]>([]);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loaderDone, setLoaderDone] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadRuntimeContext() {
      try {
        const [featuresResponse, evaluationResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/features/`),
          fetch(`${API_BASE_URL}/api/evaluation/`),
        ]);

        if (featuresResponse.ok) {
          const payload = (await featuresResponse.json()) as {
            data?: KnowledgeFeature[];
          };
          setFeatures(Array.isArray(payload.data) ? payload.data : []);
        }

        if (evaluationResponse.ok) {
          const payload = (await evaluationResponse.json()) as {
            data?: EvaluationData;
          };
          setEvaluationData(payload.data || null);
        }
      } catch {
        // Detection still works without auxiliary display metadata.
      }
    }

    loadRuntimeContext();
  }, []);

  async function handleSubmit() {
    const trimmedUrl = inputUrl.trim();

    if (!trimmedUrl) {
      setErrorMessage("Please enter a URL before analysis.");
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResult(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/detect/`, {
        body: JSON.stringify({ url: trimmedUrl }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await parseBackendError(response));
      }

      const data = (await response.json()) as DetectResponse;
      setResult(data);

      window.setTimeout(() => {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        resultRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }, 150);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage(
          "Backend API is not reachable. Please start FastAPI server on port 8000."
        );
      } else if (error instanceof TypeError) {
        setErrorMessage(
          "Backend API is not reachable. Please start FastAPI server on port 8000."
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unexpected error while analyzing the URL.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-100 selection:bg-cyan-300/25 selection:text-cyan-50">
      <WelcomeLoader onComplete={() => setLoaderDone(true)} />
      <DarkVeilBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection observeReady={loaderDone} />
        <ProblemCards observeReady={loaderDone} />
        <SystemFlow observeReady={loaderDone} />
        <AnalyzeSection
          errorMessage={errorMessage}
          inputUrl={inputUrl}
          loading={loading}
          onInputChange={(value) => {
            setInputUrl(value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          onSubmit={handleSubmit}
        />
        {result && (
          <ResultDashboard
            evaluationData={evaluationData}
            featureCatalog={features}
            ref={resultRef}
            result={result}
          />
        )}
      </div>
    </main>
  );
}
