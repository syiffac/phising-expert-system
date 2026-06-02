"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface GlassSurfaceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter";
  className?: string;
  style?: React.CSSProperties;
}

type CSSVariables = React.CSSProperties & {
  "--glass-frost"?: number;
  "--glass-saturation"?: number;
};

const supportsBackdropFilter = () => {
  if (typeof window === "undefined" || typeof CSS === "undefined") {
    return false;
  }

  return (
    CSS.supports("backdrop-filter", "blur(10px)") ||
    CSS.supports("-webkit-backdrop-filter", "blur(10px)")
  );
};

export default function GlassSurface({
  children,
  width = "auto",
  height = "auto",
  borderRadius = 20,
  borderWidth = 0.08,
  brightness = 58,
  opacity = 0.86,
  blur = 12,
  displace = 0.35,
  backgroundOpacity = 0.18,
  saturation = 1.35,
  distortionScale = -150,
  redOffset = 4,
  greenOffset = 12,
  blueOffset = 22,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "screen",
  className = "",
  style = {},
  ...props
}: GlassSurfaceProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [
    blueGradId,
    blur,
    borderRadius,
    borderWidth,
    brightness,
    mixBlendMode,
    opacity,
    redGradId,
  ]);

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute("href", generateDisplacementMap());
  }, [generateDisplacementMap]);

  useEffect(() => {
    updateDisplacementMap();

    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (!ref.current) {
        return;
      }

      ref.current.setAttribute("scale", (distortionScale + offset).toString());
      ref.current.setAttribute("xChannelSelector", xChannel);
      ref.current.setAttribute("yChannelSelector", yChannel);
    });

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    updateDisplacementMap,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const isWebkit =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const div = document.createElement("div");
      div.style.backdropFilter = `url(#${filterId})`;
      setSvgSupported(div.style.backdropFilter !== "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [filterId]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      window.setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [updateDisplacementMap]);

  useEffect(() => {
    window.setTimeout(updateDisplacementMap, 0);
  }, [height, updateDisplacementMap, width]);

  const baseStyles: CSSVariables = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": backgroundOpacity,
    "--glass-saturation": saturation,
  };

  const glassStyles: React.CSSProperties = svgSupported
    ? {
        ...baseStyles,
        background: `rgba(15, 23, 42, ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation}) brightness(1.08)`,
        WebkitBackdropFilter: `url(#${filterId}) saturate(${saturation}) brightness(1.08)`,
        boxShadow: `0 0 2px 1px rgba(255,255,255,0.18) inset,
          0 0 18px 4px rgba(255,255,255,0.06) inset,
          0 18px 60px rgba(2, 6, 23, 0.42)`,
      }
    : supportsBackdropFilter()
      ? {
          ...baseStyles,
          background: `rgba(15, 23, 42, ${Math.max(backgroundOpacity, 0.28)})`,
          backdropFilter: `blur(18px) saturate(${1 + saturation * 0.42}) brightness(1.1)`,
          WebkitBackdropFilter: `blur(18px) saturate(${1 + saturation * 0.42}) brightness(1.1)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(255,255,255,0.08),
            0 18px 60px rgba(2, 6, 23, 0.42)`,
        }
      : {
          ...baseStyles,
          background: "rgba(15, 23, 42, 0.76)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
        };

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-opacity duration-[260ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        className
      )}
      ref={containerRef}
      style={glassStyles}
      {...props}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            height="100%"
            id={filterId}
            width="100%"
            x="0%"
            y="0%"
          >
            <feImage
              height="100%"
              preserveAspectRatio="none"
              ref={feImageRef}
              result="map"
              width="100%"
              x="0"
              y="0"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              ref={redChannelRef}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              result="red"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              ref={greenChannelRef}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              result="green"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              ref={blueChannelRef}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              result="blue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur
              in="output"
              ref={gaussianBlurRef}
              stdDeviation="0.7"
            />
          </filter>
        </defs>
      </svg>

      <div className="contents">{children}</div>
    </div>
  );
}
