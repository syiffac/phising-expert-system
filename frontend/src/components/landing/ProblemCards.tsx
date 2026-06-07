import { AlertTriangle, Fingerprint, Workflow } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import GlassCard from "@/components/ui-custom/GlassCard";

const cards = [
  {
    title: "What is Phishing?",
    body: "Phishing websites impersonate trusted services to steal passwords, OTP codes, banking data, or personal information.",
    icon: Fingerprint,
    tone: "text-cyan-200",
  },
  {
    title: "Why It Matters",
    body: "A single fake login page can lead to account takeover, financial loss, or identity theft.",
    icon: AlertTriangle,
    tone: "text-amber-200",
  },
  {
    title: "How PhishGuard Works",
    body: "The system extracts F01-F30 facts, evaluates expert rules using forward chaining, then validates the result using optimized machine learning.",
    icon: Workflow,
    tone: "text-teal-200",
  },
];

interface ProblemCardsProps {
  observeReady?: boolean;
}

export default function ProblemCards({
  observeReady = true,
}: ProblemCardsProps) {
  return (
    <section className="border-y border-white/10 bg-transparent px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal observe={observeReady}>
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
              Phishing Intelligence
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Risk signals explained before the model speaks
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              PhishGuard keeps the rule base visible so the detection process is
              explainable during demos, audits, and academic review.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(({ body, icon: Icon, title, tone }, index) => (
            <Reveal delay={index * 0.08} key={title} observe={observeReady}>
              <GlassCard className="h-full p-6">
                <div className="flex h-full flex-col">
                  <span className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Icon className={`h-5 w-5 ${tone}`} />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-slate-50">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{body}</p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
