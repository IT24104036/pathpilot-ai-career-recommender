// ─── Admin Auth context ───────────────────────────────────────────────────────
// Admin auth is backed by the same JWT session as the main app.

import {
  clearUserSession,
  getUserSession,
  loginUser,
  validateUserSession,
  type UserSession,
} from "./auth-api";

export interface AdminUser extends UserSession {
  role: "admin";
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ success: true; user: AdminUser } | { success: false; message: string }> {
  const result = await loginUser(email, password);

  if (!result.success) {
    return result;
  }

  if (result.session.role !== "admin") {
    clearUserSession();
    return { success: false, message: "This account does not have admin access." };
  }

  return { success: true, user: result.session as AdminUser };
}

export function adminLogout() {
  clearUserSession();
}

export function getAdminSession(): AdminUser | null {
  const session = getUserSession();
  return session?.role === "admin" ? (session as AdminUser) : null;
}

export async function validateAdminSession(): Promise<AdminUser | null> {
  const session = await validateUserSession("admin");
  return session?.role === "admin" ? (session as AdminUser) : null;
}
