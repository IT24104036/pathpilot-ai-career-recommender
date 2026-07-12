// ─── roadmaps.ts ──────────────────────────────────────────────────────────────
// Rule-based Career Progress Tracker checklists (NOT ML). Each career has a short,
// practical roadmap of skills/milestones a student can check off. Keyed by the
// exact career names the model/backend use.

export const CAREER_CHECKLISTS: Record<string, string[]> = {
  "Data Analyst": [
    "Master SQL (SELECT, JOIN, GROUP BY)",
    "Get fluent with Excel / Google Sheets",
    "Learn Python for data (pandas)",
    "Build a Power BI or Tableau dashboard",
    "Practice descriptive statistics",
    "Ship a portfolio data-analysis project",
  ],
  "Data Scientist": [
    "Strengthen statistics & probability",
    "Learn pandas & NumPy",
    "Study core ML with scikit-learn",
    "Practice data cleaning & feature engineering",
    "Complete an end-to-end ML notebook",
    "Share a Kaggle or portfolio project",
  ],
  "Machine Learning Engineer": [
    "Master a language (Python) + data structures",
    "Learn PyTorch or TensorFlow",
    "Understand core ML algorithms",
    "Train and evaluate a model properly",
    "Serve a model behind an API",
    "Learn the basics of MLOps / deployment",
  ],
  "Software Engineer": [
    "Master data structures & algorithms",
    "Get comfortable with Git & GitHub",
    "Build 3 portfolio projects",
    "Learn REST APIs & databases",
    "Study system-design fundamentals",
    "Contribute to an open-source repo",
  ],
  "Business Analyst": [
    "Learn requirements gathering",
    "Master Excel & a BI tool",
    "Get comfortable with SQL",
    "Practice process modeling (BPMN)",
    "Study a domain (finance / operations)",
    "Document a real case study",
  ],
  "UI/UX Designer": [
    "Learn Figma",
    "Study UX & usability principles",
    "Practice wireframing & prototyping",
    "Run a basic user-research session",
    "Build a design case study",
    "Publish a portfolio of 3 projects",
  ],
  "Cybersecurity Analyst": [
    "Learn networking fundamentals",
    "Get comfortable with Linux",
    "Study Security+ topics",
    "Practice threat analysis & monitoring",
    "Try TryHackMe / CTF challenges",
    "Learn a SIEM tool basics",
  ],
  "Cloud / DevOps Engineer": [
    "Learn Linux & networking",
    "Get hands-on with AWS or Azure",
    "Learn Docker & containers",
    "Build a CI/CD pipeline",
    "Study Kubernetes basics",
    "Automate with a scripting language",
  ],
  "Project Manager": [
    "Study Agile & Scrum",
    "Take a PM certification (CAPM / PSM)",
    "Learn stakeholder management",
    "Practice roadmapping & prioritization",
    "Get comfortable with Jira",
    "Lead a small project end-to-end",
  ],
};

const FALLBACK_CHECKLIST = [
  "Identify the core skills for this path",
  "Complete an online course",
  "Build a portfolio project",
  "Practice with real problems",
  "Get feedback from a mentor",
];

/** Rule-based checklist for a career (safe fallback for unknown careers). */
export function careerChecklist(career: string): string[] {
  return CAREER_CHECKLISTS[career] ?? FALLBACK_CHECKLIST;
}
