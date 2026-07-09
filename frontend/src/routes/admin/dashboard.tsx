import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  Award,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Radar,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import {
  fetchAdminAssessments,
  fetchAdminSummary,
  fetchAdminUsers,
  type AdminAssessmentRow,
  type AdminSummaryPayload,
  type AdminUserRow,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PathPilot Admin" }] }),
  component: AdminDashboard,
});

type TelemetryCard = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

type SourceCounts = {
  ml: number;
  mock: number;
  total: number;
};

function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummaryPayload | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [assessments, setAssessments] = useState<AdminAssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sideError, setSideError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([fetchAdminSummary(), fetchAdminUsers(), fetchAdminAssessments()])
      .then(([summaryResult, usersResult, assessmentsResult]) => {
        if (cancelled) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
          setError("");
        } else {
          setError(summaryResult.reason?.message || "Admin summary request failed.");
        }

        const sideErrors: string[] = [];
        if (usersResult.status === "fulfilled") {
          setUsers(usersResult.value);
        } else {
          setUsers([]);
          sideErrors.push(usersResult.reason?.message || "Could not load users.");
        }

        if (assessmentsResult.status === "fulfilled") {
          setAssessments(assessmentsResult.value);
        } else {
          setAssessments([]);
          sideErrors.push(assessmentsResult.reason?.message || "Could not load assessments.");
        }

        setSideError(sideErrors.join(" "));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const recentAssessments = summary?.recentAssessments ?? [];
  const allAssessmentRows = assessments.length > 0 ? assessments : recentAssessments;
  const recentUsers = users.slice(0, 5);
  const sourceCounts = getSourceCounts(allAssessmentRows);

  return (
    <div className="space-y-6 animate-fade-up">
      <MissionHero summary={summary} loading={loading} error={error} sourceCounts={sourceCounts} />

      {loading ? (
        <MissionLoading />
      ) : error || !summary ? (
        <MissionError message={error || "Admin summary is unavailable."} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {getTelemetryCards(summary.summaryStats).map((card) => (
                <TelemetryTile key={card.id} card={card} />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
              <ActivityStream assessments={recentAssessments} />
              <CareerDistribution distribution={summary.careerDistribution} />
            </section>
          </div>

          <aside className="space-y-6">
            <SignalPanel
              counts={sourceCounts}
              totalAssessments={summary.summaryStats.totalAssessments}
            />
            <SystemPanel sideError={sideError} />
            <OperatorRoster users={recentUsers} error={sideError} />
          </aside>
        </div>
      )}
    </div>
  );
}

function getTelemetryCards(summary: AdminSummaryPayload["summaryStats"]): TelemetryCard[] {
  return [
    {
      id: "users",
      label: "Users",
      value: summary.totalUsers,
      detail: "Registered accounts",
      icon: Users,
      accent: "from-violet-500 to-primary",
    },
    {
      id: "assessments",
      label: "Assessments",
      value: summary.totalAssessments,
      detail: "Saved scans",
      icon: ClipboardList,
      accent: "from-teal-500 to-emerald-500",
    },
    {
      id: "career",
      label: "Lead Career",
      value: summary.mostRecommendedCareer,
      detail: "Most recommended",
      icon: Award,
      accent: "from-gold to-amber-500",
    },
    {
      id: "score",
      label: "Avg Match",
      value: `${summary.averageMatchScore}%`,
      detail: "Across results",
      icon: Gauge,
      accent: "from-primary to-teal",
    },
  ];
}

function MissionHero({
  summary,
  loading,
  error,
  sourceCounts,
}: {
  summary: AdminSummaryPayload | null;
  loading: boolean;
  error: string;
  sourceCounts: SourceCounts;
}) {
  const topCareer = summary?.summaryStats.mostRecommendedCareer ?? "Awaiting signal";
  const totalAssessments = summary?.summaryStats.totalAssessments ?? 0;
  const mlPct =
    sourceCounts.total > 0 ? Math.round((sourceCounts.ml / sourceCounts.total) * 100) : 0;
  const status = error ? "Attention" : loading ? "Syncing" : "Operational";

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border/80 bg-card/80 p-6 shadow-card backdrop-blur-2xl sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklch,var(--color-primary)_18%,transparent),transparent_34%),radial-gradient(circle_at_80%_0%,color-mix(in_oklch,var(--color-teal)_18%,transparent),transparent_32%),linear-gradient(135deg,color-mix(in_oklch,var(--color-card)_88%,transparent),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-dots text-foreground/[0.04]" />
      <div className="pointer-events-none absolute -right-16 top-8 h-64 w-64 rounded-full border border-primary/20" />
      <div className="pointer-events-none absolute -right-4 top-20 h-40 w-40 rounded-full border border-teal/20" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <Radar className="h-3.5 w-3.5" />
            PathPilot Admin Mission Control
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
            Platform intelligence, live signals, and career trajectory in one view.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Monitor users, assessment traffic, ML prediction health, and the career paths emerging
            from real saved results.
          </p>

          <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroSignal label="Status" value={status} tone={error ? "warn" : "ok"} />
            <HeroSignal label="Lead path" value={topCareer} />
            <HeroSignal label="Scans" value={loading ? "..." : String(totalAssessments)} />
            <HeroSignal label="ML share" value={sourceCounts.total ? `${mlPct}%` : "--"} />
          </div>
        </div>

        <CommandOrb summary={summary} sourceCounts={sourceCounts} loading={loading} />
      </div>
    </section>
  );
}

function CommandOrb({
  summary,
  sourceCounts,
  loading,
}: {
  summary: AdminSummaryPayload | null;
  sourceCounts: SourceCounts;
  loading: boolean;
}) {
  const users = summary?.summaryStats.totalUsers ?? 0;
  const assessments = summary?.summaryStats.totalAssessments ?? 0;
  const avg = summary?.summaryStats.averageMatchScore ?? 0;

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-primary/15" />
      <div className="absolute inset-[9%] rounded-full border border-teal/20" />
      <div className="absolute inset-[18%] rounded-full border border-gold/20" />
      <div className="absolute h-[78%] w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute h-px w-[78%] bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
      <div className="absolute left-8 top-12 h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
      <div className="absolute right-12 top-24 h-2 w-2 rounded-full bg-teal" />
      <div className="absolute bottom-14 left-20 h-2 w-2 rounded-full bg-gold" />

      <div className="relative w-[68%] rounded-[2rem] border border-border/70 bg-background/70 p-5 text-center shadow-card backdrop-blur-xl">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <BrainCircuit className="h-6 w-6" />
        </span>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Intelligence Core
        </p>
        <p className="mt-2 font-display text-4xl font-bold tabular-nums">
          {loading ? "..." : `${avg}%`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">average match confidence</p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <OrbMetric label="Users" value={users} />
          <OrbMetric label="Scans" value={assessments} />
          <OrbMetric label="ML" value={sourceCounts.ml} />
        </div>
      </div>
    </div>
  );
}

function HeroSignal({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const dot = tone === "ok" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";

  return (
    <div className="rounded-2xl border border-border/70 bg-background/45 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}

function OrbMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-2">
      <p className="font-display text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function TelemetryTile({ card }: { card: TelemetryCard }) {
  const Icon = card.icon;

  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-border/80 bg-card/82 p-5 shadow-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/60 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-border/70 bg-background/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Live
        </span>
      </div>
      <p className="relative mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {card.label}
      </p>
      <p
        className={[
          "relative mt-2 font-display font-bold leading-tight tracking-tight",
          card.id === "career" ? "text-2xl" : "text-4xl",
        ].join(" ")}
      >
        {card.value}
      </p>
      <p className="relative mt-2 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
    </article>
  );
}

function ActivityStream({ assessments }: { assessments: AdminAssessmentRow[] }) {
  return (
    <section className="relative overflow-hidden rounded-[1.8rem] border border-border/80 bg-card/82 shadow-card backdrop-blur-xl">
      <PanelHeader
        icon={Activity}
        eyebrow="Live Activity"
        title="Assessment Signal Stream"
        copy="Recent platform scans from guests and registered users."
        action={`${assessments.length} latest`}
      />

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assessment activity yet"
          copy="Completed assessments will stream into this panel."
        />
      ) : (
        <div className="space-y-3 px-5 pb-5">
          {assessments.map((assessment, index) => (
            <AssessmentEvent key={assessment.id} assessment={assessment} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

function AssessmentEvent({ assessment, index }: { assessment: AdminAssessmentRow; index: number }) {
  return (
    <article className="group grid gap-4 rounded-2xl border border-border/65 bg-background/35 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background/55 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 sm:hidden">
          <p className="truncate font-semibold text-foreground">{assessment.studentName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(assessment.date)}</p>
        </div>
      </div>

      <div className="hidden min-w-0 sm:block">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{assessment.studentName}</p>
          <SourceBadge source={assessment.source} />
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {assessment.email || "Guest submission"} · {formatDate(assessment.date)}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex max-w-full rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <span className="truncate">{assessment.topCareer}</span>
          </span>
          <span
            className={`font-display text-2xl font-bold tabular-nums ${scoreClass(
              assessment.matchScore,
            )}`}
          >
            {assessment.matchScore}%
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-primary"
            style={{ width: `${Math.max(3, assessment.matchScore)}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function SignalPanel({
  counts,
  totalAssessments,
}: {
  counts: SourceCounts;
  totalAssessments: number;
}) {
  const mlPct = counts.total > 0 ? Math.round((counts.ml / counts.total) * 100) : 0;
  const mockPct = counts.total > 0 ? Math.round((counts.mock / counts.total) * 100) : 0;

  return (
    <section className="relative overflow-hidden rounded-[1.8rem] border border-border/80 bg-card/82 p-5 shadow-card backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-teal/15 blur-3xl" />
      <PanelTitle icon={Zap} eyebrow="ML Activity" title="Prediction Signal" />

      {counts.total === 0 ? (
        <EmptyState
          compact
          icon={Zap}
          title="No source signal"
          copy="ML/mock source activity appears once assessments are available."
        />
      ) : (
        <div className="relative mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <SignalStat label="ML" value={counts.ml} percent={mlPct} tone="ml" />
            <SignalStat label="Mock" value={counts.mock} percent={mockPct} tone="mock" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Source mix</span>
              <span>{counts.total} analyzed</span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-secondary">
              <div className="bg-teal-500" style={{ width: `${mlPct}%` }} />
              <div className="bg-amber-500" style={{ width: `${mockPct}%` }} />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Total stored assessments: {totalAssessments}. Source mix is computed from records loaded
            through the admin assessment endpoint.
          </p>
        </div>
      )}
    </section>
  );
}

function SignalStat({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: number;
  percent: number;
  tone: "ml" | "mock";
}) {
  const color = tone === "ml" ? "text-teal-500" : "text-amber-500";
  const bg = tone === "ml" ? "bg-teal-500/10" : "bg-amber-500/10";

  return (
    <div className={`rounded-2xl border border-border/60 ${bg} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{percent}% of loaded</p>
    </div>
  );
}

function CareerDistribution({
  distribution,
}: {
  distribution: AdminSummaryPayload["careerDistribution"];
}) {
  const visible = distribution.slice(0, 6);
  const max = Math.max(...visible.map((item) => item.count), 1);
  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  const leader = visible[0];

  return (
    <section className="rounded-[1.8rem] border border-border/80 bg-card/82 p-5 shadow-card backdrop-blur-xl">
      <PanelTitle icon={BarChart3} eyebrow="Career Distribution" title="Top Recommendations" />

      {visible.length === 0 ? (
        <EmptyState
          compact
          icon={BarChart3}
          title="No career signal yet"
          copy="Career distribution is calculated from saved assessments."
        />
      ) : (
        <div className="mt-5 space-y-4">
          {leader && (
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 p-4">
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Leading career signal
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-tight">
                    {leader.career}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {leader.count} of {total} saved recommendations
                  </p>
                </div>
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Award className="h-5 w-5" />
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {visible.map((item, index) => (
              <CareerDistributionRow
                key={item.career}
                item={item}
                rank={index + 1}
                max={max}
                total={total}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CareerDistributionRow({
  item,
  rank,
  max,
  total,
}: {
  item: { career: string; count: number };
  rank: number;
  max: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
  const width = Math.max(6, Math.round((item.count / max) * 100));
  const gradients = [
    "from-primary to-teal",
    "from-violet-500 to-primary",
    "from-gold to-amber-500",
    "from-sky-500 to-teal",
    "from-emerald-500 to-teal",
    "from-rose-500 to-gold",
  ];

  return (
    <article className="rounded-2xl border border-border/60 bg-background/35 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
            {rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.career}</p>
            <p className="text-xs text-muted-foreground">{percent}% of saved signals</p>
          </div>
        </div>
        <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold tabular-nums text-foreground">
          {item.count}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradients[(rank - 1) % gradients.length]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </article>
  );
}

function SystemPanel({ sideError }: { sideError: string }) {
  const items = [
    { label: "Admin route guard", ok: true },
    { label: "Mongo-backed data", ok: true },
    { label: "Side channels", ok: !sideError },
  ];

  return (
    <section className="rounded-[1.8rem] border border-border/80 bg-card/82 p-5 shadow-card backdrop-blur-xl">
      <PanelTitle icon={ShieldCheck} eyebrow="System Status" title="Control Integrity" />
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/35 px-3 py-2.5"
          >
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                item.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500",
              ].join(" ")}
            >
              <CheckCircle2 className="h-3 w-3" />
              {item.ok ? "Online" : "Check"}
            </span>
          </div>
        ))}
      </div>
      {sideError && <p className="mt-4 text-xs leading-relaxed text-amber-500">{sideError}</p>}
    </section>
  );
}

function OperatorRoster({ users, error }: { users: AdminUserRow[]; error: string }) {
  return (
    <section className="rounded-[1.8rem] border border-border/80 bg-card/82 p-5 shadow-card backdrop-blur-xl">
      <PanelTitle icon={UserRound} eyebrow="Operators" title="Recent Users" />

      {error && users.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-500">
          {error}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          compact
          icon={UserRound}
          title="No user signal"
          copy="Registered accounts will appear here."
        />
      ) : (
        <div className="mt-5 space-y-3">
          {users.map((user) => (
            <article
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/35 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                    user.role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground",
                  ].join(" ")}
                >
                  {user.role}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {user.assessmentsCompleted} scans
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SourceBadge({ source }: { source?: "ml" | "mock" }) {
  const meta = sourceMeta(source);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function PanelHeader({
  icon: Icon,
  eyebrow,
  title,
  copy,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  copy: string;
  action?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
        </div>
      </div>
      {action && (
        <span className="rounded-full border border-border/70 bg-background/45 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {action}
        </span>
      )}
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
  compact = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  copy: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/30 text-center",
        compact ? "mt-5 px-4 py-6" : "mx-5 mb-5 px-6 py-12",
      ].join(" ")}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}

function MissionError({ message }: { message: string }) {
  return (
    <section className="rounded-[1.8rem] border border-destructive/25 bg-destructive/10 p-6 text-destructive shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Mission feed unavailable
          </h2>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
          <p className="mt-3 text-xs opacity-80">
            Confirm the backend is running and the signed-in account still has admin access.
          </p>
        </div>
      </div>
    </section>
  );
}

function MissionLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonTile key={index} className="h-40" />
          ))}
        </section>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <SkeletonTile className="h-[520px]" />
          <SkeletonTile className="h-[520px]" />
        </section>
      </div>
      <div className="space-y-6">
        <SkeletonTile className="h-64" />
        <SkeletonTile className="h-56" />
        <SkeletonTile className="h-72" />
      </div>
    </div>
  );
}

function SkeletonTile({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.6rem] border border-border/80 bg-card/80 shadow-card backdrop-blur-xl ${className}`}
    >
      <div className="h-full w-full animate-shimmer opacity-60" />
    </div>
  );
}

function sourceMeta(source?: "ml" | "mock") {
  if (source === "ml") {
    return {
      label: "ML",
      dot: "bg-teal-500",
      badge: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    };
  }

  return {
    label: "Mock",
    dot: "bg-amber-500",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
}

function scoreClass(score: number): string {
  if (score >= 90) return "text-emerald-500";
  if (score >= 80) return "text-amber-500";
  return "text-muted-foreground";
}

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getSourceCounts(assessments: AdminAssessmentRow[]): SourceCounts {
  return assessments.reduce(
    (acc, assessment) => {
      if (assessment.source === "ml") acc.ml += 1;
      else acc.mock += 1;
      acc.total += 1;
      return acc;
    },
    { ml: 0, mock: 0, total: 0 },
  );
}
