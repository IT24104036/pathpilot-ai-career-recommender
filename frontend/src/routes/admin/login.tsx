import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Compass,
  Moon,
  Sun,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { adminLogin, validateAdminSession } from "@/lib/admin-auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — PathPilot" },
      { name: "description", content: "Sign in to the PathPilot admin portal." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in as admin, redirect straight to dashboard
  useEffect(() => {
    let cancelled = false;

    validateAdminSession().then((session) => {
      if (!cancelled && session) {
        navigate({ to: "/admin/dashboard", replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await adminLogin(email, password);
    if (result.success) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setError(result.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow text-primary-foreground transition-transform group-hover:rotate-12">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
          </a>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-all"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl border border-border/60 bg-card shadow-card p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow text-primary-foreground mx-auto mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Sign in with your admin credentials
              </p>
            </div>

            {/* Seeded credentials hint */}
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold text-primary mb-1.5">Seeded Admin Credentials</p>
              <p className="text-xs text-muted-foreground font-mono">admin@pathpilot.ai</p>
              <p className="text-xs text-muted-foreground font-mono">Admin123</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pathpilot.ai"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-11 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    id="toggle-admin-password"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-admin-login"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                ) : (
                  <>
                    Sign In to Admin Portal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to main site
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
