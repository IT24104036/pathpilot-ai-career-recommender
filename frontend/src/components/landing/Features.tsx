import {
  Brain,
  Target,
  Sparkles,
  GraduationCap,
  LayoutDashboard,
  Route,
  ShieldCheck,
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-20 md:py-28 soft-section">
      <div className="absolute inset-x-10 top-1/2 h-56 rounded-full bg-teal/10 blur-[130px]" />
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-semibold italic text-gold">04</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Features
            </span>
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Everything you need to <span className="italic text-primary">choose wisely</span>.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-4 md:auto-rows-[210px]">
          {/* Featured — Career matching */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-gradient-primary p-7 text-primary-foreground shadow-glow md:col-span-2 md:row-span-2">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="relative">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Explainable AI Career Matching
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary-foreground/85">
                Get ranked career paths with percentages, reasons, and a recommendation that feels
                understandable instead of mysterious.
              </p>
            </div>
          </div>

          {/* Skills assessment — wide */}
          <FeatureTile
            icon={Target}
            title="Student-first assessment"
            desc="Capture academic background, technical comfort, interests, and work style in a calm guided flow."
            className="md:col-span-2"
          />

          {/* Personality analysis */}
          <FeatureTile
            icon={Brain}
            title="Signal-based profile"
            desc="Translate your answers into skill signals like data, design, cloud, security, and leadership."
          />

          {/* Learning suggestions */}
          <FeatureTile
            icon={GraduationCap}
            title="Next-skill guidance"
            desc="Move from a recommendation to practical skills, projects, and portfolio direction."
          />

          <FeatureTile
            icon={Route}
            title="Roadmap checklist"
            desc="Logged-in users can turn their top career path into trackable next steps."
          />

          <FeatureTile
            icon={LayoutDashboard}
            title="Career dashboard"
            desc="Save results, compare retakes, and manage your profile from one control center."
            className="md:col-span-2"
          />

          <FeatureTile
            icon={ShieldCheck}
            title="Guest-friendly"
            desc="Try the assessment first, then create an account only when you want to save progress."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  desc,
  className = "",
}: {
  icon: typeof Brain;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div
      className={`group flex flex-col justify-between rounded-[1.75rem] premium-panel p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${className}`}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 text-primary transition-transform group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-5">
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
