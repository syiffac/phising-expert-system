"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  observe?: boolean;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  once = true,
  observe = true,
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observe) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.08,
      }
    );

    const element = containerRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [once, observe]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-[820ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7",
        className
      )}
      style={{
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
