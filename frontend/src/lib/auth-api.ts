// ─── auth-api.ts ──────────────────────────────────────────────────────────────
// Thin wrappers around the PathPilot auth endpoints.
// The client NEVER sends a `role` field — role is assigned server-side only.

export const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);
const SESSION_KEY = "pathpilot_user_session";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  token: string;
  avatarUrl?: string;
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function setUserSession(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearUserSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function authHeaders(skipAuth = false): HeadersInit {
  if (skipAuth) return {};
  const session = getUserSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

export async function readApiJson(res: Response) {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text };
  }
}

function toSession(data: { user: Omit<UserSession, "token">; token: string }): UserSession {
  return { ...data.user, token: data.token };
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

function isInvalidAuthMessage(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const message = "message" in data ? String(data.message) : "";
  return /invalid|expired|authentication token/i.test(message);
}

export async function responseHasInvalidAuth(res: Response): Promise<boolean> {
  if (res.status !== 401) return false;

  try {
    return isInvalidAuthMessage(await readApiJson(res.clone()));
  } catch {
    return false;
  }
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  const hasBody = fetchOptions.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const auth = authHeaders(skipAuth);
  Object.entries(auth).forEach(([key, value]) => headers.set(key, value));

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (await responseHasInvalidAuth(res)) {
    clearUserSession();
  }

  return res;
}

export async function validateUserSession(
  requiredRole?: UserSession["role"],
): Promise<UserSession | null> {
  const current = getUserSession();
  if (!current?.token) return null;

  try {
    const res = await apiFetch("/api/auth/me");
    const data = await readApiJson(res);

    if (!res.ok || !data.success) {
      clearUserSession();
      return null;
    }

    const session: UserSession = { ...data.user, token: current.token };
    if (requiredRole && session.role !== requiredRole) {
      return null;
    }

    setUserSession(session);
    return session;
  } catch {
    return null;
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
// Only sends name, email, password — role is NEVER included.
// The server always assigns role = "user" for this endpoint.

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ success: true; session: UserSession } | { success: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Deliberately only sending name, email, password — no role field
      body: JSON.stringify({ name, email, password }),
    });
    const data = await readApiJson(res);
    if (!data.success) return { success: false, message: data.message ?? "Registration failed." };

    const session = toSession(data);
    setUserSession(session);
    return { success: true, session };
  } catch {
    return { success: false, message: "Could not connect to server. Please try again." };
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: true; session: UserSession } | { success: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await readApiJson(res);
    if (!data.success) return { success: false, message: data.message ?? "Login failed." };

    const session = toSession(data);
    setUserSession(session);
    return { success: true, session };
  } catch {
    return { success: false, message: "Could not connect to server. Please try again." };
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  avatarUrl: string;
  university: string;
  degree: string;
  specialization: string;
  yearStatus: string;
  careerInterests: string[];
  skills: string[];
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

// Fields a user may edit (never id/email/role/createdAt).
export type ProfileUpdate = Partial<Omit<UserProfile, "id" | "email" | "role" | "createdAt">>;

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await apiFetch("/api/user/profile");
    const data = await readApiJson(res);
    if (!res.ok || !data.success) return null;
    return data.user as UserProfile;
  } catch {
    return null;
  }
}

export async function updateProfile(
  patch: ProfileUpdate,
): Promise<{ success: true; profile: UserProfile } | { success: false; message: string }> {
  try {
    const res = await apiFetch("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const data = await readApiJson(res);
    if (!res.ok || !data.success) {
      return { success: false, message: data.message ?? "Could not save your profile." };
    }
    // Keep the cached session name in sync with the dashboard/top bar.
    const current = getUserSession();
    if (current && data.user?.name) setUserSession({ ...current, name: data.user.name });
    return { success: true, profile: data.user as UserProfile };
  } catch {
    return { success: false, message: "Could not connect to server. Please try again." };
  }
}

export async function deleteAccount(): Promise<boolean> {
  try {
    const res = await apiFetch("/api/user/account", { method: "DELETE" });
    const data = await readApiJson(res);
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}

// ── Career Progress Tracker ───────────────────────────────────────────────────
// Completed checklist items keyed by career name, e.g. { "Data Analyst": [...] }.
export type CareerProgress = Record<string, string[]>;

export async function fetchProgress(): Promise<CareerProgress> {
  try {
    const res = await apiFetch("/api/user/progress");
    const data = await readApiJson(res);
    return res.ok && data.success ? (data.progress ?? {}) : {};
  } catch {
    return {};
  }
}

/** Save the completed checklist items for one career. Returns the full map. */
export async function updateCareerProgress(
  career: string,
  completedTasks: string[],
): Promise<CareerProgress | null> {
  try {
    const res = await apiFetch("/api/user/progress", {
      method: "PATCH",
      body: JSON.stringify({ career, completedTasks }),
    });
    const data = await readApiJson(res);
    return res.ok && data.success ? (data.progress ?? {}) : null;
  } catch {
    return null;
  }
}

// Uploads a profile photo file (multipart). Returns the updated profile whose
// avatarUrl now points at the stored image.
export async function uploadPhoto(
  file: File,
): Promise<{ success: true; profile: UserProfile } | { success: false; message: string }> {
  try {
    const session = getUserSession();
    const formData = new FormData();
    formData.append("photo", file);

    // Note: do NOT set Content-Type — the browser adds the multipart boundary.
    const res = await fetch(`${API_BASE}/api/user/photo`, {
      method: "POST",
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      body: formData,
    });
    const data = await readApiJson(res);
    if (!res.ok || !data.success) {
      return { success: false, message: data.message ?? "Could not upload photo." };
    }
    return { success: true, profile: data.user as UserProfile };
  } catch {
    return { success: false, message: "Could not connect to server. Please try again." };
  }
}
