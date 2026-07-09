import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Compass,
  Moon,
  Sun,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Award,
  RefreshCw,
  Lock,
  Star,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { type CareerMeta, metaFor, rankCareers } from "@/lib/careers";
import { markAssessmentForSave } from "@/lib/assessment-api";
import { getUserSession, type UserSession } from "@/lib/auth-api";
import { LayoutDashboard, User } from "lucide-react";
import { PathBackdrop } from "@/components/PathBackdrop";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your Career Results — PathPilot" },
      {
        name: "description",
        content:
          "View your AI-powered career recommendations tailored to your skills, interests, and personality.",
      },
    ],
  }),
  component: ResultsPage,
});

// ─── Results display model ────────────────────────────────────────────────────
// The *ranking and match scores* come from the backend (POST /api/assess);
// per-career copy comes from the shared CAREER_META catalog (lib/careers.ts).

interface DisplayCareer extends CareerMeta {
  rank: number;
  title: string;
  matchScore: number;
}

// Build the ranked card list from the backend's real matchScores.
// Returns [] when there is no real result — we never show fake/default data.
function buildCareers(matchScores?: Record<string, number>): DisplayCareer[] {
  if (!matchScores || Object.keys(matchScores).length === 0) return [];

  return rankCareers(matchScores).map((c, i) => ({
    rank: i + 1,
    title: c.title,
    matchScore: c.score,
    ...metaFor(c.title),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

function ResultsPage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  const [careers, setCareers] = useState<DisplayCareer[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [source, setSource] = useState<"ml" | "mock" | null>(null);
  // null = not yet read (SSR / first paint); true/false once we've checked storage.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Auth state drives the bottom CTA (guest vs. logged-in).
    setSession(getUserSession());

    // Use ONLY the real recommendation returned by the backend (POST /api/assess).
    // If it's missing, we render a friendly no-result state — never fake data.
    try {
      const raw = sessionStorage.getItem("assessmentResult");
      if (raw) {
        const result = JSON.parse(raw) as {
          matchScores?: Record<string, number>;
          suggestedSkills?: string[];
          source?: "ml" | "mock";
        };
        setCareers(buildCareers(result.matchScores));
        if (Array.isArray(result.suggestedSkills)) setSuggestedSkills(result.suggestedSkills);
        if (result.source) {
          setSource(result.source);
          // Always log so you can confirm ML vs mock from the browser console.
          console.log(
            `%c[PathPilot] recommendation source: ${result.source.toUpperCase()}`,
            `color:${result.source === "ml" ? "#16B5C4" : "#e0a000"};font-weight:bold`,
          );
        }
      }
    } catch {
      /* no valid result -> no-result state */
    } finally {
      setChecked(true);
    }
  }, []);

  const hasResult = careers.length > 0;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-mesh text-foreground flex flex-col">
      <PathBackdrop />
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow text-primary-foreground transition-transform group-hover:rotate-12">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/assessment" })}
              id="btn-retake"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background/50 text-foreground px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retake
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-all"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 py-12 px-4">
        <div className="mx-auto max-w-4xl">
          {!checked ? (
            /* Reading storage on the client — brief, avoids any flash of fake data. */
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : !hasResult ? (
            /* No real result in sessionStorage — show a friendly no-result state. */
            <div className="min-h-[50vh] flex flex-col items-center justify-center rounded-[2rem] border border-border/70 bg-card/80 p-8 text-center shadow-card backdrop-blur-xl animate-fade-up">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <Compass className="h-8 w-8" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                No assessment result found. Please take the assessment first.
              </h1>
              <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                Start a new assessment to see your personalized career matches.
              </p>
              <Link
                to="/assessment"
                id="btn-start-assessment-noresult"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
              >
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* ── Hero banner ── */}
              <div className="text-center mb-12 animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  AI Analysis Complete
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Your Top Career <span className="text-gradient-primary">Matches</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Based on your skills, interests, and personality, our AI identified your best-fit
                  career paths.
                </p>
                {/* Dev-only: shows whether this result came from the ML model or the mock fallback. */}
                {import.meta.env.DEV && source && (
                  <div
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      source === "ml"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    dev · source: {source.toUpperCase()}
                  </div>
                )}
              </div>

              {/* ── Career Cards ── */}
              <div className="space-y-4 mb-16">
                {careers.map((career, idx) => {
                  const isExpanded = expandedCard === idx;
                  return (
                    <div
                      key={career.rank}
                      className={[
                        "rounded-2xl border bg-card/90 shadow-card backdrop-blur transition-all duration-300 overflow-hidden",
                        isExpanded
                          ? "border-primary/40 shadow-glow"
                          : "border-border hover:border-primary/20",
                      ].join(" ")}
                    >
                      {/* Card header */}
                      <button
                        id={`career-card-${career.rank}`}
                        onClick={() => setExpandedCard(isExpanded ? null : idx)}
                        className="w-full flex items-center gap-5 p-6 text-left"
                      >
                        {/* Rank badge */}
                        <div
                          className={`hidden sm:flex flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br ${career.color} items-center justify-center text-white font-display font-bold text-xl shadow-md`}
                        >
                          #{career.rank}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="sm:hidden text-xs font-semibold text-muted-foreground">
                                  #{career.rank}
                                </span>
                                {career.rank === 1 && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <Award className="h-3 w-3" />
                                    Best Match
                                  </span>
                                )}
                              </div>
                              <h2 className="text-xl font-bold">{career.title}</h2>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {career.description}
                              </p>
                            </div>

                            {/* Match score */}
                            <div className="flex-shrink-0 text-center">
                              <div
                                className={`text-3xl font-display font-bold bg-gradient-to-br ${career.color} bg-clip-text text-transparent`}
                              >
                                {career.matchScore}%
                              </div>
                              <div className="text-xs text-muted-foreground">match</div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {career.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <TrendingUp
                          className={[
                            "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                            isExpanded ? "rotate-90 text-primary" : "text-muted-foreground",
                          ].join(" ")}
                        />
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-border/60 pt-5 animate-fade-up">
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Salary Range
                              </p>
                              <p className="text-2xl font-display font-bold text-foreground">
                                {career.salaryRange}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                per year (US average)
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Your Roadmap
                              </p>
                              <ol className="space-y-2">
                                {career.roadmap.map((step, i) => (
                                  <li key={step} className="flex items-start gap-2 text-sm">
                                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                                      {i + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Suggested skills (mock — later from ML service) ── */}
              {suggestedSkills.length > 0 && (
                <div className="mb-16 rounded-3xl premium-panel p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-xl font-bold tracking-tight">
                      Suggested skills to build
                    </h2>
                  </div>
                  <p className="mb-5 text-sm text-muted-foreground">
                    Focus areas to strengthen your fit for {careers[0]?.title}.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {suggestedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-secondary/40 px-4 py-1.5 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Bottom CTA — depends on auth state ── */}
              {session ? (
                /* Logged-in: result is already saved to the account. */
                <div className="relative rounded-3xl border border-border/60 bg-card/90 overflow-hidden shadow-card backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal/5 pointer-events-none" />

                  <div className="relative px-8 py-12 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow text-primary-foreground mx-auto mb-6">
                      <Bookmark className="h-7 w-7" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                      Saved to your account
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                      This result has been added to your assessment history. Track your career
                      progress anytime from your dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/dashboard"
                        id="btn-view-dashboard"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        View Dashboard
                      </Link>
                      <a
                        href="/dashboard?tab=profile"
                        id="btn-go-to-profile"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 text-foreground px-8 py-3.5 text-sm font-semibold hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Go to Profile
                      </a>
                    </div>

                    <p className="mt-5 text-xs text-muted-foreground">
                      Signed in as {session.name} · your assessment history is up to date
                    </p>
                  </div>
                </div>
              ) : (
                /* Guest: prompt to create an account / sign in (unchanged). */
                <div className="relative rounded-3xl border border-border/60 bg-card/90 overflow-hidden shadow-card backdrop-blur">
                  {/* Gradient glow bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal/5 pointer-events-none" />

                  <div className="relative px-8 py-12 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow text-primary-foreground mx-auto mb-6">
                      <Bookmark className="h-7 w-7" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                      Save Your Results & Track Your Journey
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                      Create a free account to save these results, view your assessment history, and
                      access your personalized career dashboard.
                    </p>

                    {/* Locked features */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                      {[
                        "Save Results",
                        "Assessment History",
                        "Career Dashboard",
                        "Progress Tracking",
                      ].map((f) => (
                        <div
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
                        >
                          <Lock className="h-3 w-3" />
                          {f}
                        </div>
                      ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/register"
                        id="btn-create-account"
                        onClick={markAssessmentForSave}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-glow hover:scale-105 transition-transform animate-pulse-glow"
                      >
                        Create Free Account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/login"
                        id="btn-sign-in-results"
                        onClick={markAssessmentForSave}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 text-foreground px-8 py-3.5 text-sm font-semibold hover:bg-accent transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>

                    <p className="mt-5 text-xs text-muted-foreground">
                      No credit card required · Free forever
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
