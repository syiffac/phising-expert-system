"use client";

import DarkVeil from "@/components/DarkVeil";

export default function DarkVeilBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden"
    >
      <DarkVeil
        className="absolute inset-0 h-full w-full opacity-50"
        canvasClassName="h-full w-full"
        hueShift={41}
        noiseIntensity={0}
        resolutionScale={0.52}
        scanlineFrequency={0.6}
        scanlineIntensity={0}
        speed={3}
        style={{
          transform: "translate3d(18vw, -4vh, 0) scale(1.36)",
          transformOrigin: "center center",
          willChange: "transform",
        }}
        warpAmount={4.3}
      />
      {/* Subtle radial glow for depth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(34,211,238,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 75% 60%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
