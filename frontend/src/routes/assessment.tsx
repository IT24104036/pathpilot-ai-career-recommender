import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Compass, CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { submitAssessment } from "@/lib/assessment-api";
import { PathBackdrop } from "@/components/PathBackdrop";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Career Assessment — PathPilot" },
      {
        name: "description",
        content:
          "Take our free 5-minute AI-powered career assessment and discover your top career matches.",
      },
    ],
  }),
  component: AssessmentPage,
});

// ─── Question data ────────────────────────────────────────────────────────────

const QUESTIONS = [
  // ── Section 1 — Academic Background ──
  {
    id: "field_of_study",
    step: 1,
    section: 1,
    category: "Academic Background",
    question: "What is your IT field of study or specialization?",
    type: "single",
    // Options MUST match ml-service/ENCODING_SPEC.md (field_of_study) exactly.
    options: [
      "Computer Science",
      "Software Engineering",
      "Information Systems / IT",
      "Data Science",
      "Cybersecurity",
      "Other IT field",
    ],
  },
  {
    id: "status",
    step: 2,
    section: 1,
    category: "Academic Background",
    question: "What's your current academic status?",
    type: "single",
    options: [
      "1st / 2nd year undergraduate",
      "3rd year undergraduate",
      "Final year undergraduate",
      "Recent graduate",
      "Postgraduate / Masters",
    ],
  },
  {
    id: "modules",
    step: 2,
    section: 1,
    category: "Academic Background",
    question: "Which IT subjects do you enjoy most? (Select all that apply)",
    type: "multi",
    options: [
      "Algorithms & Data Structures",
      "Databases & SQL",
      "Statistics & Math",
      "Web & App Development",
      "Networking & Security",
      "UI/UX & Design",
      "Machine Learning & AI",
      "Cloud Computing",
      "Project & Business Management",
    ],
  },

  // ── Section 2 — Technical Comfort ──
  {
    id: "coding",
    step: 3,
    section: 2,
    category: "Technical Comfort",
    question: "How comfortable are you with coding?",
    type: "single",
    options: [
      "I love coding",
      "Comfortable with code",
      "Neutral about coding",
      "I prefer minimal coding",
      "I'd rather avoid coding",
    ],
  },
  {
    id: "skills",
    step: 4,
    section: 2,
    category: "Technical Comfort",
    question: "What are your strongest technical skills? (Select all that apply)",
    type: "multi",
    options: [
      "Programming",
      "Data Analysis",
      "Machine Learning",
      "Cloud & DevOps",
      "Cybersecurity",
      "Design & Prototyping",
      "Communication & Leadership",
      "Business Analysis",
    ],
  },

  // ── Section 3 — Interests ──
  {
    id: "activities",
    step: 5,
    section: 3,
    category: "Interests",
    question: "Which activities do you enjoy most? (Select all that apply)",
    type: "multi",
    options: [
      "Analyzing data & finding patterns",
      "Building apps & software",
      "Training ML / AI models",
      "Designing user interfaces",
      "Securing systems & networks",
      "Working with cloud & infrastructure",
      "Planning & coordinating projects",
      "Solving business problems",
    ],
  },
  {
    id: "problemStyle",
    step: 6,
    section: 3,
    category: "Interests",
    question: "What kind of problems do you enjoy solving?",
    type: "single",
    options: [
      "Data & logic puzzles",
      "Building & coding challenges",
      "Visual & design problems",
      "Security & investigation",
      "People & coordination",
      "Business & strategy",
    ],
  },

  // ── Section 4 — Work Style / Personality ──
  {
    id: "workStyle",
    step: 7,
    section: 4,
    category: "Work Style & Personality",
    question: "What's your preferred work environment?",
    type: "single",
    options: [
      "Independent / remote",
      "Collaborative team",
      "Fast-paced startup",
      "Structured corporate",
      "Research-focused",
    ],
  },
  {
    id: "personality",
    step: 8,
    section: 4,
    category: "Work Style & Personality",
    question: "Which traits describe you best? (Select all that apply)",
    type: "multi",
    options: [
      "Analytical",
      "Creative",
      "Detail-oriented",
      "Curious",
      "Leader",
      "Problem-solver",
      "Communicator",
      "Persistent",
    ],
  },
  {
    id: "workPreference",
    step: 9,
    section: 4,
    category: "Work Style & Personality",
    question: "Do you prefer structured or flexible work?",
    type: "single",
    options: [
      "Highly structured & predictable",
      "Mostly structured",
      "A balance of both",
      "Mostly flexible",
      "Highly flexible & creative",
    ],
  },

  // ── Section 5 — Career Preference ──
  {
    id: "careerPreference",
    step: 10,
    section: 5,
    category: "Career Preference",
    question: "Which IT career paths interest you most? (Select all that apply)",
    type: "multi",
    options: [
      "Data Analyst",
      "Data Scientist",
      "Machine Learning Engineer",
      "Software Engineer",
      "Business Analyst",
      "UI/UX Designer",
      "Cybersecurity Analyst",
      "Cloud / DevOps Engineer",
      "Project Manager",
    ],
  },
];

