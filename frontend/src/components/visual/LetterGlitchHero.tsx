"use client";

import LetterGlitch from "@/components/LetterGlitch";
import { cn } from "@/lib/cn";

interface LetterGlitchHeroProps {
  className?: string;
}

export default function LetterGlitchHero({
  className,
}: LetterGlitchHeroProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden hidden md:block",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-transparent to-[#07111F]/40 z-10" />
      <div className="absolute inset-0 bg-[#07111F]/25 z-10" />
      <LetterGlitch
        canvasClassName="opacity-[0.12] mix-blend-screen"
        centerVignette={false}
        characters="01FPGHXBRULECHAINWHOISDNSSSLURLRISKSAFE"
        className="h-full w-full bg-transparent"
        glitchColors={["#22D3EE", "#3B82F6", "#8B5CF6", "#38BDF8"]}
        glitchSpeed={96}
        outerVignette={false}
        smooth
      />
    </div>
  );
}
