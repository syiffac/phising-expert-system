"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  enableSvgFilter?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

type CSSVariables = React.CSSProperties & {
  "--glass-frost"?: number;
  "--glass-saturation"?: number;
};

const darkModeQuery = "(prefers-color-scheme: dark)";

function subscribeToDarkMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(darkModeQuery);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDarkModeSnapshot() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia(darkModeQuery).matches;
}

const supportsBackdropFilter = () => {
  if (typeof window === "undefined" || typeof CSS === "undefined") {
    return false;
  }

  return (
    CSS.supports("backdrop-filter", "blur(10px)") ||
    CSS.supports("-webkit-backdrop-filter", "blur(10px)")
  );
};

const supportsSVGFilters = (filterId: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const isWebkit =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isWebkit || isFirefox) {
    return false;
  }

  const div = document.createElement("div");
  div.style.backdropFilter = `url(#${filterId})`;

  return div.style.backdropFilter !== "";
};

export default function GlassSurface({
  children,
  width = "auto",
  height = "auto",
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  enableSvgFilter = false,
  className = "",
  style = {},
  ...props
}: GlassSurfaceProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);
  const [backdropFilterSupported, setBackdropFilterSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);
  const isDarkMode = useSyncExternalStore(
    subscribeToDarkMode,
    getDarkModeSnapshot,
    () => true
  );

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
    if (!enableSvgFilter) {
      return;
    }

    feImageRef.current?.setAttribute("href", generateDisplacementMap());
  }, [enableSvgFilter, generateDisplacementMap]);

  useEffect(() => {
    if (!enableSvgFilter) {
      return;
    }

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
    enableSvgFilter,
    mixBlendMode,
    updateDisplacementMap,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBackdropFilterSupported(supportsBackdropFilter());
      setSvgSupported(enableSvgFilter && supportsSVGFilters(filterId));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [enableSvgFilter, filterId]);

  useEffect(() => {
    if (!enableSvgFilter) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      window.setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [enableSvgFilter, updateDisplacementMap]);

  useEffect(() => {
    if (!enableSvgFilter) {
      return;
    }

    window.setTimeout(updateDisplacementMap, 0);
  }, [enableSvgFilter, height, updateDisplacementMap, width]);

  const baseStyles: CSSVariables = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": backgroundOpacity,
    "--glass-saturation": saturation,
  };

  const frostOpacity = Math.min(Math.max(backgroundOpacity + 0.08, 0.12), 0.24);
  const edgeOpacity = Math.min(Math.max(opacity * 0.22, 0.16), 0.28);
  const glassBlur = Math.min(Math.max(blur, 10), 14);

  const glassStyles: React.CSSProperties = enableSvgFilter && svgSupported
    ? {
        ...baseStyles,
        background: isDarkMode
          ? `hsl(0 0% 0% / ${backgroundOpacity})`
          : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        WebkitBackdropFilter: `url(#${filterId}) saturate(${saturation})`,
        boxShadow: isDarkMode
          ? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
             0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`
          : `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset,
             0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`,
      }
    : isDarkMode
      ? !backdropFilterSupported
        ? {
            ...baseStyles,
            background: "rgba(15, 23, 42, 0.76)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
          }
        : {
            ...baseStyles,
            background: `linear-gradient(135deg,
              rgba(255, 255, 255, ${frostOpacity}) 0%,
              rgba(255, 255, 255, ${frostOpacity * 0.42}) 42%,
              rgba(34, 211, 238, ${frostOpacity * 0.2}) 100%)`,
            backdropFilter: `blur(${glassBlur}px) saturate(${1.3 + saturation * 0.28}) brightness(1.14)`,
            WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${1.3 + saturation * 0.28}) brightness(1.14)`,
            border: `1px solid rgba(255, 255, 255, ${edgeOpacity})`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${edgeOpacity + 0.08}),
              inset 0 -1px 0 rgba(255,255,255,${edgeOpacity * 0.45}),
              inset 0 0 18px rgba(255,255,255,0.045),
              0 10px 28px rgba(2, 6, 23, 0.24)`,
            contain: "paint",
          }
      : !backdropFilterSupported
      ? {
          ...baseStyles,
          background: "rgba(255, 255, 255, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`,
        }
      : {
          ...baseStyles,
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px) saturate(1.8) brightness(1.1)",
          WebkitBackdropFilter: "blur(12px) saturate(1.8) brightness(1.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2),
                      0 2px 16px 0 rgba(31, 38, 135, 0.1),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`,
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
      {enableSvgFilter && (
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
      )}

      <div className="contents">{children}</div>
    </div>
  );
}
