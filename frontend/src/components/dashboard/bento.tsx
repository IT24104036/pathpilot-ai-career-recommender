// ─── bento.tsx ────────────────────────────────────────────────────────────────
// Editorial-luxury tiles for the PathPilot Overview dashboard.
// Ivory panels · espresso type · antique-gold accents (decoration) · cyan
// (interaction). Data comes from the caller (lib/dashboard-data.ts).

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowRight,
  Compass,
  Award,
  CheckCircle2,
  Target,
  UserRound,
} from "lucide-react";
import { metaFor } from "@/lib/careers";
import type { RadarPoint, MomentumPoint } from "@/lib/dashboard-data";

// Editorial palette (concrete values for SVG/recharts which can't read CSS vars).
const CYAN = "#16B5C4";
const CYAN_SOFT = "#5BCAD6";
const GOLD = "#C9A86A";
const HAIRLINE = "rgba(58,46,41,0.14)";

// ── Generic editorial panel ───────────────────────────────────────────────────
export function BentoTile({
  children,
  className = "",
  delay = 0,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  interactive?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/90 p-7 shadow-card backdrop-blur-xl animate-fade-up",
        interactive ? "transition-all duration-500 hover:-translate-y-0.5 hover:shadow-glow" : "",
        className,
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Editorial eyebrow label, optionally with a magazine-style numeral + gold tick.
function Eyebrow({ children, numeral }: { children: ReactNode; numeral?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {numeral && (
        <span className="font-display text-sm font-semibold italic text-gold">{numeral}</span>
      )}
      <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

// ── Animated match ring (cyan stroke on a hairline track) ─────────────────────
function Ring({ value, size = 138 }: { value: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [draw, setDraw] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDraw(value), 140);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={CYAN} />
            <stop offset="100%" stopColor={CYAN_SOFT} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={HAIRLINE}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringCyan)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (draw / 100) * circ}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold tracking-tight tabular-nums">
          {value}
          <span className="text-xl align-top text-muted-foreground">%</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">match</span>
      </div>
    </div>
  );
}

// ── Top match hero (2×2) ──────────────────────────────────────────────────────
export function TopMatchTile({
  career,
  score,
  delay = 0,
}: {
  career: string;
  score: number;
  delay?: number;
}) {
  const meta = metaFor(career);
  return (
    <BentoTile className="md:col-span-2 md:row-span-2 flex flex-col" delay={delay} interactive>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <Eyebrow numeral="01">Your strongest match</Eyebrow>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          <Award className="h-3 w-3" />
          Saved
        </span>
      </div>

      <div className="relative mt-6 flex flex-1 flex-col items-start justify-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
            {career}
          </h2>
          <div className="mt-4 h-px w-20 bg-gold" />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            {meta.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {meta.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border/70 bg-background/45 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <Ring value={score} />
      </div>

      <Link
        to="/assessment"
        className="group relative mt-6 inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        Refine my match
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </BentoTile>
  );
}

const RADAR_CENTER = 120;
const RADAR_RADIUS = 76;

function polarPoint(angle: number, radius: number, center = RADAR_CENTER) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + Math.cos(rad) * radius,
    y: center + Math.sin(rad) * radius,
  };
}

function labelAnchor(angle: number): "start" | "middle" | "end" {
  if (angle > 20 && angle < 160) return "start";
  if (angle > 200 && angle < 340) return "end";
  return "middle";
}

function labelOffset(angle: number) {
  if (angle <= 20 || angle >= 340) return -6;
  if (angle >= 160 && angle <= 200) return 12;
  return 4;
}

// ── Skill bloom (1×2) ─────────────────────────────────────────────────────────
export function SkillRadarTile({ data, delay = 0 }: { data: RadarPoint[]; delay?: number }) {
  const chart = data.map((skill, index) => {
    const angle = (360 / data.length) * index;
    const outer = polarPoint(angle, RADAR_RADIUS);
    const valuePoint = polarPoint(angle, (skill.value / 100) * RADAR_RADIUS);
    const label = polarPoint(angle, RADAR_RADIUS + 22);

    return { ...skill, angle, outer, valuePoint, label };
  });
  const polygonPoints = chart
    .map((skill) => `${skill.valuePoint.x},${skill.valuePoint.y}`)
    .join(" ");

  return (
    <BentoTile className="md:col-span-2 md:row-span-3 flex flex-col" delay={delay} interactive>
      <div className="flex items-start justify-between gap-4">
        <Eyebrow numeral="02">Assessment signal</Eyebrow>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          Skills map
        </span>
      </div>

      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(190px,0.9fr)] lg:items-stretch">
        <div className="flex min-h-[220px] items-center justify-center rounded-[1.4rem] border border-border/60 bg-background/35 px-3 py-4 lg:min-h-0">
          <svg
            viewBox="0 0 240 240"
            className="h-full min-h-[210px] w-full max-w-[320px] overflow-visible lg:min-h-0"
            role="img"
            aria-label="Assessment signal radar chart"
          >
            <title>Assessment signal radar chart</title>
            <defs>
              <radialGradient id="skillBloomCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={CYAN_SOFT} stopOpacity="0.5" />
                <stop offset="100%" stopColor={CYAN} stopOpacity="0.08" />
              </radialGradient>
              <linearGradient id="skillRadarFill" x1="24" y1="24" x2="216" y2="216">
                <stop offset="0%" stopColor={CYAN} stopOpacity="0.38" />
                <stop offset="55%" stopColor={CYAN_SOFT} stopOpacity="0.2" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="0.24" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <circle
                key={scale}
                cx={RADAR_CENTER}
                cy={RADAR_CENTER}
                r={RADAR_RADIUS * scale}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth={scale === 1 ? 1.4 : 1}
                opacity={scale === 1 ? 0.85 : 0.58}
              />
            ))}

            {chart.map((skill) => (
              <line
                key={`${skill.axis}-spoke`}
                x1={RADAR_CENTER}
                y1={RADAR_CENTER}
                x2={skill.outer.x}
                y2={skill.outer.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
                opacity="0.75"
              />
            ))}

            <circle cx={RADAR_CENTER} cy={RADAR_CENTER} r="30" fill="url(#skillBloomCore)" />
            <polygon
              points={polygonPoints}
              fill="url(#skillRadarFill)"
              stroke={CYAN}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            {chart.map((skill) => (
              <g key={skill.axis}>
                <line
                  x1={RADAR_CENTER}
                  y1={RADAR_CENTER}
                  x2={skill.valuePoint.x}
                  y2={skill.valuePoint.y}
                  stroke={skill.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.58"
                />
                <circle
                  cx={skill.valuePoint.x}
                  cy={skill.valuePoint.y}
                  r="6.5"
                  fill={skill.color}
                  stroke="var(--card)"
                  strokeWidth="2"
                />
                <text
                  x={skill.label.x}
                  y={skill.label.y + labelOffset(skill.angle)}
                  textAnchor={labelAnchor(skill.angle)}
                  dominantBaseline="middle"
                  fill="currentColor"
                  className="text-[9px] font-semibold uppercase tracking-[0.12em] text-foreground"
                >
                  {skill.axis}
                </text>
                <text
                  x={skill.label.x}
                  y={skill.label.y + labelOffset(skill.angle) + 11}
                  textAnchor={labelAnchor(skill.angle)}
                  dominantBaseline="middle"
                  fill="currentColor"
                  className="text-[9px] font-bold tabular-nums text-muted-foreground"
                >
                  {skill.value}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid content-center gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {data.map((skill) => (
            <div
              key={skill.axis}
              className="min-w-0 rounded-xl border border-border/55 bg-background/35 px-2.5 py-1.5"
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 truncate text-foreground">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: skill.color }}
                  />
                  {skill.axis}
                </span>
                <span className="font-semibold tabular-nums text-foreground">{skill.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary/80">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${skill.value}%`, backgroundColor: skill.color }}
                />
              </div>
            </div>
          ))}
          <p className="rounded-xl border border-border/50 bg-background/25 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-1">
            Higher points sit farther from the center, based on your latest assessment answers.
          </p>
        </div>
      </div>
    </BentoTile>
  );
}

// ── Career compatibility (2×1) ────────────────────────────────────────────────
export function CompatibilityTile({
  ranked,
  delay = 0,
}: {
  ranked: { title: string; score: number }[];
  delay?: number;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 160);
    return () => clearTimeout(t);
  }, []);
  const visible = ranked.slice(0, 5);

  return (
    <BentoTile className="md:col-span-2 md:row-span-2 flex flex-col" delay={delay} interactive>
      <div className="flex items-start justify-between gap-4">
        <Eyebrow numeral="03">Top career matches</Eyebrow>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Ranked
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          Top matches will appear after your next assessment.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((c, i) => (
            <div key={c.title} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3">
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  i === 0
                    ? "bg-foreground text-background shadow-card"
                    : "bg-secondary text-muted-foreground",
                ].join(" ")}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "truncate text-sm",
                      i === 0
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground",
                    ].join(" ")}
                  >
                    {c.title}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums">{c.score}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: grown ? `${c.score}%` : "0%",
                      backgroundColor: i === 0 ? GOLD : CYAN,
                      opacity: i === 0 ? 1 : 0.55,
                      transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          ))}
        </div>
      )}
    </BentoTile>
  );
}

