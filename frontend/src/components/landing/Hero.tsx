import {
  ArrowRight,
  Sparkles,
  Award,
  BrainCircuit,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Route,
} from "lucide-react";

const MATCHES = [
  { title: "UI/UX Designer", score: 94, lead: true },
  { title: "Business Analyst", score: 86, lead: false },
  { title: "Data Analyst", score: 78, lead: false },
];

const SIGNALS = [
  { label: "Design", value: "92" },
  { label: "Communication", value: "88" },
  { label: "Analysis", value: "81" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-x-6 top-10 h-64 rounded-full bg-primary/10 blur-[120px] md:inset-x-24" />
      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 md:pb-32 md:pt-24 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Left: copy ── */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI career navigator for IT students
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Navigate your
            <br />
            best-fit <span className="italic text-primary">tech career</span>.
          </h1>
          <div className="mt-5 h-px w-20 bg-gold" />

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            PathPilot turns your skills, interests, and work style into explainable career matches,
            a focused roadmap, and a saved dashboard you can keep refining.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="/assessment"
              id="hero-start-assessment"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              Start Free Assessment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/55 px-6 py-3.5 text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              Explore the journey
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["9", "IT career paths"],
              ["5 min", "guided quiz"],
              ["100%", "free MVP"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/70 bg-card/55 px-4 py-3 backdrop-blur"
              >
                <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: AI navigator preview ── */}
        <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
          {/* ambient glow */}
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-gold/15 blur-2xl" />

          {/* drifting chips */}
          <div className="absolute -left-4 top-8 z-10 hidden rounded-2xl border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold shadow-card backdrop-blur sm:flex sm:items-center sm:gap-2 animate-float-slow">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Student profile scanned
          </div>
          <div className="absolute -right-3 bottom-10 z-10 hidden rounded-2xl border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold shadow-card backdrop-blur sm:flex sm:items-center sm:gap-2 animate-float-medium">
            <Route className="h-3.5 w-3.5 text-gold" />
            Roadmap ready
          </div>

          {/* the match card */}
          <div className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-card">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="absolute -right-12 top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <BrainCircuit className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Career Control Preview</p>
                  <p className="text-[11px] text-muted-foreground">AI match + roadmap snapshot</p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Demo view
              </span>
            </div>

            <div className="relative mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/55 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Best match
                  </span>
                  <Award className="h-4 w-4 text-gold" />
                </div>
                <p className="mt-4 font-display text-3xl font-semibold leading-tight">
                  UI/UX Designer
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-6xl font-semibold tabular-nums">94</span>
                  <span className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    match
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-secondary">
                  <div className="h-full w-[94%] rounded-full bg-gradient-primary" />
                </div>
              </div>

              <div className="space-y-3">
                {MATCHES.map((m, index) => (
                  <div
                    key={m.title}
                    className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        {m.title}
                      </span>
                      <span className="font-display font-semibold tabular-nums">{m.score}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={
                          m.lead
                            ? "h-full rounded-full bg-gold"
                            : "h-full rounded-full bg-primary/45"
                        }
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
              {SIGNALS.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-2xl border border-border/70 bg-background/45 px-3 py-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {signal.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold">{signal.value}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-4 rounded-2xl border border-border bg-background/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-semibold text-primary">
                <Compass className="h-3.5 w-3.5" />
                AI recommendation
              </div>
              Your answers show strong visual problem-solving, communication, and user empathy.
              Start with Figma fundamentals, UX research, and a portfolio case study.
            </div>

            <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              Saved dashboard · top matches · next skills · progress roadmap
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
