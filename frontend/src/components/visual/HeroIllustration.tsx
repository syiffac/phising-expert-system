"use client";

import {
  ShieldCheck,
  Link2,
  GitBranch,
  Cpu,
  CheckCircle2,
} from "lucide-react";

export default function HeroIllustration() {
  return (
    <div className="hero-illustration-root relative w-full aspect-[5/4] max-w-[540px] mx-auto select-none">
      {/* ═══════════ AMBIENT PARTICLES ═══════════ */}
      <div aria-hidden="true" className="hero-particle absolute w-1 h-1 rounded-full bg-cyan-400/40 top-[12%] left-[18%]" />
      <div aria-hidden="true" className="hero-particle absolute w-1.5 h-1.5 rounded-full bg-violet-400/30 top-[28%] right-[14%]" />
      <div aria-hidden="true" className="hero-particle absolute w-1 h-1 rounded-full bg-blue-400/35 bottom-[20%] left-[25%]" />
      <div aria-hidden="true" className="hero-particle absolute w-0.5 h-0.5 rounded-full bg-teal-400/40 top-[65%] right-[22%]" />
      <div aria-hidden="true" className="hero-particle absolute w-1 h-1 rounded-full bg-cyan-300/25 bottom-[35%] left-[10%]" />

      {/* ═══════════ CENTRAL ORBITAL SYSTEM ═══════════ */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer orbit ring */}
        <div className="hero-orbit-ring absolute w-[88%] aspect-square rounded-full border border-cyan-400/[0.08]" />

        {/* Middle orbit ring */}
        <div className="hero-orbit-ring-reverse absolute w-[68%] aspect-square rounded-full border border-violet-400/[0.07]" />

        {/* Inner orbit ring */}
        <div className="hero-orbit-ring absolute w-[48%] aspect-square rounded-full border border-blue-400/[0.06]" />

        {/* Orbital dots — outer ring */}
        <div className="hero-orbit-ring absolute w-[88%] aspect-square">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400/40" />
        </div>

        {/* Orbital dots — middle ring (reverse) */}
        <div className="hero-orbit-ring-reverse absolute w-[68%] aspect-square">
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/50 shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400/40" />
        </div>

        {/* ═══════════ CENTER SHIELD ═══════════ */}
        <div className="hero-shield-container relative z-10 flex items-center justify-center w-[38%] aspect-square">
          {/* Shield glow backdrop */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/[0.06] blur-2xl scale-150 hero-shield-glow" />

          {/* Hexagonal shield SVG */}
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full hero-shield-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer hex */}
            <path
              d="M60 8L104 30V78L60 112L16 78V30L60 8Z"
              stroke="url(#shieldGrad)"
              strokeWidth="1.5"
              fill="rgba(34,211,238,0.03)"
              className="hero-hex-outer"
            />
            {/* Inner hex */}
            <path
              d="M60 22L94 39V69L60 98L26 69V39L60 22Z"
              stroke="url(#shieldGrad2)"
              strokeWidth="1"
              fill="rgba(15,23,42,0.4)"
              className="hero-hex-inner"
            />
            {/* Center checkmark */}
            <path
              d="M44 60L55 71L76 49"
              stroke="#22D3EE"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hero-check-path"
            />
            {/* Gradient defs */}
            <defs>
              <linearGradient id="shieldGrad" x1="16" y1="8" x2="104" y2="112">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="shieldGrad2" x1="26" y1="22" x2="94" y2="98">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/10 hero-pulse-ring" />
        </div>
      </div>

      {/* ═══════════ SCANNING LINE ═══════════ */}
      <div aria-hidden="true" className="hero-scan-line absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* ═══════════ FLOW NODES — positioned around the orbit ═══════════ */}

      {/* Node: URL Analysis — top left */}
      <div className="hero-flow-node absolute top-[6%] left-[2%] md:left-[4%] z-20">
        <FlowCard
          icon={<Link2 className="w-3.5 h-3.5 text-blue-300" />}
          label="URL Analysis"
          accent="blue"
        />
      </div>

      {/* Node: Forward Chaining — left middle */}
      <div className="hero-flow-node absolute top-[40%] -left-[2%] md:left-[0%] z-20">
        <FlowCard
          icon={<GitBranch className="w-3.5 h-3.5 text-cyan-300" />}
          label="Forward Chaining"
          accent="cyan"
        />
      </div>

      {/* Node: XGBoost — right middle */}
      <div className="hero-flow-node absolute top-[38%] -right-[2%] md:right-[0%] z-20">
        <FlowCard
          icon={<Cpu className="w-3.5 h-3.5 text-violet-300" />}
          label="XGBoost"
          accent="violet"
        />
      </div>

      {/* Node: Final Result — bottom center */}
      <div className="hero-node-final absolute bottom-[2%] left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/20 bg-slate-950/[0.60] backdrop-blur-xl px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Final Result
            </p>
            <p className="text-[9px] text-emerald-400/60">Legitimate Site</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-400/15 ml-1">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[8px] font-bold text-emerald-300 uppercase">
              Safe
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════ CONNECTION ARCS (SVG) ═══════════ */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
        viewBox="0 0 540 432"
        fill="none"
      >
        {/* URL → Shield arc */}
        <path
          d="M130 72 Q200 120, 240 170"
          stroke="url(#arcGrad1)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="hero-arc-path"
        />
        {/* Forward Chaining → Shield arc */}
        <path
          d="M60 200 Q140 190, 220 200"
          stroke="url(#arcGrad2)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="hero-arc-path"
          style={{ animationDelay: "0.3s" }}
        />
        {/* Shield → XGBoost arc */}
        <path
          d="M340 200 Q400 190, 470 195"
          stroke="url(#arcGrad3)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="hero-arc-path"
          style={{ animationDelay: "0.6s" }}
        />
        {/* Shield → Result arc */}
        <path
          d="M270 290 Q280 340, 270 390"
          stroke="url(#arcGrad4)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="hero-arc-path"
          style={{ animationDelay: "0.9s" }}
        />
        <defs>
          <linearGradient id="arcGrad1" x1="130" y1="72" x2="240" y2="170">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="arcGrad2" x1="60" y1="200" x2="220" y2="200">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="arcGrad3" x1="340" y1="200" x2="470" y2="195">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="arcGrad4" x1="270" y1="290" x2="270" y2="390">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>

      {/* ═══════════ FLOATING MINI CARDS ═══════════ */}
      <FloatingBadge
        className="hero-mini-card-a -right-2 top-[8%] md:-right-4"
        label="30/30"
        sublabel="Expert Rules"
        color="cyan"
      />
      <FloatingBadge
        className="hero-mini-card-b -left-3 bottom-[28%] md:-left-5"
        label="91"
        sublabel="ML Features"
        color="blue"
      />
      <FloatingBadge
        className="hero-mini-card-c right-[5%] bottom-[22%] md:right-[2%]"
        label="Live"
        sublabel="Real-time"
        color="teal"
      />
    </div>
  );
}

