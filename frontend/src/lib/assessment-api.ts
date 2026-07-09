import {
  apiFetch,
  clearUserSession,
  getUserSession,
  readApiJson,
  responseHasInvalidAuth,
  validateUserSession,
} from "./auth-api";

export type AssessmentAnswers = Record<string, string | string[]>;

// sessionStorage keys used to carry a guest's just-completed assessment across
// the sign-up / sign-in boundary so it can be saved under the new account.
const ANSWERS_KEY = "assessmentAnswers";
const PENDING_SAVE_KEY = "pathpilot_pending_save";

export interface SavedAssessment {
  id: string;
  prediction: string;
  topCareer: string;
  topScore: number;
  matchScores: Record<string, number>;
  answers?: AssessmentAnswers;
  source?: "ml" | "mock";
  degree: string | null;
  timestamp: string;
}

export interface AssessmentResponse {
  success: boolean;
  message?: string;
  assessmentId?: string;
  prediction?: string;
  matchScores?: Record<string, number>;
  suggestedSkills?: string[];
  top3?: { career: string; score: number }[];
  source?: "ml" | "mock"; // which engine produced this result
  error?: string;
}

export async function submitAssessment(
  answers: AssessmentAnswers,
): Promise<{ success: true; data: AssessmentResponse } | { success: false; message: string }> {
  try {
    if (getUserSession()?.token) {
      await validateUserSession();
    }

    const body = JSON.stringify({ answers, degree: answers.degree });
    let res = await apiFetch("/api/assess", {
      method: "POST",
      body,
    });

    if (await responseHasInvalidAuth(res)) {
      clearUserSession();
      res = await apiFetch("/api/assess", {
        method: "POST",
        body,
        skipAuth: true,
      });
    }

    const data = (await readApiJson(res)) as AssessmentResponse;

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || data.error || "Could not save assessment.",
      };
    }

    return { success: true, data };
  } catch {
    return { success: false, message: "Could not connect to the assessment service." };
  }
}

// ── Registered-user assessment history ────────────────────────────────────────

/** Fetch the logged-in user's saved assessments (newest first). */
export async function fetchMyAssessments(): Promise<SavedAssessment[]> {
  try {
    const res = await apiFetch("/api/assessments/me");
    if (!res.ok) return [];
    const data = await res.json();
    return data?.success ? (data.assessments ?? []) : [];
  } catch {
    return [];
  }
}

// ── Guest → account "save my results" claim flow ──────────────────────────────

/** Mark the guest's current assessment to be saved after they authenticate. */
export function markAssessmentForSave(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_SAVE_KEY, "1");
}

/**
 * If a guest flagged their assessment for saving (via the results CTA) and then
 * signed in / registered, persist it under their now-authenticated account.
 * Safe to call on every dashboard load — it no-ops when there's nothing pending.
 */
export async function claimPendingAssessment(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(PENDING_SAVE_KEY) !== "1") return false;

  let saved = false;
  try {
    const raw = sessionStorage.getItem(ANSWERS_KEY);
    if (raw) {
      const answers = JSON.parse(raw) as AssessmentAnswers;
      const result = await submitAssessment(answers); // now authenticated → links userId
      saved = result.success;
    }
  } catch {
    /* ignore — flag is cleared below so we never loop */
  } finally {
    sessionStorage.removeItem(PENDING_SAVE_KEY);
  }
  return saved;
}
