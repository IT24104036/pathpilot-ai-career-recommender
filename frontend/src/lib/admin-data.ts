// ─── Admin Portal API helpers ────────────────────────────────────────────────

import { apiFetch } from "./auth-api";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  assessmentsCompleted: number;
  role: "user" | "admin";
}

export interface AdminAssessmentRow {
  id: string;
  studentName: string;
  email?: string | null;
  date: string;
  topCareer: string;
  matchScore: number;
  source?: "ml" | "mock";
}

export interface AdminSummaryPayload {
  summaryStats: {
    totalUsers: number;
    totalAssessments: number;
    mostRecommendedCareer: string;
    averageMatchScore: number;
  };
  careerDistribution: Array<{ career: string; count: number }>;
  assessmentTrend: Array<{ month: string; assessments: number; users: number }>;
  recentAssessments: AdminAssessmentRow[];
}

async function readAdminJson<T>(res: Response, key: string): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Admin API request failed.");
  }

  return data[key] as T;
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const res = await apiFetch("/api/admin/users");
  return readAdminJson<AdminUserRow[]>(res, "users");
}

export async function fetchAdminAssessments(): Promise<AdminAssessmentRow[]> {
  const res = await apiFetch("/api/admin/assessments");
  return readAdminJson<AdminAssessmentRow[]>(res, "assessments");
}

export async function fetchAdminSummary(): Promise<AdminSummaryPayload> {
  const res = await apiFetch("/api/admin/summary");
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Admin summary request failed.");
  }

  return {
    summaryStats: data.summaryStats,
    careerDistribution: data.careerDistribution,
    assessmentTrend: data.assessmentTrend,
    recentAssessments: data.recentAssessments,
  };
}
