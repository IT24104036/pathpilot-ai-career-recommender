import { HelpCircle, Layers, Compass } from "lucide-react";

const PAINS = [
  {
    icon: Layers,
    title: "So many tech roles",
    desc: "Data, software, cloud, security, design, ML… which IT path is actually right for you?",
  },
  {
    icon: HelpCircle,
    title: "Generic advice",
    desc: "“Just learn to code” doesn't tell you whether you'd thrive as an analyst or an engineer.",
  },
  {
    icon: Compass,
    title: "No clear direction",
    desc: "You're graduating in CS — but still unsure which tech career to commit to.",
  },
];

export function Problem() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-x-8 top-1/3 h-48 rounded-full bg-gold/10 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-semibold italic text-gold">01</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              The problem
            </span>
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Most IT students are <span className="italic text-primary">unsure</span> which tech role
            fits them.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <div
              key={p.title}
              className="group premium-panel rounded-[1.5rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
              style={{ marginTop: i === 1 ? "0" : undefined }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 text-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
