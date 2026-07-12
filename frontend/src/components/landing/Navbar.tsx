import { Compass, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const links = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#careers", label: "Careers" },
  { href: "#how", label: "How It Works" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow text-primary-foreground transition-transform group-hover:rotate-12">
            <Compass className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
        </a>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/55 p-1 backdrop-blur md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Sign In — desktop */}
          <a
            href="/login"
            id="navbar-sign-in"
            className="hidden sm:inline-flex items-center rounded-full border border-border bg-background/50 text-foreground px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Sign In
          </a>

          {/* Start Free Assessment — desktop */}
          <a
            href="/assessment"
            id="navbar-start-assessment"
            className="hidden sm:inline-flex items-center rounded-full bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
          >
            Start Free Assessment
          </a>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden h-10 w-10 rounded-full border border-border flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            id="navbar-menu-toggle"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-card/95 backdrop-blur-xl animate-fade-up md:hidden">
          <nav className="px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              >
                {l.label}
              </a>
            ))}

            {/* Divider */}
            <div className="h-px bg-border my-1" />

            {/* Sign In */}
            <a
              href="/login"
              onClick={() => setOpen(false)}
              id="mobile-sign-in"
              className="inline-flex justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-accent transition-colors"
            >
              Sign In
            </a>

            {/* Start Free Assessment */}
            <a
              href="/assessment"
              onClick={() => setOpen(false)}
              id="mobile-start-assessment"
              className="inline-flex justify-center rounded-full bg-gradient-primary text-primary-foreground px-5 py-3 text-sm font-semibold shadow-glow"
            >
              Start Free Assessment
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
