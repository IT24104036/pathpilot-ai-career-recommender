import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  Compass,
  LayoutDashboard,
  User,
  LogOut,
  Moon,
  Sun,
  History,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { useTheme } from "@/hooks/use-theme";
import {
  clearUserSession,
  validateUserSession,
  fetchProgress,
  updateCareerProgress,
  type UserSession,
  type CareerProgress,
} from "@/lib/auth-api";
import {
  fetchMyAssessments,
  claimPendingAssessment,
  type SavedAssessment,
} from "@/lib/assessment-api";
import { buildDashboardModel, type DashboardModel } from "@/lib/dashboard-data";
import { careerChecklist } from "@/lib/roadmaps";
import { PathBackdrop } from "@/components/PathBackdrop";
import {
  BentoTile,
  TopMatchTile,
  SkillRadarTile,
  CompatibilityTile,
  AccountPlanTile,
  MomentumTile,
  NewAssessmentTile,
  InsightStrip,
} from "@/components/dashboard/bento";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PathPilot" },
      {
        name: "description",
        content:
          "Your personalized PathPilot career dashboard. Track your assessments, view career matches, and plan your roadmap.",
      },
    ],
  }),
  component: DashboardPage,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatDate(ts?: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fitLabel(score?: number): string {
  const value = Number(score ?? 0);
  if (value >= 95) return "Excellent fit";
  if (value >= 85) return "Strong fit";
  if (value >= 70) return "Good fit";
  if (value > 0) return "Emerging fit";
  return "Ready to scan";
}

function fitBadgeClass(score?: number): string {
  const value = Number(score ?? 0);
  if (value >= 95) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  if (value >= 85) return "border-primary/25 bg-primary/10 text-primary";
  if (value >= 70) return "border-gold/30 bg-gold/10 text-gold";
  if (value > 0) return "border-border/70 bg-background/50 text-muted-foreground";
  return "border-border/70 bg-background/50 text-muted-foreground";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [progress, setProgress] = useState<CareerProgress>({});

  // Allow deep-linking to a tab (e.g. /dashboard?tab=profile from the results page).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "overview" || requested === "profile") {
      setTab(requested as TabId);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    validateUserSession("user").then(async (s) => {
      if (cancelled) return;
      if (!s) {
        navigate({ to: "/login" });
        return;
      }
      setSession(s);

      // Save a pending guest assessment (if the user just signed up from results).
      await claimPendingAssessment();
      const [mine, prog] = await Promise.all([fetchMyAssessments(), fetchProgress()]);
      if (!cancelled) {
        setAssessments(mine);
        setProgress(prog);
        setDataLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    clearUserSession();
    navigate({ to: "/" });
  }

  // Toggle a roadmap checklist item for the current top career; persist to backend.
  function handleToggleTask(career: string, item: string) {
    setProgress((prev) => {
      const current = prev[career] ?? [];
      const next = current.includes(item) ? current.filter((t) => t !== item) : [...current, item];
      const updated = { ...prev, [career]: next };
      // Persist (fire-and-forget; UI already updated optimistically).
      updateCareerProgress(career, next);
      return updated;
    });
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const model = buildDashboardModel(assessments);
  const firstName = session.name.split(" ")[0];
  const roadmapItems = model.hasData ? careerChecklist(model.topCareer) : [];
  const completedSteps = model.hasData ? (progress[model.topCareer] ?? []) : [];
  const roadmapPct =
    roadmapItems.length > 0 ? Math.round((completedSteps.length / roadmapItems.length) * 100) : 0;
  const latestDate = model.hasData ? formatDate(model.latest?.timestamp) : "Not started";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="editorial relative isolate min-h-screen overflow-hidden bg-mesh text-foreground">
      <PathBackdrop tone="editorial" />
      {/* ── Slim editorial top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
          </Link>

          {/* Segmented tab nav */}
          <nav className="hidden items-center gap-1 rounded-2xl border border-border/50 bg-background/40 p-1 backdrop-blur md:flex">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  ].join(" ")}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/40 transition-colors hover:bg-accent"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {session.avatarUrl ? (
              <img
                src={session.avatarUrl}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover shadow-glow"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {session.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/40 transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile tab nav */}
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/60",
                ].join(" ")}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DashboardHero
          firstName={firstName}
          greeting={greeting}
          model={model}
          latestDate={latestDate}
          roadmapPct={roadmapPct}
          onProfile={() => setTab("profile")}
        />

        <div className="mb-10 mt-6">
          <InsightStrip text={model.insight} />
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" &&
          (!dataLoaded ? (
            <BentoSkeleton />
          ) : !model.hasData ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[180px]">
                <TopMatchTile career={model.topCareer} score={model.topScore} delay={0} />
                <SkillRadarTile data={model.radar} delay={60} />
                <CompatibilityTile ranked={model.ranked} delay={240} />
                <AccountPlanTile
                  career={model.topCareer}
                  completed={completedSteps}
                  steps={roadmapItems}
                  onProfile={() => setTab("profile")}
                  delay={300}
                />
                <NewAssessmentTile className="md:col-span-2" delay={360} />
                <MetricTile
                  label="Average match"
                  value={`${model.avgScore}%`}
                  detail={`Across ${model.count} assessment${model.count === 1 ? "" : "s"}`}
                  icon={BarChart3}
                  delay={390}
                />
                <MomentumTile data={model.momentum} trend={model.trend} delay={420} />
              </div>

              <ProgressTracker
                career={model.topCareer}
                items={roadmapItems}
                completed={completedSteps}
                onToggle={(item) => handleToggleTask(model.topCareer, item)}
              />

              <HistorySection assessments={assessments} />
            </div>
          ))}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <ProfilePanel
            session={session}
            onUpdated={(p) =>
              setSession((s) => (s ? { ...s, name: p.name, avatarUrl: p.avatarUrl } : s))
            }
            onDeleted={() => navigate({ to: "/" })}
          />
        )}
      </main>
    </div>
  );
}

