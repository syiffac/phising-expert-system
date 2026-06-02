"use client";

import React from "react";
import { cn } from "@/lib/cn";
import GlassSurface from "@/components/GlassSurface";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  height?: number | string;
  glow?: boolean;
  interactive?: boolean;
  glassIntensity?: "soft" | "medium" | "strong";
  width?: number | string;
}

export default function GlassCard({
  children,
  className,
  borderRadius = 24,
  height,
  glow = false,
  interactive = true,
  glassIntensity = "medium",
  style,
  width = "100%",
  ...props
}: GlassCardProps) {
  const glassProps = {
    soft: {
      backgroundOpacity: 0.16,
      blur: 12,
      borderWidth: 0.06,
      brightness: 56,
      displace: 0.25,
      distortionScale: -110,
      opacity: 0.82,
      saturation: 1.35,
    },
    medium: {
      backgroundOpacity: 0.2,
      blur: 15,
      borderWidth: 0.08,
      brightness: 62,
      displace: 0.42,
      distortionScale: -180,
      opacity: 0.9,
      saturation: 1.65,
    },
    strong: {
      backgroundOpacity: 0.24,
      blur: 18,
      borderWidth: 0.1,
      brightness: 68,
      displace: 0.62,
      distortionScale: -230,
      opacity: 0.96,
      saturation: 1.9,
    },
  }[glassIntensity];

  return (
    <GlassSurface
      borderRadius={borderRadius}
      className={cn(
        "rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/35",
        "relative min-w-0 overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30",
        "after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(34,211,238,0.10),transparent_42%)] after:opacity-70",
        interactive &&
          "transition duration-300 ease-out hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-cyan-950/20 active:translate-y-0",
        glow &&
          "after:opacity-100 after:bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.20),transparent_36%),linear-gradient(135deg,rgba(139,92,246,0.10),transparent_48%)]",
        className
      )}
      height={height}
      style={style}
      width={width}
      {...glassProps}
      {...props}
    >
      {children}
    </GlassSurface>
  );
}
