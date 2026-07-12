// ─── auth-layout.tsx ──────────────────────────────────────────────────────────
// Editorial split-screen shell for the sign-in / sign-up pages.
// Left: an espresso "brand" panel with generated SVG route + compass artwork.
// Right: the form, on warm ivory. Reusable across login & register.

import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const GOLD = "#C9A86A";
const CYAN = "#5BCAD6";
const IVORY = "#FAF7F0";

// Generated, on-brand decorative artwork: a meandering "flight path" with
// waypoints + a compass rose. Pure SVG — no external image dependencies.
function RouteArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* faint topographic contour lines */}
      <g stroke={IVORY} strokeOpacity="0.05" fill="none" strokeWidth="1">
        {[120, 220, 320, 420, 520, 620, 720, 820].map((y) => (
          <path key={y} d={`M-20 ${y} C 150 ${y - 60}, 450 ${y + 60}, 620 ${y - 20}`} />
        ))}
      </g>

      {/* compass rose, top-right */}
      <g transform="translate(470 150)" stroke={GOLD} fill="none">
        <circle r="92" strokeOpacity="0.25" strokeWidth="1" />
        <circle r="66" strokeOpacity="0.35" strokeWidth="1" />
        <circle r="40" strokeOpacity="0.5" strokeWidth="1" />
        <g strokeOpacity="0.4" strokeWidth="1">
          <line x1="0" y1="-104" x2="0" y2="104" />
          <line x1="-104" y1="0" x2="104" y2="0" />
          <line x1="-74" y1="-74" x2="74" y2="74" />
          <line x1="74" y1="-74" x2="-74" y2="74" />
        </g>
        <path d="M0 -50 L 12 0 L 0 50 L -12 0 Z" fill={GOLD} fillOpacity="0.25" stroke="none" />
      </g>

      {/* the flight path */}
      <path
        d="M70 800 C 180 700, 120 560, 260 500 S 470 420, 380 300 S 220 180, 430 90"
        fill="none"
        stroke={CYAN}
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      {/* waypoints */}
      {[
        [70, 800],
        [260, 500],
        [380, 300],
        [430, 90],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="6" fill="none" stroke={GOLD} strokeOpacity="0.7" />
          <circle cx={cx} cy={cy} r="2.5" fill={i === 3 ? CYAN : GOLD} />
        </g>
      ))}
    </svg>
  );
}

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
  asideHeadline,
  asideSub,
  asideExtra,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  asideHeadline: ReactNode;
  asideSub: string;
  asideExtra?: ReactNode;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div className="editorial min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-2">
      {/* ── Left: editorial brand panel ── */}
      <aside className="relative hidden overflow-hidden bg-[#35271f] text-[#FAF7F0] dark:bg-[#15120f] dark:text-[#FAF7F0] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <RouteArt />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2 w-fit">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#FAF7F0]/20">
            <Compass className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-tight">PathPilot</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="mb-5 h-px w-14" style={{ backgroundColor: GOLD }} />
          <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            {asideHeadline}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#FAF7F0]/70">{asideSub}</p>
          {asideExtra && <div className="mt-8">{asideExtra}</div>}
        </div>

        <p
          className="relative z-10 text-[11px] font-medium uppercase tracking-[0.28em]"
          style={{ color: GOLD }}
        >
          Luxury career guidance · powered by AI
        </p>
      </aside>

      {/* ── Right: form ── */}
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-mesh px-5 py-8 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.025] dark:opacity-[0.045]" />
        <div className="pointer-events-none absolute right-8 top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="pointer-events-none absolute bottom-8 left-10 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />

        {/* Mobile / top wordmark + back link */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Compass className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base tracking-tight">PathPilot</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-foreground shadow-card transition-colors hover:bg-accent"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-card backdrop-blur transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back home
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm animate-fade-up">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-3 h-px w-12 bg-gold" />
            <p className="mt-4 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Shared editorial field styles for the auth forms.
export const fieldInput =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export const fieldLabel =
  "block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2";

export const submitButton =
  "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100";
