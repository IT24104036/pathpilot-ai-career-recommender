// ─── careers.ts ───────────────────────────────────────────────────────────────
// Static presentation metadata for each career the backend can recommend.
// Match scores / rankings come from the backend (POST /api/assess); this file
// only supplies display copy. Shared by the results page and the dashboard so
// the two never drift apart.

export interface CareerMeta {
  description: string;
  tags: string[];
  salaryRange: string;
  roadmap: string[];
  color: string;
}

export const CAREER_META: Record<string, CareerMeta> = {
  "Data Analyst": {
    description:
      "Turn raw data into clear insights with SQL, spreadsheets, and visualization tools.",
    tags: ["Data", "Analytics", "SQL"],
    salaryRange: "$60k – $120k",
    roadmap: [
      "Master SQL & Excel",
      "Learn Python for data",
      "Build a Power BI / Tableau dashboard",
    ],
    color: "from-amber-500 to-orange-600",
  },
  "Data Scientist": {
    description:
      "Find patterns and build predictive models using statistics, Python, and machine learning.",
    tags: ["Data", "ML", "Statistics"],
    salaryRange: "$90k – $160k",
    roadmap: [
      "Strengthen statistics",
      "Learn pandas & scikit-learn",
      "Ship an end-to-end ML notebook",
    ],
    color: "from-cyan-500 to-blue-600",
  },
  "Machine Learning Engineer": {
    description:
      "Take ML models from notebook to production — training, serving, and scaling them reliably.",
    tags: ["ML", "Engineering", "Python"],
    salaryRange: "$100k – $185k",
    roadmap: ["Master Python & DS&A", "Learn PyTorch/TensorFlow", "Deploy a model with an API"],
    color: "from-fuchsia-500 to-purple-600",
  },
  "Software Engineer": {
    description:
      "Design and build software systems. High demand, remote-friendly, and well-compensated.",
    tags: ["Tech", "Remote", "High Growth"],
    salaryRange: "$80k – $180k",
    roadmap: ["Learn data structures", "Build 3 portfolio projects", "Contribute to open source"],
    color: "from-violet-500 to-indigo-600",
  },
  "Business Analyst": {
    description:
      "Bridge IT and business — gather requirements, model processes, and turn data into decisions.",
    tags: ["Business", "Strategy", "Analysis"],
    salaryRange: "$65k – $115k",
    roadmap: [
      "Learn requirements gathering",
      "Master SQL & BI tools",
      "Study a domain (finance/ops)",
    ],
    color: "from-sky-500 to-blue-600",
  },
  "UI/UX Designer": {
    description:
      "Craft intuitive, beautiful product experiences through research, wireframing, and visual design.",
    tags: ["Design", "Creative", "Research"],
    salaryRange: "$60k – $130k",
    roadmap: ["Learn Figma", "Study UX principles", "Build a portfolio of case studies"],
    color: "from-pink-500 to-rose-600",
  },
  "Cybersecurity Analyst": {
    description:
      "Defend systems and data from threats through monitoring, analysis, and security tooling.",
    tags: ["Security", "Networking", "High Demand"],
    salaryRange: "$75k – $160k",
    roadmap: ["Learn networking & Linux", "Study Security+ topics", "Practice on CTF / TryHackMe"],
    color: "from-slate-500 to-zinc-700",
  },
  "Cloud / DevOps Engineer": {
    description:
      "Automate, deploy, and scale infrastructure with cloud platforms, containers, and CI/CD.",
    tags: ["Cloud", "DevOps", "Automation"],
    salaryRange: "$90k – $175k",
    roadmap: [
      "Learn Linux & networking",
      "Get hands-on with AWS/Azure",
      "Build a CI/CD pipeline with Docker",
    ],
    color: "from-teal-500 to-emerald-600",
  },
  "Project Manager": {
    description:
      "Lead tech teams to deliver — driving scope, timelines, and execution across stakeholders.",
    tags: ["Leadership", "Agile", "Delivery"],
    salaryRange: "$90k – $170k",
    roadmap: ["Study Agile/Scrum", "Take a PM certification", "Lead a small project end-to-end"],
    color: "from-emerald-500 to-green-600",
  },
};

export const FALLBACK_META: CareerMeta = {
  description: "A great-fit career based on your assessment.",
  tags: ["Recommended"],
  salaryRange: "—",
  roadmap: ["Explore this path", "Build relevant skills", "Create a portfolio"],
  color: "from-primary to-teal",
};

export function metaFor(title: string): CareerMeta {
  return CAREER_META[title] ?? FALLBACK_META;
}

export interface RankedCareer {
  title: string;
  score: number;
}

/** Rank careers by their match score, highest first. */
export function rankCareers(matchScores?: Record<string, number>): RankedCareer[] {
  if (!matchScores) return [];
  return Object.entries(matchScores)
    .map(([title, score]) => ({ title, score: Number(score) || 0 }))
    .sort((a, b) => b.score - a.score);
}

/** Highest match score in a result (0 if none). */
export function topScore(matchScores?: Record<string, number>): number {
  const ranked = rankCareers(matchScores);
  return ranked.length > 0 ? ranked[0].score : 0;
}
