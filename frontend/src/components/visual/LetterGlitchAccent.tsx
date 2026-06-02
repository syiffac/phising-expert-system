"use client";

import LetterGlitch from "@/components/LetterGlitch";
import { cn } from "@/lib/cn";

interface LetterGlitchAccentProps {
  className?: string;
}

export default function LetterGlitchAccent({
  className,
}: LetterGlitchAccentProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[#07111F]/35" />
      <LetterGlitch
        canvasClassName="opacity-80 mix-blend-screen"
        centerVignette={false}
        characters="01FPGHXBRULECHAINWHOISDNSSSLURLRISKSAFE"
        className="h-full w-full bg-transparent"
        glitchColors={["#22D3EE", "#3B82F6", "#8B5CF6", "#94A3B8"]}
        glitchSpeed={96}
        outerVignette={false}
        smooth
      />
    </div>
  );
}
