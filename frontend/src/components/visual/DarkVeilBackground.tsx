"use client";

import DarkVeil from "@/components/DarkVeil";

export default function DarkVeilBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#07111F]"
    >
      <DarkVeil
        className="absolute inset-0 h-full w-full opacity-[0.76] mix-blend-screen"
        canvasClassName="h-full w-full"
        hueShift={41}
        noiseIntensity={0}
        resolutionScale={0.52}
        scanlineFrequency={2.5}
        scanlineIntensity={0.08}
        speed={3}
        style={{
          transform: "translate3d(18vw, -4vh, 0) scale(1.36)",
          transformOrigin: "center center",
          willChange: "transform",
        }}
        warpAmount={2.1}
      />
    </div>
  );
}
