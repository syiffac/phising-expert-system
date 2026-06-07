"use client";

import Image from "next/image";
import Link from "next/link";
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

function BrandMark() {
  return (
    <div className="fixed left-4 top-5 z-50 sm:left-6 lg:top-6">
      <GlassCard
        borderRadius={999}
        className="px-2.5 py-1.5 shadow-cyan-950/20"
        glassIntensity="strong"
        interactive={false}
        width="auto"
      >
        <Link
          aria-label="PhishGuard home"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 pr-1"
          href="/"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 p-1.5 shadow-md shadow-cyan-950/30 transition duration-200 group-hover:border-cyan-200/40 group-hover:bg-cyan-300/15">
            <Image
              alt="PhishGuard Logo"
              className="h-full w-full object-contain"
              priority
              src={brandIcon}
            />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-base font-black leading-none tracking-tight text-slate-50">
              PhishGuard
            </span>
            <span className="mt-1 block font-mono text-[9px] font-bold uppercase leading-none tracking-widest text-cyan-300">
              Expert System
            </span>
          </span>
        </Link>
      </GlassCard>
    </div>
  );
}

function MobileMenuButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label="Toggle navigation menu"
      className="fixed left-[5.25rem] top-5 z-[70] inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-slate-950/65 text-slate-100 shadow-2xl shadow-cyan-950/25 outline outline-1 outline-white/[0.08] backdrop-blur-xl transition hover:border-cyan-200/45 hover:bg-slate-900/75 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 active:scale-[0.97] sm:left-auto sm:right-6 lg:hidden"
      onClick={onToggle}
      type="button"
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </button>
  );
}

function DesktopNav() {
  return (
    <div className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 lg:block">
      <GlassCard
        borderRadius={999}
        className="px-5 py-2.5 shadow-cyan-950/20"
        glassIntensity="strong"
        interactive={false}
        width="auto"
      >
        <nav aria-label="Primary navigation" className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-white/[0.06] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </GlassCard>
    </div>
  );
}

function MobileNavPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <GlassCard
      borderRadius={24}
      className={cn(
        "fixed z-50 origin-top p-4 transition-all duration-300 ease-out lg:hidden",
        isOpen
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-2 scale-95 opacity-0"
      )}
      glassIntensity="strong"
      interactive={false}
      style={{ left: "1rem", right: "1rem", top: "5.25rem" }}
    >
      <nav aria-label="Mobile navigation">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.href}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </GlassCard>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BrandMark />
      <MobileMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen((value) => !value)}
      />
      <MobileNavPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <DesktopNav />
    </>
  );
}
