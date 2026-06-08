"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import brandIcon from "@/app/icon.png";
import GlassCard from "@/components/ui-custom/GlassCard";

const navItems = [
  { label: "Analyze", href: "/#analyze" },
  { label: "History", href: "/history" },
  { label: "Evaluation", href: "/evaluation" },
  { label: "Knowledge Base", href: "/knowledge-base" },
];

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/#analyze") return pathname === "/";
  return pathname === href;
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed left-1/2 top-5 z-50 hidden w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 lg:block">
      <GlassCard
        borderRadius={999}
        className="px-5 py-3 shadow-cyan-950/20"
        glassIntensity="strong"
        interactive={false}
        reactBits
        width="100%"
      >
        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          {/* Logo — left */}
          <Link
            aria-label="PhishGuard home"
            className="group flex shrink-0 items-center gap-2.5 pr-3 border-r border-white/[0.08]"
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
            <span className="hidden min-w-0 lg:block">
              <span className="block text-sm font-black leading-none tracking-tight text-slate-50">
                PhishGuard
              </span>
              <span className="mt-0.5 block font-mono text-[8px] font-bold uppercase leading-none tracking-widest text-cyan-300">
                Expert System
              </span>
            </span>
          </Link>

          {/* Nav links — center */}
          <div className="flex flex-1 items-center justify-center gap-1">
            {navItems.map((item) => (
              <Link
                aria-current={
                  isActiveNavItem(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 shrink-0",
                  isActiveNavItem(pathname, item.href)
                    ? "bg-cyan-300/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.20)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-cyan-200"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Analyze Now — right */}
          <Link
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.25)] transition duration-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.40)] active:scale-[0.97]"
            href="/#analyze"
          >
            Analyze Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </GlassCard>
    </div>
  );
}

function MobileNav({
  isOpen,
  onToggle,
  pathname,
}: {
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-4 right-4 top-4 z-50 flex items-center gap-3 lg:hidden">
        {/* Logo */}
        <GlassCard
          borderRadius={999}
          className="px-3 py-2 shadow-cyan-950/20"
          glassIntensity="strong"
          interactive={false}
          reactBits
          width="auto"
        >
          <Link
            aria-label="PhishGuard home"
            className="group flex shrink-0 items-center gap-2"
            href="/"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 p-1.5 shadow-md shadow-cyan-950/30">
              <Image
                alt="PhishGuard Logo"
                className="h-full w-full object-contain"
                priority
                src={brandIcon}
              />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-sm font-black leading-none tracking-tight text-slate-50">
                PhishGuard
              </span>
            </span>
          </Link>
        </GlassCard>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Analyze Now — mobile accent button */}
        <Link
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.30)] active:scale-[0.97]"
          href="/#analyze"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Menu toggle */}
        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-slate-950/60 text-slate-100 backdrop-blur-xl transition hover:border-cyan-300/30 hover:text-cyan-200 active:scale-[0.97]"
          onClick={onToggle}
          type="button"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <GlassCard
        borderRadius={24}
        className={cn(
          "fixed left-4 right-4 top-[4.5rem] z-50 origin-top p-4 transition-all duration-300 ease-out lg:hidden",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
        glassIntensity="strong"
        interactive={false}
        reactBits
      >
        <nav aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                aria-current={
                  isActiveNavItem(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70",
                  isActiveNavItem(pathname, item.href)
                    ? "bg-cyan-300/15 text-cyan-100"
                    : "text-slate-200 hover:bg-white/[0.06] hover:text-cyan-200"
                )}
                href={item.href}
                key={item.href}
                onClick={onToggle}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </GlassCard>
    </>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <DesktopNav pathname={pathname} />
      <MobileNav
        isOpen={isOpen}
        onToggle={() => setIsOpen((value) => !value)}
        pathname={pathname}
      />
    </>
  );
}