function DashboardHero({
  firstName,
  greeting,
  model,
  latestDate,
  roadmapPct,
  onProfile,
}: {
  firstName: string;
  greeting: string;
  model: DashboardModel;
  latestDate: string;
  roadmapPct: number;
  onProfile: () => void;
}) {
  const hasData = model.hasData;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-6 shadow-card animate-fade-up sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-80" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Career Control Center
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {hasData
                ? `Your latest saved assessment points toward ${model.topCareer} with a ${model.topScore}% match. Keep refining your profile and roadmap from here.`
                : "Take your first assessment to unlock saved recommendations, top matches, roadmap progress, and your personal career history."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/assessment"
              id="btn-dashboard-hero-retake"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              {hasData ? "Retake assessment" : "Start assessment"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={onProfile}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/45 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent/60"
            >
              <User className="h-4 w-4 text-primary" />
              View profile
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/55 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Latest recommendation
            </p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {hasData ? "Saved to profile" : "Awaiting scan"}
            </span>
          </div>

          <div className="mt-8">
            <p className="font-display text-3xl font-semibold leading-tight">
              {hasData ? model.topCareer : "No result yet"}
            </p>
            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-6xl font-semibold tabular-nums">
                {hasData ? model.topScore : 0}
              </span>
              <span className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                match
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                style={{ width: `${hasData ? model.topScore : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <HeroStat icon={CalendarDays} label="Last scan" value={latestDate} />
            <HeroStat icon={CheckCircle2} label="Roadmap" value={`${roadmapPct}% done`} />
            <HeroStat icon={BarChart3} label="Assessments" value={`${model.count} saved`} />
            <HeroStat
              icon={Trophy}
              label="Avg match"
              value={hasData ? `${model.avgScore}%` : "—"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  delay?: number;
}) {
  return (
    <BentoTile className="flex flex-col justify-between" delay={delay} interactive>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="h-2 w-2 rounded-full bg-gold" />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{value}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </BentoTile>
  );
}

// ── Recent assessment history ─────────────────────────────────────────────────
function HistorySection({ assessments }: { assessments: SavedAssessment[] }) {
  const rows = assessments.slice(0, 8);
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/95 shadow-card animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Assessment history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your saved recommendations, newest first.
            </p>
          </div>
        </div>
        <Link
          to="/assessment"
          className="group inline-flex items-center gap-2 rounded-full border border-border/80 px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/60"
        >
          Retake
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          No saved assessments yet. Complete an assessment to start your history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/25">
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Top career
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Fit
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Match
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((a, i) => (
                <tr key={a.id ?? i} className="transition-colors hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {formatDate(a.timestamp)}
                  </td>
                  <td className="px-6 py-4 font-medium">{a.topCareer || a.prediction}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${fitBadgeClass(
                        a.topScore,
                      )}`}
                    >
                      {fitLabel(a.topScore)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-display text-lg font-semibold tabular-nums">
                    {a.topScore}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton (bento-shaped) ───────────────────────────────────────────
function BentoSkeleton() {
  const spans = [
    "sm:col-span-2 md:col-span-2 md:row-span-2",
    "md:col-span-2 md:row-span-3",
    "md:col-span-2 md:row-span-2",
    "md:col-span-2 md:row-span-2",
    "md:col-span-2",
    "",
    "",
  ];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[180px]">
      {spans.map((s, i) => (
        <div
          key={i}
          className={`overflow-hidden rounded-[1.75rem] border border-border bg-card ${s}`}
        >
          <div className="h-full min-h-[140px] w-full animate-shimmer opacity-50" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <BentoTile className="py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="text-center lg:text-left">
          <span className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow animate-pulse-glow lg:mx-0">
            <Compass className="h-10 w-10" strokeWidth={2} />
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Build your saved career dashboard
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Complete an assessment to unlock your recommendation, top career matches, roadmap, and
            saved result history.
          </p>
          <Link
            to="/assessment"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Start your first assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Recommendation", "Your best-fit career path"],
            ["Top matches", "Ranked alternatives from your result"],
            ["Roadmap", "Checklist progress saved to your account"],
            ["History", "Every logged-in assessment in one place"],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-2xl border border-border/70 bg-background/45 p-4 text-left"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </BentoTile>
  );
}
