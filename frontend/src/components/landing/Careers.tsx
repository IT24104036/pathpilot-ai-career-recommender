import {
  BarChart3,
  Database,
  BrainCircuit,
  Code,
  Briefcase,
  Palette,
  Shield,
  Cloud,
  Users,
} from "lucide-react";

const CAREERS = [
  {
    icon: BarChart3,
    title: "Data Analyst",
    desc: "Turn raw data into insight and strategy.",
    tag: "High demand",
    signal: "Data + decisions",
  },
  {
    icon: Database,
    title: "Data Scientist",
    desc: "Model data to predict and decide.",
    tag: "Data + ML",
    signal: "Statistics + AI",
  },
  {
    icon: BrainCircuit,
    title: "ML Engineer",
    desc: "Ship machine-learning into production.",
    tag: "Cutting edge",
    signal: "Models + systems",
  },
  {
    icon: Code,
    title: "Software Engineer",
    desc: "Build the products of tomorrow.",
    tag: "Remote-friendly",
    signal: "Code + architecture",
  },
  {
    icon: Briefcase,
    title: "Business Analyst",
    desc: "Bridge IT and business needs.",
    tag: "Versatile",
    signal: "Strategy + clarity",
  },
  {
    icon: Palette,
    title: "UI/UX Designer",
    desc: "Craft beautiful, intuitive experiences.",
    tag: "Creative",
    signal: "Design + empathy",
  },
  {
    icon: Shield,
    title: "Cybersecurity Analyst",
    desc: "Defend systems from digital threats.",
    tag: "In-demand",
    signal: "Security + focus",
  },
  {
    icon: Cloud,
    title: "Cloud / DevOps Engineer",
    desc: "Automate and scale infrastructure.",
    tag: "High growth",
    signal: "Cloud + automation",
  },
  {
    icon: Users,
    title: "Project Manager",
    desc: "Lead tech teams to deliver on time.",
    tag: "Leadership",
    signal: "People + delivery",
  },
];

export function Careers() {
  return (
    <section id="careers" className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-gold/10 blur-[130px]" />
      <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-semibold italic text-gold">05</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Career paths
            </span>
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            The IT roles PathPilot can <span className="italic text-primary">match you to</span>.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAREERS.map((c, i) => (
            <div
              key={c.title}
              className="group premium-panel relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-primary/15" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
              <div className="relative flex items-start justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/60 text-primary transition-all group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.tag}
                </span>
              </div>
              <h3 className="relative mt-5 font-display text-xl font-semibold tracking-tight">
                {c.title}
              </h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {c.desc}
              </p>
              <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {c.signal}
                </span>
                <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Match path
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
