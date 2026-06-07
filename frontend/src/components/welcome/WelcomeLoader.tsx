"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import brandIcon from "@/app/icon.png";

const SESSION_KEY = "phishguard-welcome-seen";

const INIT_STEPS = [
  "Initializing Expert System",
  "Loading F01\u2013F30 Knowledge Base",
  "Preparing Forward Chaining Engine",
  "Loading XGBoost Runtime Model",
  "Checking Feature Extraction Pipeline",
  "System Ready",
];

const TOTAL_DURATION = 2400;
const STEP_INTERVAL = TOTAL_DURATION / INIT_STEPS.length;

function hasSeenLoader(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

interface WelcomeLoaderProps {
  onComplete?: () => void;
}

export default function WelcomeLoader({ onComplete }: WelcomeLoaderProps) {
  const [visible, setVisible] = useState(() => !hasSeenLoader());
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage unavailable
    }
    // Notify after exit animation completes (400ms)
    setTimeout(() => onCompleteRef.current?.(), 450);
  }, []);

  // If loader was already seen, notify immediately
  useEffect(() => {
    if (!visible) {
      onCompleteRef.current?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect for loader animation
  useEffect(() => {
    if (!visible) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= INIT_STEPS.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (TOTAL_DURATION / 30);
        return next >= 100 ? 100 : next;
      });
    }, 30);

    const exitTimer = setTimeout(() => {
      dismiss();
    }, TOTAL_DURATION + (prefersReducedMotion ? 100 : 400));

    timersRef.current = [stepTimer, progressTimer, exitTimer];

    return () => {
      timersRef.current.forEach((id) => {
        clearInterval(id);
        clearTimeout(id);
      });
      timersRef.current = [];
    };
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111F] via-[#0a1628] to-[#07111F]" />

          {/* Subtle radial glow */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)",
            }}
          />

          {/* Soft grid overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6">
            {/* Logo container */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Glow ring behind logo */}
              <div
                aria-hidden="true"
                className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full opacity-40 animate-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)",
                }}
              />

              {/* Glass circle container */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-cyan-950/20 flex items-center justify-center overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent"
                />
                <Image
                  src={brandIcon}
                  alt="PhishGuard"
                  width={56}
                  height={56}
                  className="relative z-10 w-12 h-12 md:w-14 md:h-14 object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Brand text */}
            <motion.div
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                PhishGuard
              </h1>
              <p className="text-xs md:text-sm font-medium tracking-wide text-slate-400">
                Hybrid Expert System
              </p>
            </motion.div>

            {/* Progress section */}
            <motion.div
              className="w-64 md:w-80 flex flex-col items-center gap-3 mt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* Progress bar */}
              <div className="relative w-full h-[3px] rounded-full bg-slate-800/80 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #22D3EE, #3B82F6, #8B5CF6)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
                {/* Glow on leading edge */}
                <motion.div
                  className="absolute inset-y-0 w-8 rounded-full blur-sm opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #22D3EE, transparent)",
                  }}
                  animate={{ left: `calc(${progress}% - 16px)` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              </div>

              {/* Step text */}
              <div className="h-5 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    className="font-mono text-[10px] md:text-xs tracking-wider text-cyan-400/80 uppercase text-center"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {INIT_STEPS[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Percentage */}
              <p className="font-mono text-[10px] text-slate-500 tracking-wide">
                {Math.round(progress)}%
              </p>
            </motion.div>

            {/* Runtime label */}
            <motion.p
              className="font-mono text-[9px] md:text-[10px] text-slate-600 tracking-widest uppercase mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Runtime Mode: Optimized Hybrid XGBoost
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
