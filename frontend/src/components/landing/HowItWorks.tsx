import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  LayoutDashboard,
  Map,
  Sparkles,
} from "lucide-react";
import { Fragment } from "react";

const STEPS = [
  {
    n: "01",
    icon: ClipboardCheck,
    title: "Assessment",
    desc: "Answer focused questions about your studies, skills, work style, and career interests.",
  },
  {
    n: "02",
    icon: BrainCircuit,
    title: "AI matching",
    desc: "PathPilot compares your profile against nine IT paths and ranks your strongest fits.",
  },
  {
    n: "03",
    icon: Map,
    title: "Career roadmap",
    desc: "See why a path fits, what skills to build next, and where to focus your portfolio.",
  },
  {
    n: "04",
    icon: LayoutDashboard,
    title: "Saved dashboard",
    desc: "Create an account to keep results, retake the assessment, and track your next steps.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden py-20 md:py-28 soft-section">
      <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-semibold italic text-gold">02</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              How PathPilot helps
            </span>
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            A guided journey from uncertainty to{" "}
            <span className="italic text-primary">career direction</span>.
          </h2>
        </div>

        {/* The journey strip */}
        <div className="mt-12 rounded-[2rem] premium-panel p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            {STEPS.map((step, index) => (
              <Fragment key={step.n}>
                <JourneyCard key={step.n} step={step} />
                {index < STEPS.length - 1 && (
                  <div
                    key={`${step.n}-arrow`}
                    className="flex items-center justify-center text-gold"
                  >
                    <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">Outcome:</span>
            matched career paths, explainable scores, suggested skills, and a dashboard you can
            revisit.
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Explainable", "See match scores and the reason behind your strongest career fit."],
            ["Actionable", "Turn a recommendation into skills, projects, and next steps."],
            ["Repeatable", "Retake the assessment as your confidence and skills evolve."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-[1.5rem] border border-border/70 bg-card/55 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <p className="font-display text-xl font-semibold tracking-tight">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ step }: { step: (typeof STEPS)[number] }) {
  const Icon = step.icon;
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/55 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-card/75">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-xl font-semibold italic text-gold">{step.n}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
    </div>
  );
}
