import { CheckCircle2, Circle, Target, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ProgressTracker({
  career,
  items,
  completed,
  onToggle,
}: {
  career: string;
  items: string[];
  completed: string[];
  onToggle: (item: string) => void;
}) {
  const doneSet = new Set(completed);
  const doneCount = items.filter((i) => doneSet.has(i)).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/95 p-7 shadow-card animate-fade-up">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      {/* Header */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Roadmap execution
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Your roadmap to {career}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check off steps as you turn this recommendation into portfolio progress.
            </p>
          </div>
        </div>
        <Link
          to="/assessment"
          id="btn-retake-tracker"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/45 px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retake assessment
        </Link>
      </div>

      {/* Progress bar */}
      <div className="relative mt-6 rounded-2xl border border-border/70 bg-background/45 p-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {doneCount} of {items.length} completed
          </span>
          <span className="font-display text-xl font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <ul className="relative mt-6 grid gap-2 md:grid-cols-2">
        {items.map((item) => {
          const done = doneSet.has(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onToggle(item)}
                className="group flex h-full w-full items-center gap-3 rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-left transition-colors hover:bg-accent/50"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 flex-shrink-0 text-border group-hover:text-muted-foreground" />
                )}
                <span
                  className={
                    done
                      ? "text-sm text-muted-foreground line-through decoration-muted-foreground/40"
                      : "text-sm font-medium text-foreground"
                  }
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {pct === 100 && (
        <p className="relative mt-5 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          Roadmap complete. You are well on your way to becoming a {career}.
        </p>
      )}
    </div>
  );
}