const TOTAL_SECTIONS = 5;

const TOTAL_STEPS = QUESTIONS.length;

// ─── Component ────────────────────────────────────────────────────────────────

function AssessmentPage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const question = QUESTIONS[currentStep];
  const answer = answers[question.id];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const isAnswered =
    question.type === "single"
      ? typeof answer === "string" && answer.length > 0
      : Array.isArray(answer) && answer.length > 0;

  function selectOption(opt: string) {
    if (question.type === "single") {
      setAnswers((prev) => ({ ...prev, [question.id]: opt }));
    } else {
      setAnswers((prev) => {
        const current = (prev[question.id] as string[]) ?? [];
        const updated = current.includes(opt)
          ? current.filter((o) => o !== opt)
          : [...current, opt];
        return { ...prev, [question.id]: updated };
      });
    }
  }

  function isSelected(opt: string) {
    if (question.type === "single") return answer === opt;
    return Array.isArray(answer) && answer.includes(opt);
  }

  async function goNext() {
    if (!isAnswered) return;
    setSubmitError("");

    if (currentStep < TOTAL_STEPS - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setAnimating(false);
      }, 220);
    } else {
      setSubmitting(true);
      const result = await submitAssessment(answers);
      setSubmitting(false);

      if (!result.success) {
        setSubmitError(result.message);
        return;
      }

      // Store answers in sessionStorage for the results page
      sessionStorage.setItem("assessmentAnswers", JSON.stringify(answers));
      sessionStorage.setItem("assessmentResult", JSON.stringify(result.data));
      navigate({ to: "/results" });
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setAnimating(false);
      }, 220);
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-mesh text-foreground flex flex-col">
      <PathBackdrop />
      {/* ── Minimal Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow text-primary-foreground transition-transform group-hover:rotate-12">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">PathPilot</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-all"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-border/60">
          <div
            className="h-full bg-gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-card backdrop-blur-xl sm:p-8 md:p-10">
          {/* Category label + 5-section tracker */}
          <div
            className="mb-6 animate-fade-up"
            style={{ opacity: animating ? 0 : 1, transition: "opacity 0.22s" }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                {question.category}
              </span>
              <span className="text-xs text-muted-foreground">
                Question {currentStep + 1} / {TOTAL_STEPS}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i + 1 < question.section
                      ? "w-6 bg-primary"
                      : i + 1 === question.section
                        ? "w-9 bg-gradient-primary"
                        : "w-6 bg-border",
                  ].join(" ")}
                />
              ))}
              <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                Section {question.section} of {TOTAL_SECTIONS}
              </span>
            </div>
          </div>

          {/* Question */}
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight mb-8"
            style={{ opacity: animating ? 0 : 1, transition: "opacity 0.22s" }}
          >
            {question.question}
          </h1>

          {/* Options */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
            style={{ opacity: animating ? 0 : 1, transition: "opacity 0.22s" }}
          >
            {question.options.map((opt) => {
              const selected = isSelected(opt);
              return (
                <button
                  key={opt}
                  id={`option-${opt.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => selectOption(opt)}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 hover:scale-[1.02] group",
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-glow"
                      : "border-border/80 bg-background/70 text-foreground hover:border-primary/50 hover:bg-accent/40",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                      selected
                        ? "border-primary bg-primary"
                        : "border-border group-hover:border-primary/60",
                    ].join(" ")}
                  >
                    {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              id="btn-back"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={goNext}
              disabled={!isAnswered || submitting}
              id="btn-next"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-7 py-2.5 text-sm font-semibold shadow-glow hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  {currentStep === TOTAL_STEPS - 1 ? "View My Results" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Multi-select hint */}
          {question.type === "multi" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              You can select multiple options
            </p>
          )}

          {submitError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{submitError}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
