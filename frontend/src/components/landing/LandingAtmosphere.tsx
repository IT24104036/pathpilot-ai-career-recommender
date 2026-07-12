// Decorative, non-interactive backdrop for the landing page. Generated SVG +
// CSS only — adds warmth and depth so the ivory canvas never reads as flat white.
export function LandingAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Soft colour auras */}
      <div className="absolute -left-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-primary/12 blur-[120px]" />
      <div className="absolute right-[-10rem] top-[16%] h-[28rem] w-[28rem] rounded-full bg-gold/14 blur-[130px]" />
      <div className="absolute bottom-[8%] left-[10%] h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-[130px]" />
      <div className="absolute left-[48%] top-[42%] h-[22rem] w-[22rem] rounded-full bg-primary/7 blur-[120px]" />

      {/* Faint dotted grid */}
      <div className="absolute inset-0 bg-dots text-foreground/[0.045]" />

      {/* Drifting "flight path" lines — the PathPilot navigation motif */}
      <svg
        className="absolute inset-x-0 top-0 h-full w-full opacity-[0.65]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1600"
      >
        <path
          d="M-50 300 C 300 200, 500 460, 760 380 S 1200 180, 1500 360"
          fill="none"
          stroke="var(--gold)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
          strokeDasharray="2 9"
        />
        <path
          d="M180 40 C 420 260, 270 520, 610 620 S 1020 520, 1260 780"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.1"
          strokeWidth="1.5"
          strokeDasharray="3 12"
        />
        <path
          d="M-50 1050 C 280 980, 560 1180, 820 1080 S 1240 900, 1500 1060"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.12"
          strokeWidth="1.5"
          strokeDasharray="2 9"
        />
        <circle cx="760" cy="380" r="4" fill="var(--gold)" opacity="0.24" />
        <circle cx="610" cy="620" r="4" fill="var(--primary)" opacity="0.18" />
        <circle cx="820" cy="1080" r="4" fill="var(--primary)" opacity="0.16" />
      </svg>

      {/* Fine grain for a premium, non-flat surface */}
      <div className="absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />
    </div>
  );
}
