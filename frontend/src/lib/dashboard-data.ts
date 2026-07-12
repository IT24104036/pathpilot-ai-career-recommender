// ─── dashboard-data.ts ────────────────────────────────────────────────────────
// Pure functions that turn the user's real assessments (GET /api/assessments/me)
// into the shapes the bento tiles render. No network, no React — easy to reason
// about and trivially swappable for a real ML/feature pipeline later.

import type { AssessmentAnswers, SavedAssessment } from "./assessment-api";
import { rankCareers } from "./careers";

// ── Skill signal ──────────────────────────────────────────────────────────────
// Built from the actual selected assessment answers, not from final career scores.
const SKILL_AXES = ["Data", "Code", "AI/ML", "Design", "Security", "Cloud", "Leadership"] as const;

export type SkillAxis = (typeof SKILL_AXES)[number];

const SKILL_KEYWORDS: Record<SkillAxis, string[]> = {
  Data: [
    "data science",
    "databases & sql",
    "statistics & math",
    "data analysis",
    "analyzing data",
    "data & logic",
    "data analyst",
    "data scientist",
    "analytical",
    "detail-oriented",
  ],
  Code: [
    "computer science",
    "software engineering",
    "algorithms",
    "web & app development",
    "programming",
    "building apps",
    "building & coding",
    "software engineer",
    "machine learning engineer",
    "i love coding",
    "comfortable with code",
  ],
  "AI/ML": [
    "machine learning & ai",
    "machine learning",
    "training ml / ai models",
    "machine learning engineer",
  ],
  Design: [
    "ui/ux",
    "design & prototyping",
    "designing user interfaces",
    "visual & design",
    "creative",
    "ui/ux designer",
  ],
  Security: [
    "cybersecurity",
    "networking & security",
    "securing systems",
    "security & investigation",
    "cybersecurity analyst",
  ],
  Cloud: [
    "cloud",
    "cloud computing",
    "cloud & devops",
    "working with cloud",
    "cloud / devops engineer",
  ],
  Leadership: [
    "business analysis",
    "project & business management",
    "solving business",
    "business & strategy",
    "people & coordination",
    "leader",
    "communicator",
    "business analyst",
    "project manager",
    "collaborative team",
  ],
};

export interface RadarPoint {
  axis: SkillAxis;
  value: number;
  color: string;
}

const SKILL_COLORS: Record<SkillAxis, string> = {
  Data: "#16B5C4",
  Code: "#7C3AED",
  "AI/ML": "#6366F1",
  Design: "#EC4899",
  Security: "#F97316",
  Cloud: "#0EA5E9",
  Leadership: "#22C55E",
};

function answerText(answers?: AssessmentAnswers): string {
  if (!answers) return "";
  return Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

export function deriveSkillAxes(
  answers?: AssessmentAnswers,
  matchScores?: Record<string, number>,
): RadarPoint[] {
  const haystack = answerText(answers);

  if (!haystack && matchScores) {
    const ranked = rankCareers(matchScores);
    return SKILL_AXES.map((axis, index) => ({
      axis,
      value: Math.max(18, Math.round((ranked[index]?.score ?? 30) * 0.7)),
      color: SKILL_COLORS[axis],
    }));
  }

  return SKILL_AXES.map((axis) => {
    const hits = SKILL_KEYWORDS[axis].reduce(
      (total, keyword) => total + (haystack.includes(keyword) ? 1 : 0),
      0,
    );
    return {
      axis,
      value: Math.min(96, 18 + hits * 14),
      color: SKILL_COLORS[axis],
    };
  });
}

// ── Momentum sparkline ────────────────────────────────────────────────────────
export interface MomentumPoint {
  index: number;
  score: number;
  label: string;
}

/** Top-score over time, oldest → newest, for a sparkline. */
export function deriveMomentum(assessments: SavedAssessment[]): MomentumPoint[] {
  return [...assessments].reverse().map((a, i) => ({
    index: i,
    score: a.topScore || 0,
    label: new Date(a.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

/** Signed delta between the two most recent assessments' top scores. */
export function scoreTrend(assessments: SavedAssessment[]): number {
  if (assessments.length < 2) return 0;
  return (assessments[0].topScore || 0) - (assessments[1].topScore || 0);
}

// ── AI insight strip ──────────────────────────────────────────────────────────
// Rule-based "coach" sentence derived from real data. No LLM needed yet; this is
// the seam where a real model plugs in later.
export function deriveInsight(assessments: SavedAssessment[]): string {
  if (assessments.length === 0) {
    return "Take your first assessment to unlock personalized career insights.";
  }

  const latest = assessments[0];
  const top = latest.topCareer || latest.prediction;
  const score = latest.topScore || 0;

  if (assessments.length === 1) {
    return `Your strongest fit is ${top} at ${score}% — take another assessment to start tracking your momentum.`;
  }

  const trend = scoreTrend(assessments);
  if (trend > 0) {
    return `Your top match climbed ${trend}% since last time — ${top} is now your strongest fit at ${score}%.`;
  }
  if (trend < 0) {
    return `Your scores shifted recently. ${top} remains your leading match at ${score}% — explore what changed.`;
  }

  // Stable trend → comment on consistency of the leading career.
  const leaders = assessments
    .map((a) => a.topCareer || a.prediction)
    .filter((c) => c === top).length;
  return `You've matched ${top} in ${leaders} of your ${assessments.length} assessments — a consistent ${score}% fit.`;
}

// ── Convenience aggregate ─────────────────────────────────────────────────────
export interface DashboardModel {
  hasData: boolean;
  latest?: SavedAssessment;
  topCareer: string;
  topScore: number;
  avgScore: number;
  count: number;
  ranked: { title: string; score: number }[];
  radar: RadarPoint[];
  momentum: MomentumPoint[];
  trend: number;
  insight: string;
}

export function buildDashboardModel(assessments: SavedAssessment[]): DashboardModel {
  const latest = assessments[0];
  const ranked = rankCareers(latest?.matchScores);
  const avg =
    assessments.length > 0
      ? Math.round(assessments.reduce((s, a) => s + (a.topScore || 0), 0) / assessments.length)
      : 0;

  return {
    hasData: assessments.length > 0,
    latest,
    topCareer: latest?.topCareer || latest?.prediction || "—",
    topScore: latest?.topScore ?? 0,
    avgScore: avg,
    count: assessments.length,
    ranked,
    radar: deriveSkillAxes(latest?.answers, latest?.matchScores),
    momentum: deriveMomentum(assessments),
    trend: scoreTrend(assessments),
    insight: deriveInsight(assessments),
  };
}
