"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import heroImage from "@/app/hero.png";

const sparkles = [
  { left: "10%", top: "20%", size: 4, delay: 0 },
  { left: "82%", top: "15%", size: 3, delay: 1.8 },
  { left: "90%", top: "50%", size: 3.5, delay: 3.4 },
  { left: "18%", top: "74%", size: 3, delay: 0.6 },
  { left: "68%", top: "86%", size: 4, delay: 5.0 },
  { left: "40%", top: "5%", size: 3, delay: 2.2 },
  { left: "7%", top: "52%", size: 3, delay: 4.6 },
  { left: "76%", top: "70%", size: 3.5, delay: 6.0 },
];

export default function CyberHeroIllustration() {
  const shellRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const pointerGlowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  /* All animated values in one ref for single rAF loop */
  const v = useRef({
    rx: 0, ry: 0,     // card tilt
    ix: 0, iy: 0,     // image translate
    cx: 0, cy: 0,     // core translate
    sx: 0, sy: 0,     // sparkles translate
    sc: 1,             // card scale
    px: 0, py: 0,     // pointer glow position
    glow: 0,           // pointer glow opacity
  });

  const t = useRef({
    rx: 0, ry: 0,
    ix: 0, iy: 0,
    cx: 0, cy: 0,
    sx: 0, sy: 0,
    sc: 1,
    px: 0, py: 0,
    glow: 0,
  });

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mqReduce.matches) return undefined;

    const mqDesktop = window.matchMedia("(min-width: 768px)");
    if (!mqDesktop.matches) return undefined;

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const render = () => {
      const c = v.current;
      const g = t.current;

      // Lerp all values
      c.rx = lerp(c.rx, g.rx, 0.08);
      c.ry = lerp(c.ry, g.ry, 0.08);
      c.ix = lerp(c.ix, g.ix, 0.07);
      c.iy = lerp(c.iy, g.iy, 0.07);
      c.cx = lerp(c.cx, g.cx, 0.09);
      c.cy = lerp(c.cy, g.cy, 0.09);
      c.sx = lerp(c.sx, g.sx, 0.05);
      c.sy = lerp(c.sy, g.sy, 0.05);
      c.sc = lerp(c.sc, g.sc, 0.08);
      c.px = lerp(c.px, g.px, 0.12);
      c.py = lerp(c.py, g.py, 0.12);
      c.glow = lerp(c.glow, g.glow, 0.1);

      // Apply transforms to each layer
      if (cardRef.current) {
        cardRef.current.style.transform =
          `perspective(1400px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.sc})`;
      }
      if (imageRef.current) {
        imageRef.current.style.transform =
          `translate3d(${c.ix}px, ${c.iy}px, 0)`;
      }
      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate(calc(-50% + ${c.cx}px), calc(-50% + ${c.cy}px))`;
      }
      if (sparklesRef.current) {
        sparklesRef.current.style.transform =
          `translate(${c.sx}px, ${c.sy}px)`;
      }
      if (pointerGlowRef.current) {
        pointerGlowRef.current.style.transform =
          `translate(${c.px - 80}px, ${c.py - 80}px)`;
        pointerGlowRef.current.style.opacity = String(c.glow);
      }

      // Check if settled
      const settled =
        Math.abs(g.rx - c.rx) < 0.01 &&
        Math.abs(g.ry - c.ry) < 0.01 &&
        Math.abs(g.sc - c.sc) < 0.001;

      if (settled && g.rx === 0 && g.ry === 0 && g.sc === 1) {
        if (cardRef.current) cardRef.current.style.transform = "";
        if (imageRef.current) imageRef.current.style.transform = "";
        if (coreRef.current) coreRef.current.style.transform = "";
        if (sparklesRef.current) sparklesRef.current.style.transform = "";
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      const rect = shell.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const dx = x - 0.5;
      const dy = y - 0.5;

      t.current = {
        rx: dy * -10,
        ry: dx * 10,
        ix: dx * 8,
        iy: dy * 6,
        cx: dx * 12,
        cy: dy * 10,
        sx: dx * -16,
        sy: dy * -14,
        sc: 1.02,
        px: e.clientX - rect.left,
        py: e.clientY - rect.top,
        glow: 1,
      };

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    const onLeave = () => {
      t.current = {
        rx: 0, ry: 0,
        ix: 0, iy: 0,
        cx: 0, cy: 0,
        sx: 0, sy: 0,
        sc: 1,
        px: 0, py: 0,
        glow: 0,
      };
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);
    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={shellRef}
      aria-hidden="true"
      className="hero-interactive-shell relative w-full overflow-visible"
    >
      {/* ═══ L0: Core Pulse Glow (behind everything) ═══ */}
      <div
        ref={coreRef}
        className="hero-core-pulse pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform bg-[radial-gradient(circle,rgba(34,211,238,0.20),rgba(59,130,246,0.08)_40%,transparent_70%)]"
      />

      {/* ═══ L1: 3D Card (tilt + scale) ═══ */}
      <div
        ref={cardRef}
        className="hero-card relative z-10 mx-auto w-full max-w-[600px] will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ═══ L2: Image (float + translate parallax) ═══ */}
        <div ref={imageRef} className="hero-float will-change-transform">
          <Image
            alt="PhishGuard cybersecurity hero illustration"
            className="w-full h-auto object-contain select-none pointer-events-none transition-[filter] duration-500 drop-shadow-[0_0_60px_rgba(34,211,238,0.22)] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_48%,black_35%,transparent_85%)] [-webkit-mask-image:radial-gradient(ellipse_80%_80%_at_50%_48%,black_35%,transparent_85%)]"
            priority
            sizes="(min-width: 1024px) 600px, (min-width: 640px) 480px, calc(100vw - 48px)"
            src={heroImage}
          />
        </div>

        {/* ═══ L3: Orbit + Data Flow (own parallax) ═══ */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[46%] z-[20] -translate-x-1/2 -translate-y-1/2 overflow-visible"
          width="340"
          height="340"
          viewBox="0 0 340 340"
          fill="none"
        >
          <defs>
            <linearGradient id="heroDataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
              <stop offset="40%" stopColor="#22D3EE" stopOpacity="1" />
              <stop offset="60%" stopColor="#14B8A6" stopOpacity="1" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
            </linearGradient>
          </defs>

          <ellipse className="hero-orbit-ring" cx="170" cy="170" rx="140" ry="100" stroke="#22D3EE" strokeDasharray="6 14" strokeOpacity="0.20" strokeWidth="1" />
          <ellipse className="hero-orbit-ring hero-orbit-ring-rev" cx="170" cy="170" rx="110" ry="78" stroke="#3B82F6" strokeDasharray="4 16" strokeOpacity="0.15" strokeWidth="0.8" />

          <path className="hero-data-flow" d="M80 130 C120 115 140 155 170 170" stroke="url(#heroDataFlow)" strokeLinecap="round" strokeWidth="1.4" />
          <path className="hero-data-flow hero-data-flow-b" d="M170 170 C175 210 170 245 170 280" stroke="url(#heroDataFlow)" strokeLinecap="round" strokeWidth="1.2" />
          <path className="hero-data-flow hero-data-flow-c" d="M265 200 C230 195 200 180 170 170" stroke="url(#heroDataFlow)" strokeLinecap="round" strokeWidth="1.2" />

          <circle r="2.5" fill="#22D3EE" opacity="0.8">
            <animateMotion dur="3.5s" repeatCount="indefinite" path="M80 130 C120 115 140 155 170 170" />
          </circle>
          <circle r="2" fill="#14B8A6" opacity="0.7">
            <animateMotion dur="3s" repeatCount="indefinite" path="M170 170 C175 210 170 245 170 280" />
          </circle>
          <circle r="2" fill="#3B82F6" opacity="0.7">
            <animateMotion dur="4s" repeatCount="indefinite" path="M265 200 C230 195 200 180 170 170" />
          </circle>
        </svg>

        {/* ═══ Scan Line ═══ */}
        <div className="pointer-events-none absolute left-1/2 top-[46%] z-[21] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <div className="hero-scanline absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.15)]" />
        </div>

        {/* ═══ L4: Sparkles (highest parallax, reverse direction) ═══ */}
        <div ref={sparklesRef} className="pointer-events-none absolute inset-0 z-[22] will-change-transform">
          {sparkles.map((s, i) => (
            <span
              key={i}
              className="hero-sparkle absolute rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.80)]"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══ L5: Pointer Glow (follows cursor exactly) ═══ */}
      <div
        ref={pointerGlowRef}
        className="pointer-events-none absolute left-0 top-0 z-[23] h-[160px] w-[160px] rounded-full opacity-0 will-change-transform bg-[radial-gradient(circle,rgba(34,211,238,0.15),rgba(59,130,246,0.05)_50%,transparent_75%)] blur-xl"
      />
    </div>
  );
}
