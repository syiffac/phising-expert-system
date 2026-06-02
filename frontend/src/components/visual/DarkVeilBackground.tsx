"use client";

import DarkVeil from "@/components/DarkVeil";

export default function DarkVeilBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07111F]"
    >
      <DarkVeil
        className="absolute inset-0 opacity-[0.76] mix-blend-screen"
        hueShift={41}
        noiseIntensity={0}
        resolutionScale={0.48}
        scanlineFrequency={1}
        scanlineIntensity={0.08}
        speed={1.8}
        warpAmount={2.1}
      />
    </div>
  );
}
