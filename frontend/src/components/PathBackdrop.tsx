type PathBackdropTone = "standard" | "editorial" | "admin";

const toneClasses: Record<PathBackdropTone, string> = {
  standard: "from-primary/12 via-teal/10 to-gold/10",
  editorial: "from-primary/10 via-gold/10 to-primary/5",
  admin: "from-primary/10 via-violet-500/10 to-teal/10",
};

export function PathBackdrop({
  tone = "standard",
  className = "",
}: {
  tone?: PathBackdropTone;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[tone]} opacity-70`} />
      <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-primary/12 blur-[120px]" />
      <div className="absolute right-[-8rem] top-1/4 h-96 w-96 rounded-full bg-gold/12 blur-[130px]" />
      <div className="absolute bottom-[-9rem] left-1/4 h-96 w-96 rounded-full bg-teal/10 blur-[140px]" />
      <div className="absolute inset-0 bg-dots text-foreground/[0.035]" />
      <svg
        className="absolute inset-x-0 top-0 h-full w-full opacity-70"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1200"
      >
        <path
          d="M-80 240 C 250 120, 410 420, 720 300 S 1160 100, 1520 290"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.13"
          strokeWidth="1.5"
          strokeDasharray="3 11"
        />
        <path
          d="M-90 820 C 220 720, 520 980, 820 830 S 1200 620, 1520 790"
          fill="none"
          stroke="var(--gold)"
          strokeOpacity="0.16"
          strokeWidth="1.5"
          strokeDasharray="3 12"
        />
        <circle cx="720" cy="300" r="4" fill="var(--primary)" opacity="0.22" />
        <circle cx="1040" cy="690" r="4" fill="var(--gold)" opacity="0.2" />
      </svg>
      <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