// ── Signed-in saved plan (2×1) ────────────────────────────────────────────────
export function AccountPlanTile({
  career,
  completed,
  steps,
  onProfile,
  delay = 0,
}: {
  career: string;
  completed: string[];
  steps: string[];
  onProfile: () => void;
  delay?: number;
}) {
  const nextSteps = steps.filter((step) => !completed.includes(step)).slice(0, 2);
  const done = completed.length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <BentoTile className="md:col-span-2 md:row-span-2 flex flex-col" delay={delay} interactive>
      <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <Eyebrow numeral="04">Saved action plan</Eyebrow>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          <CheckCircle2 className="h-3 w-3" />
          Roadmap ready
        </span>
      </div>

      <div className="relative mt-5 grid gap-5 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Saved for you
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{career}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Your latest result is saved to your account, so your roadmap can keep building from
            here.
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {done} of {total} roadmap steps complete
          </p>
        </div>

        <div className="flex flex-col justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Next best steps
          </p>
          <div className="mt-3 space-y-2.5">
            {(nextSteps.length > 0 ? nextSteps : ["All current roadmap steps are complete."]).map(
              (step, index) => (
                <div key={step} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="leading-snug text-foreground">{step}</span>
                </div>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={onProfile}
            className="group mt-4 inline-flex items-center gap-2 self-start rounded-full border border-border/80 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent/60"
          >
            <UserRound className="h-3.5 w-3.5 text-primary" />
            Complete profile
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </BentoTile>
  );
}

// ── Momentum (1×1) ────────────────────────────────────────────────────────────
export function MomentumTile({
  data,
  trend,
  delay = 0,
}: {
  data: MomentumPoint[];
  trend: number;
  delay?: number;
}) {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor =
    trend > 0 ? "text-primary" : trend < 0 ? "text-rose-500" : "text-muted-foreground";

  return (
    <BentoTile className="flex flex-col" delay={delay} interactive>
      <Eyebrow>Retake trend</Eyebrow>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tabular-nums">
          {data.length > 0 ? data[data.length - 1].score : 0}
          <span className="text-base text-muted-foreground">%</span>
        </span>
        <span className={`inline-flex items-center text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {trend !== 0 ? Math.abs(trend) : "flat"}
        </span>
      </div>
      <div className="mt-2 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={52}>
          <LineChart data={data} margin={{ top: 6, bottom: 2, left: 2, right: 2 }}>
            <Line
              type="monotone"
              dataKey="score"
              stroke={CYAN}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5, fill: CYAN, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.length > 1 ? `${data.length} assessments tracked` : "Take more to see a trend"}
      </p>
    </BentoTile>
  );
}

// ── Roadmap ring (1×1) ────────────────────────────────────────────────────────
export function RoadmapTile({
  pct,
  done,
  total,
  delay = 0,
  onView,
}: {
  pct: number;
  done: number;
  total: number;
  delay?: number;
  onView?: () => void;
}) {
  return (
    <BentoTile
      className="flex flex-col items-center justify-center text-center"
      delay={delay}
      interactive
    >
      <Eyebrow>Roadmap</Eyebrow>
      <div className="my-3">
        <Ring value={pct} size={108} />
      </div>
      <p className="text-xs text-muted-foreground">
        {done} of {total} milestones
      </p>
      {onView && (
        <button
          onClick={onView}
          className="mt-3 text-xs font-semibold text-primary hover:underline"
        >
          View roadmap →
        </button>
      )}
    </BentoTile>
  );
}

// ── New assessment CTA (1×1) — espresso block, ivory type ──────────────────────
export function NewAssessmentTile({
  delay = 0,
  className = "",
}: {
  delay?: number;
  className?: string;
}) {
  return (
    <Link
      to="/assessment"
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-foreground p-6 text-background shadow-card animate-fade-up transition-all duration-500 hover:-translate-y-0.5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-gold/20 blur-3xl" />
      <span className="text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: GOLD }}>
        Retake
      </span>
      <div className="relative mt-4">
        <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-background/10 text-primary">
          <Target className="h-4 w-4" />
        </span>
        <p className="font-display text-2xl font-semibold leading-tight">New assessment</p>
        <span
          className="mt-2 inline-flex items-center gap-1.5 text-sm"
          style={{ color: CYAN_SOFT }}
        >
          Re-scan your strengths
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// ── AI insight strip (full width) ─────────────────────────────────────────────
export function InsightStrip({ text }: { text: string }) {
  return (
    <div className="relative flex items-start gap-4 overflow-hidden rounded-[1.5rem] border border-border/80 bg-card/85 px-5 py-4 shadow-card backdrop-blur animate-fade-up">
      <div className="absolute inset-y-0 left-0 w-1 bg-gold" />
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
        <Compass className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          PathPilot insight
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  );
}
