"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import brandIcon from "@/app/icon.png";
import GlassCard from "@/components/ui-custom/GlassCard";

const navItems = [
  { label: "Analyze", href: "#analyze" },
  { label: "History", href: "/history" },
  { label: "Evaluation", href: "/evaluation" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "About", href: "/about" },
];

function BrandLink() {
  return (
    <Link
      aria-label="PhishGuard home"
      className="flex min-w-0 shrink-0 items-center gap-3"
      href="/"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] p-1.5 shadow-md shadow-cyan-950/20">
        <Image
          src={brandIcon}
          alt="PhishGuard Logo"
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black leading-none tracking-tight text-slate-50">
          PhishGuard
        </span>
        <span className="mt-1 hidden font-mono text-[9px] font-bold uppercase leading-none tracking-widest text-cyan-300 sm:block">
          Expert System
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="fixed top-6 z-50 lg:hidden"
        style={{ left: "1rem" }}
      >
        <GlassCard
          borderRadius={999}
          className="inline-flex w-auto items-center gap-4 px-4 py-2 shadow-cyan-950/20"
          glassIntensity="strong"
          interactive={false}
          width="auto"
        >
          <BrandLink />

          <button
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            className="relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-[#0B1220]/80 text-slate-100 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:text-cyan-200 active:scale-[0.97]"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </GlassCard>

        <GlassCard
          borderRadius={24}
          className={cn(
            "fixed z-50 p-4 transition-all duration-300 ease-out origin-top",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}
          glassIntensity="strong"
          interactive={false}
          style={{ left: "1rem", right: "1rem", top: "5.5rem" }}
        >
          <nav aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-cyan-200"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="mt-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-center text-sm font-bold text-cyan-100"
                href="#analyze"
                onClick={() => setIsOpen(false)}
              >
                Analyze URL
              </Link>
            </div>
          </nav>
        </GlassCard>
      </div>

      <div className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 lg:block">
        <GlassCard
          borderRadius={999}
          className="flex items-center justify-between gap-12 px-6 py-2.5 shadow-cyan-950/20"
          glassIntensity="strong"
          interactive={false}
        >
          <BrandLink />

          <nav
            className="flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <Link
                className="whitespace-nowrap rounded-full px-3.5 py-1 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-white/[0.06] hover:text-cyan-200"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 text-xs font-bold text-cyan-100 shadow-md shadow-cyan-950/20 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.20)] active:scale-[0.98]"
              href="#analyze"
            >
              Analyze URL
            </Link>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
