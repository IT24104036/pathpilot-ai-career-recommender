import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, LayoutDashboard, LogOut, Moon, Sun, ChevronRight, Shield } from "lucide-react";
import { validateAdminSession, adminLogout, type AdminUser } from "@/lib/admin-auth";
import { useTheme } from "@/hooks/use-theme";
import { PathBackdrop } from "@/components/PathBackdrop";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }];

function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If we're on the login page, just render the outlet — no layout needed
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    if (!isLoginPage) {
      validateAdminSession().then((session) => {
        if (cancelled) return;

        if (!session) {
          navigate({ to: "/admin/login" });
        } else {
          setAdmin(session);
        }
        setChecked(true);
      });
    } else {
      setChecked(true);
    }

    return () => {
      cancelled = true;
    };
  }, [navigate, isLoginPage]);

  function handleLogoutRequest() {
    setShowLogoutModal(true);
  }

  function handleLogoutConfirm() {
    setShowLogoutModal(false);
    adminLogout();
    setShowSuccess(true);
    // After 2 seconds show success, then redirect to home
    setTimeout(() => {
      navigate({ to: "/" });
    }, 2000);
  }

  function handleLogoutCancel() {
    setShowLogoutModal(false);
  }

  // On the login page, render the child route directly
  if (isLoginPage) {
    return <Outlet />;
  }

  // While checking session, render nothing to avoid flash
  if (!checked || !admin) return null;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-mesh text-foreground">
      <PathBackdrop tone="admin" />
      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleLogoutCancel}
          />
          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                <LogOut className="h-7 w-7 text-destructive" />
              </div>
            </div>
            {/* Content */}
            <h2 className="mb-1 text-center text-lg font-bold tracking-tight">
              Sign out of Admin Portal?
            </h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              You'll be redirected to the home page. You can sign back in anytime.
            </p>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                id="btn-logout-cancel"
                onClick={handleLogoutCancel}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                id="btn-logout-confirm"
                onClick={handleLogoutConfirm}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-all hover:opacity-90"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card shadow-2xl px-10 py-8 animate-fade-up">
            {/* Animated checkmark */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <svg
                className="h-8 w-8 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-bold tracking-tight">Signed out successfully</p>
              <p className="mt-1 text-sm text-muted-foreground">Redirecting to home page…</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/78 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/admin/dashboard" className="group flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-hover:rotate-6">
                <Compass className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <span className="block font-display text-xl font-bold leading-tight tracking-tight">
                  PathPilot
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Admin Mission Control
                </span>
              </div>
            </Link>

            <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-background/45 p-1 backdrop-blur sm:order-none sm:w-auto">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || pathname.startsWith(to + "/");
                return (
                  <Link
                    key={to}
                    to={to}
                    id={`admin-nav-${label.toLowerCase()}`}
                    className={[
                      "group inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {label}
                    {active && <ChevronRight className="h-3.5 w-3.5" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 rounded-2xl border border-border/60 bg-background/45 px-3 py-2 backdrop-blur md:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {admin.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="max-w-32 truncate text-xs font-semibold text-foreground">
                    {admin.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      Admin
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/45 transition-all hover:bg-accent"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              <button
                onClick={handleLogoutRequest}
                id="btn-admin-logout"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 text-sm font-semibold text-foreground shadow-card transition-all hover:-translate-y-0.5 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
