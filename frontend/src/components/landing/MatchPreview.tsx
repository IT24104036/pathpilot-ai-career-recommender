import {
  Sparkles,
  Award,
  Check,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Route,
} from "lucide-react";

const MATCHES = [
  { title: "Data Analyst", score: 91, lead: true },
  { title: "Business Analyst", score: 84, lead: false },
  { title: "Cloud / DevOps Engineer", score: 76, lead: false },
];

const REASONS = [
  "Enjoys data patterns",
  "Comfortable with SQL-style logic",
  "Prefers clear evidence",
];
const SKILLS = ["SQL", "Python basics", "Power BI", "Portfolio dashboard"];

export function MatchPreview() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-6rem] top-28 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
      <div className="absolute right-[-8rem] bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-[130px]" />
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-semibold italic text-gold">03</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              What you'll get
            </span>
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            A sample AI result that feels like a{" "}
            <span className="italic text-primary">career cockpit</span>.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {/* Match card */}
          <div className="glass relative overflow-hidden rounded-[2rem] p-7 shadow-card lg:col-span-7">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <BrainCircuit className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">AI recommendation snapshot</p>
                  <p className="text-[11px] text-muted-foreground">Ranked by fit and next action</p>
                </div>
              </div>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Explainable result
              </span>
            </div>

            <div className="relative mt-7 rounded-[1.5rem] border border-border/70 bg-background/55 p-5">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Strongest path
                  </p>
                  <h3 className="mt-2 font-display text-4xl font-semibold tracking-tight">
                    Data Analyst
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Best for students who like patterns, structured thinking, and turning messy
                    information into decisions.
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-6xl font-semibold tabular-nums">91</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    match
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 space-y-4">
              {MATCHES.map((m) => (
                <div key={m.title}>
                  <div className="mb-1.5 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {m.title}
                      {m.lead && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                          <Award className="h-2.5 w-2.5" /> Best match
                        </span>
                      )}
                    </span>
                    <span className="font-display text-lg font-semibold tabular-nums">
                      {m.score}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary/80">
                    <div
                      className={
                        m.lead
                          ? "h-full rounded-full bg-gradient-primary"
                          : "h-full rounded-full bg-foreground/30"
                      }
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why + skills */}
          <div className="grid gap-5 lg:col-span-5">
            <div className="rounded-[2rem] premium-panel p-7">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Why this match
                </p>
              </div>
              <ul className="mt-5 space-y-3">
                {REASONS.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] premium-panel p-7">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Skills to build
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
                  <Route className="h-4 w-4 text-gold" />
                  <p className="mt-2 text-sm font-semibold">Next roadmap step</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Build one dashboard project with a public case study.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Saved dashboard</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Track retakes, history, and progress after signup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
