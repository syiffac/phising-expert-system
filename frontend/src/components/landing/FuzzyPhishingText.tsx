"use client";

import FuzzyText from "@/components/FuzzyText";

export default function FuzzyPhishingText({
  startAnimation = true,
}: {
  startAnimation?: boolean;
}) {
  return (
    <span className="hero-fuzzy-wrapper block">
      <span className="hero-fuzzy-reserve text-4xl font-black leading-[1.08] tracking-tight md:text-5xl xl:text-6xl">
        Phishing Website
      </span>
      <span aria-hidden="true" className="hero-fuzzy-canvas-layer">
        <FuzzyText
          baseIntensity={0.14}
          className="hero-fuzzy-canvas text-4xl font-black leading-[1.08] tracking-tight md:text-5xl xl:text-6xl"
          color="#67e8f9"
          direction="horizontal"
          enableHover
          fontFamily="inherit"
          fontSize="inherit"
          fontWeight={900}
          fps={42}
          fuzzRange={6}
          glitchDuration={150}
          glitchInterval={3600}
          glitchMode={startAnimation}
          hoverIntensity={0.32}
        >
          Phishing Website
        </FuzzyText>
      </span>
    </span>
  );
}
