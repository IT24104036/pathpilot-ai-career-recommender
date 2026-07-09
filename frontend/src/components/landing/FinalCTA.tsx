import {
  ArrowRight,
  Compass,
  Github,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Route,
  Sparkles,
  Twitter,
} from "lucide-react";

export function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-x-8 top-10 h-64 rounded-full bg-primary/10 blur-[130px]" />
      <div className="mx-auto max-w-5xl px-6 relative">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 text-background shadow-card md:p-14 lg:p-16">
          {/* ambient mesh */}
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute inset-0 bg-dots text-background/[0.04]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-background/20">
                <Compass className="h-6 w-6 animate-float-slow" />
              </span>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-6xl">
                Find your direction before you choose your stack.
              </h2>
              <div className="mx-auto mt-5 h-px w-16 bg-gold lg:mx-0" />
              <p className="mx-auto mt-5 max-w-xl text-lg text-background/70 lg:mx-0">
                Take the free assessment, get an explainable career match, and turn uncertainty into
                a roadmap you can act on.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <a
                  href="/assessment"
                  id="final-cta-start-assessment"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
                >
                  Start Free Assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#careers"
                  className="inline-flex items-center gap-2 rounded-full border border-background/20 px-8 py-4 text-base font-semibold text-background/85 transition-colors hover:bg-background/10"
                >
                  Browse career paths
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-background/20 bg-background/10 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                What unlocks next
              </p>
              <div className="mt-5 space-y-3">
                {[
                  {
                    icon: Sparkles,
                    title: "AI match",
                    desc: "Ranked career paths with match percentages.",
                  },
                  {
                    icon: Route,
                    title: "Roadmap",
                    desc: "Skills and projects to build next.",
                  },
                  {
                    icon: LayoutDashboard,
                    title: "Dashboard",
                    desc: "Save results and track your progress.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-background/10 bg-background/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-background/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-background">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-background/70">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative mt-24 border-t border-border/70 bg-card/35 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <a href="#home" className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow text-primary-foreground">
                  <Compass className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
              </a>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                Find Your Perfect Career Path with AI.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {[
                  { Icon: Linkedin, label: "LinkedIn" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Github, label: "GitHub" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/40 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                {
                  title: "Product",
                  links: [
                    { label: "Features", href: "#features" },
                    { label: "How it Works", href: "#how" },
                    { label: "Careers", href: "#careers" },
                    { label: "Pricing", href: "#" },
                  ],
                },
                {
                  title: "Company",
                  links: [
                    { label: "About Us", href: "#" },
                    { label: "Our Story", href: "#" },
                    { label: "Blog", href: "#" },
                  ],
                },
                {
                  title: "Resources",
                  links: [
                    { label: "Career Guides", href: "#" },
                    { label: "FAQ", href: "#" },
                    { label: "Support", href: "#" },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">
                    {col.title}
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 PathPilot. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