/* ─── Flow Card (orbit node) ─── */

function FlowCard({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent: "cyan" | "blue" | "violet";
}) {
  const styles = {
    cyan: {
      border: "border-cyan-400/15",
      bg: "bg-cyan-500/[0.06]",
      iconBg: "bg-cyan-500/10",
      text: "text-cyan-300",
    },
    blue: {
      border: "border-blue-400/15",
      bg: "bg-blue-500/[0.06]",
      iconBg: "bg-blue-500/10",
      text: "text-blue-300",
    },
    violet: {
      border: "border-violet-400/15",
      bg: "bg-violet-500/[0.06]",
      iconBg: "bg-violet-500/10",
      text: "text-violet-300",
    },
  }[accent];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border ${styles.border} ${styles.bg} bg-slate-950/[0.50] backdrop-blur-xl px-3.5 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]`}
    >
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-lg ${styles.iconBg}`}
      >
        {icon}
      </div>
      <span
        className={`font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${styles.text}`}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Floating Badge ─── */

function FloatingBadge({
  className,
  label,
  sublabel,
  color,
}: {
  className: string;
  label: string;
  sublabel: string;
  color: "cyan" | "violet" | "blue" | "teal";
}) {
  const styles = {
    cyan: {
      border: "border-cyan-400/15",
      text: "text-cyan-300",
      dot: "bg-cyan-400",
      glow: "shadow-[0_0_8px_rgba(34,211,238,0.15)]",
    },
    violet: {
      border: "border-violet-400/15",
      text: "text-violet-300",
      dot: "bg-violet-400",
      glow: "shadow-[0_0_8px_rgba(139,92,246,0.15)]",
    },
    blue: {
      border: "border-blue-400/15",
      text: "text-blue-300",
      dot: "bg-blue-400",
      glow: "shadow-[0_0_8px_rgba(59,130,246,0.15)]",
    },
    teal: {
      border: "border-teal-400/15",
      text: "text-teal-300",
      dot: "bg-teal-400",
      glow: "shadow-[0_0_8px_rgba(20,184,166,0.15)]",
    },
  }[color];

  return (
    <div
      aria-hidden="true"
      className={`hero-floating-card absolute z-20 min-w-[6.5rem] rounded-2xl border ${styles.border} ${styles.glow} bg-slate-950/[0.55] px-3 py-2 shadow-[0_14px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-wider ${styles.text}`}
        >
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-[9px] text-slate-500 font-medium">{sublabel}</p>
    </div>
  );
}
