import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, AlertCircle } from "lucide-react";
import { registerUser } from "@/lib/auth-api";
import { AuthLayout, fieldInput, fieldLabel, submitButton } from "@/components/auth/auth-layout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — PathPilot" },
      {
        name: "description",
        content:
          "Create a free PathPilot account to save your career assessment results and track your career journey.",
      },
    ],
  }),
  component: RegisterPage,
});

const PERKS = [
  "Save your career assessment results",
  "Track your career journey over time",
  "Access your personalized dashboard",
  "Career roadmap & progress insights",
];

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Only sends name, email, password — role is NEVER sent or set by the client
    const result = await registerUser(name, email, password);
    if (result.success) {
      // New users land on their dashboard; any pending guest assessment is
      // claimed there (see dashboard.tsx → claimPendingAssessment).
      navigate({ to: "/dashboard" });
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  const passwordStrength =
    password.length === 0
      ? null
      : password.length < 6
        ? "weak"
        : password.length < 10
          ? "fair"
          : "strong";

  return (
    <AuthLayout
      eyebrow="Free forever · no card needed"
      title="Create account"
      subtitle="Begin your career journey in under a minute."
      asideHeadline={
        <>
          A considered path
          <br />
          to your <span className="italic">future.</span>
        </>
      }
      asideSub="Join undergraduates discovering their best-fit career — saved, tracked, and guided over time."
      asideExtra={
        <ul className="space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-[#FAF7F0]/80">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C9A86A]" />
              {perk}
            </li>
          ))}
        </ul>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="register-name" className={fieldLabel}>
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className={`${fieldInput} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className={fieldLabel}>
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`${fieldInput} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className={fieldLabel}>
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={`${fieldInput} pl-10 pr-11`}
            />
            <button
              type="button"
              id="toggle-register-password"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {passwordStrength && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {["weak", "fair", "strong"].map((level, i) => {
                  const active =
                    passwordStrength === "weak"
                      ? i === 0
                      : passwordStrength === "fair"
                        ? i <= 1
                        : true;
                  return (
                    <div
                      key={level}
                      className={[
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        active
                          ? passwordStrength === "weak"
                            ? "bg-red-500"
                            : passwordStrength === "fair"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          : "bg-border",
                      ].join(" ")}
                    />
                  );
                })}
              </div>
              <span
                className={[
                  "text-xs font-medium",
                  passwordStrength === "weak"
                    ? "text-red-500"
                    : passwordStrength === "fair"
                      ? "text-amber-500"
                      : "text-emerald-500",
                ].join(" ")}
              >
                {passwordStrength === "weak"
                  ? "Too short"
                  : passwordStrength === "fair"
                    ? "Fair"
                    : "Strong"}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <button type="submit" id="btn-register-submit" disabled={loading} className={submitButton}>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" id="link-sign-in" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
