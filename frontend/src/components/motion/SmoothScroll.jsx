"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const frameRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const stopLenis = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const startLenis = () => {
      if (mediaQuery.matches || lenisRef.current) {
        return;
      }

      const lenis = new Lenis({
        anchors: true,
        duration: 0.78,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: "vertical",
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.08,
      });

      lenisRef.current = lenis;

      const raf = (time) => {
        lenis.raf(time);
        frameRef.current = window.requestAnimationFrame(raf);
      };

      frameRef.current = window.requestAnimationFrame(raf);
    };

    const syncMotionPreference = () => {
      if (mediaQuery.matches) {
        stopLenis();
      } else {
        startLenis();
      }
    };

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncMotionPreference);
      stopLenis();
    };
  }, []);

  return <>{children}</>;
}
