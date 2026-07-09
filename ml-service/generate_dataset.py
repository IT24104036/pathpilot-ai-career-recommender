"""
PathPilot — Synthetic dataset generator
========================================
Generates a balanced, rule-based/generative training dataset for the IT career
recommender, encoded EXACTLY per ml-service/ENCODING_SPEC.md (v1).

Output : dataset/career_dataset.csv   (5000 rows, 53 features + career_path)

Generation strategy
-------------------
- Balanced across the 9 career classes.
- Each career has strong signal patterns (career-specific answer distributions).
- ~17% noise (random overrides / bit-flips) so classes overlap realistically.
- ~5% "ambiguous" rows blended with an adjacent career (hard examples).

This script ONLY generates + validates the dataset. No model training.
"""

import os
import random
import numpy as np
import pandas as pd

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

N_ROWS = 5000
NOISE = 0.17          # ~15–20% noise
AMBIGUOUS_FRAC = 0.05  # ~5% blended/ambiguous rows

# ── Canonical answer option lists (must match ENCODING_SPEC.md exactly) ─────────
FIELD_OF_STUDY = [
    "Computer Science", "Software Engineering", "Information Systems / IT",
    "Data Science", "Cybersecurity", "Other IT field",
]
STATUS = [
    "1st / 2nd year undergraduate", "3rd year undergraduate",
    "Final year undergraduate", "Recent graduate", "Postgraduate / Masters",
]
MODULES = [
    "Algorithms & Data Structures", "Databases & SQL", "Statistics & Math",
    "Web & App Development", "Networking & Security", "UI/UX & Design",
    "Machine Learning & AI", "Cloud Computing", "Project & Business Management",
]
CODING = [
    "I love coding", "Comfortable with code", "Neutral about coding",
    "I prefer minimal coding", "I'd rather avoid coding",
]
SKILLS = [
    "Programming", "Data Analysis", "Machine Learning", "Cloud & DevOps",
    "Cybersecurity", "Design & Prototyping", "Communication & Leadership",
    "Business Analysis",
]
ACTIVITIES = [
    "Analyzing data & finding patterns", "Building apps & software",
    "Training ML / AI models", "Designing user interfaces",
    "Securing systems & networks", "Working with cloud & infrastructure",
    "Planning & coordinating projects", "Solving business problems",
]
PROBLEM_STYLE = [
    "Data & logic puzzles", "Building & coding challenges",
    "Visual & design problems", "Security & investigation",
    "People & coordination", "Business & strategy",
]
WORK_STYLE = [
    "Independent / remote", "Collaborative team", "Fast-paced startup",
    "Structured corporate", "Research-focused",
]
PERSONALITY = [
    "Analytical", "Creative", "Detail-oriented", "Curious",
    "Leader", "Problem-solver", "Communicator", "Persistent",
]
WORK_PREF = [
    "Highly structured & predictable", "Mostly structured", "A balance of both",
    "Mostly flexible", "Highly flexible & creative",
]

# ── Encoded column names (ENCODING_SPEC.md §13) ────────────────────────────────
FOS_COLS   = ["fos_cs", "fos_se", "fos_is", "fos_ds", "fos_cyber", "fos_other"]
MOD_COLS   = ["mod_algorithms", "mod_databases", "mod_statistics", "mod_webdev",
              "mod_networking", "mod_uiux", "mod_mlai", "mod_cloud", "mod_projbusiness"]
SKILL_COLS = ["skill_programming", "skill_data_analysis", "skill_ml", "skill_cloud_devops",
              "skill_security", "skill_design", "skill_comm_leadership", "skill_business"]
ACT_COLS   = ["act_data_patterns", "act_build_apps", "act_train_ml", "act_design_ui",
              "act_secure_systems", "act_cloud_infra", "act_plan_projects", "act_business_problems"]
PS_COLS    = ["ps_data_logic", "ps_build_code", "ps_visual_design",
              "ps_security", "ps_people_coord", "ps_business"]
WE_COLS    = ["we_independent", "we_collaborative", "we_startup", "we_corporate", "we_research"]
TRAIT_COLS = ["trait_analytical", "trait_creative", "trait_detail", "trait_curious",
              "trait_leader", "trait_problem_solver", "trait_communicator", "trait_persistent"]

COLUMNS = (
    ["academic_status", "coding_comfort", "work_flexibility"]
    + FOS_COLS + MOD_COLS + SKILL_COLS + ACT_COLS + PS_COLS + WE_COLS + TRAIT_COLS
    + ["career_path"]
)

CAREERS = [
    "Data Analyst", "Data Scientist", "Machine Learning Engineer",
    "Software Engineer", "Business Analyst", "UI/UX Designer",
    "Cybersecurity Analyst", "Cloud / DevOps Engineer", "Project Manager",
]

# Adjacent / easily-confused careers (used for the ~5% ambiguous blends)
ADJACENT = {
    "Data Analyst": "Data Scientist",
    "Data Scientist": "Machine Learning Engineer",
    "Machine Learning Engineer": "Software Engineer",
    "Software Engineer": "Machine Learning Engineer",
    "Business Analyst": "Project Manager",
    "UI/UX Designer": "Software Engineer",
    "Cybersecurity Analyst": "Cloud / DevOps Engineer",
    "Cloud / DevOps Engineer": "Cybersecurity Analyst",
    "Project Manager": "Business Analyst",
}

# Academic status is a weak signal — shared distribution across careers.
STATUS_WEIGHTS = {
    "1st / 2nd year undergraduate": 0.12, "3rd year undergraduate": 0.20,
    "Final year undergraduate": 0.28, "Recent graduate": 0.28,
    "Postgraduate / Masters": 0.12,
}

# ── Per-career generative profiles ─────────────────────────────────────────────
# single fields: weight dicts (unlisted options get a small default weight)
# multi  fields: inclusion-probability dicts (unlisted options get `MULTI_BASE`)
MULTI_BASE = 0.07
SINGLE_DEFAULT = 0.02

PROFILES = {
    "Data Analyst": {
        "fos": {"Information Systems / IT": .30, "Data Science": .25, "Computer Science": .20, "Other IT field": .15, "Software Engineering": .05, "Cybersecurity": .05},
        "coding": {"I love coding": .12, "Comfortable with code": .45, "Neutral about coding": .33, "I prefer minimal coding": .08, "I'd rather avoid coding": .02},
        "wpref": {"Highly structured & predictable": .22, "Mostly structured": .33, "A balance of both": .30, "Mostly flexible": .12, "Highly flexible & creative": .03},
        "pstyle": {"Data & logic puzzles": .72, "Business & strategy": .16, "Building & coding challenges": .07},
        "wstyle": {"Collaborative team": .33, "Structured corporate": .33, "Independent / remote": .22, "Research-focused": .07},
        "modules": {"Databases & SQL": .85, "Statistics & Math": .80, "Project & Business Management": .30, "Algorithms & Data Structures": .25},
        "skills": {"Data Analysis": .90, "Business Analysis": .35, "Programming": .30},
        "acts": {"Analyzing data & finding patterns": .90, "Solving business problems": .30},
        "traits": {"Analytical": .85, "Detail-oriented": .60, "Curious": .40},
    },
    "Data Scientist": {
        "fos": {"Data Science": .40, "Computer Science": .25, "Information Systems / IT": .15, "Software Engineering": .10, "Other IT field": .07, "Cybersecurity": .03},
        "coding": {"I love coding": .25, "Comfortable with code": .50, "Neutral about coding": .20, "I prefer minimal coding": .04, "I'd rather avoid coding": .01},
        "wpref": {"Highly structured & predictable": .12, "Mostly structured": .25, "A balance of both": .35, "Mostly flexible": .22, "Highly flexible & creative": .06},
        "pstyle": {"Data & logic puzzles": .78, "Building & coding challenges": .14},
        "wstyle": {"Research-focused": .40, "Collaborative team": .25, "Independent / remote": .22, "Structured corporate": .08},
        "modules": {"Statistics & Math": .85, "Machine Learning & AI": .80, "Databases & SQL": .45, "Algorithms & Data Structures": .40},
        "skills": {"Data Analysis": .85, "Machine Learning": .80, "Programming": .45},
        "acts": {"Analyzing data & finding patterns": .80, "Training ML / AI models": .70},
        "traits": {"Analytical": .85, "Curious": .70, "Problem-solver": .45},
    },
    "Machine Learning Engineer": {
        "fos": {"Computer Science": .35, "Data Science": .30, "Software Engineering": .20, "Other IT field": .08, "Information Systems / IT": .05, "Cybersecurity": .02},
        "coding": {"I love coding": .60, "Comfortable with code": .32, "Neutral about coding": .06, "I prefer minimal coding": .015, "I'd rather avoid coding": .005},
        "wpref": {"Highly structured & predictable": .08, "Mostly structured": .20, "A balance of both": .34, "Mostly flexible": .28, "Highly flexible & creative": .10},
        "pstyle": {"Building & coding challenges": .58, "Data & logic puzzles": .32},
        "wstyle": {"Independent / remote": .30, "Research-focused": .30, "Fast-paced startup": .22, "Collaborative team": .15},
        "modules": {"Machine Learning & AI": .85, "Algorithms & Data Structures": .75, "Statistics & Math": .50, "Web & App Development": .30},
        "skills": {"Machine Learning": .85, "Programming": .85, "Data Analysis": .40, "Cloud & DevOps": .30},
        "acts": {"Training ML / AI models": .85, "Building apps & software": .55},
        "traits": {"Analytical": .75, "Problem-solver": .70, "Persistent": .50, "Curious": .45},
    },
    "Software Engineer": {
        "fos": {"Software Engineering": .40, "Computer Science": .40, "Information Systems / IT": .10, "Other IT field": .07, "Data Science": .02, "Cybersecurity": .01},
        "coding": {"I love coding": .65, "Comfortable with code": .30, "Neutral about coding": .04, "I prefer minimal coding": .009, "I'd rather avoid coding": .001},
        "wpref": {"Highly structured & predictable": .08, "Mostly structured": .22, "A balance of both": .35, "Mostly flexible": .27, "Highly flexible & creative": .08},
        "pstyle": {"Building & coding challenges": .74, "Data & logic puzzles": .16},
        "wstyle": {"Independent / remote": .35, "Fast-paced startup": .25, "Collaborative team": .25, "Research-focused": .07},
        "modules": {"Web & App Development": .85, "Algorithms & Data Structures": .80, "Databases & SQL": .45, "Cloud Computing": .30},
        "skills": {"Programming": .95, "Cloud & DevOps": .30, "Data Analysis": .20},
        "acts": {"Building apps & software": .90},
        "traits": {"Problem-solver": .80, "Persistent": .60, "Analytical": .50, "Creative": .30},
    },
    "Business Analyst": {
        "fos": {"Information Systems / IT": .40, "Other IT field": .20, "Computer Science": .15, "Data Science": .10, "Software Engineering": .10, "Cybersecurity": .05},
        "coding": {"I love coding": .03, "Comfortable with code": .20, "Neutral about coding": .40, "I prefer minimal coding": .27, "I'd rather avoid coding": .10},
        "wpref": {"Highly structured & predictable": .28, "Mostly structured": .35, "A balance of both": .25, "Mostly flexible": .10, "Highly flexible & creative": .02},
        "pstyle": {"Business & strategy": .70, "People & coordination": .18, "Data & logic puzzles": .08},
        "wstyle": {"Structured corporate": .42, "Collaborative team": .35, "Independent / remote": .15},
        "modules": {"Project & Business Management": .85, "Databases & SQL": .50, "Statistics & Math": .30},
        "skills": {"Business Analysis": .90, "Communication & Leadership": .70, "Data Analysis": .40},
        "acts": {"Solving business problems": .90, "Planning & coordinating projects": .40, "Analyzing data & finding patterns": .35},
        "traits": {"Communicator": .80, "Analytical": .60, "Detail-oriented": .40},
    },
    "UI/UX Designer": {
        "fos": {"Other IT field": .35, "Computer Science": .20, "Information Systems / IT": .20, "Software Engineering": .15, "Data Science": .05, "Cybersecurity": .05},
        "coding": {"I love coding": .05, "Comfortable with code": .25, "Neutral about coding": .35, "I prefer minimal coding": .25, "I'd rather avoid coding": .10},
        "wpref": {"Highly structured & predictable": .05, "Mostly structured": .15, "A balance of both": .30, "Mostly flexible": .35, "Highly flexible & creative": .15},
        "pstyle": {"Visual & design problems": .80, "People & coordination": .12},
        "wstyle": {"Fast-paced startup": .30, "Collaborative team": .30, "Independent / remote": .25, "Research-focused": .05},
        "modules": {"UI/UX & Design": .90, "Web & App Development": .45},
        "skills": {"Design & Prototyping": .90, "Communication & Leadership": .35},
        "acts": {"Designing user interfaces": .90, "Building apps & software": .30},
        "traits": {"Creative": .85, "Detail-oriented": .50, "Curious": .40, "Communicator": .35},
    },
    "Cybersecurity Analyst": {
        "fos": {"Cybersecurity": .45, "Computer Science": .20, "Information Systems / IT": .15, "Software Engineering": .10, "Other IT field": .08, "Data Science": .02},
        "coding": {"I love coding": .15, "Comfortable with code": .40, "Neutral about coding": .30, "I prefer minimal coding": .12, "I'd rather avoid coding": .03},
        "wpref": {"Highly structured & predictable": .25, "Mostly structured": .35, "A balance of both": .28, "Mostly flexible": .10, "Highly flexible & creative": .02},
        "pstyle": {"Security & investigation": .80, "Data & logic puzzles": .12},
        "wstyle": {"Structured corporate": .40, "Independent / remote": .25, "Research-focused": .20, "Collaborative team": .15},
        "modules": {"Networking & Security": .90, "Algorithms & Data Structures": .30},
        "skills": {"Cybersecurity": .90, "Programming": .30, "Cloud & DevOps": .25},
        "acts": {"Securing systems & networks": .90},
        "traits": {"Detail-oriented": .75, "Analytical": .65, "Persistent": .45},
    },
    "Cloud / DevOps Engineer": {
        "fos": {"Computer Science": .30, "Information Systems / IT": .25, "Software Engineering": .20, "Cybersecurity": .12, "Other IT field": .10, "Data Science": .03},
        "coding": {"I love coding": .30, "Comfortable with code": .45, "Neutral about coding": .18, "I prefer minimal coding": .05, "I'd rather avoid coding": .02},
        "wpref": {"Highly structured & predictable": .18, "Mostly structured": .32, "A balance of both": .32, "Mostly flexible": .15, "Highly flexible & creative": .03},
        "pstyle": {"Building & coding challenges": .55, "Security & investigation": .20, "Data & logic puzzles": .15},
        "wstyle": {"Structured corporate": .40, "Independent / remote": .30, "Collaborative team": .20, "Research-focused": .05},
        "modules": {"Cloud Computing": .90, "Networking & Security": .55, "Algorithms & Data Structures": .30},
        "skills": {"Cloud & DevOps": .90, "Programming": .55, "Cybersecurity": .30},
        "acts": {"Working with cloud & infrastructure": .90, "Building apps & software": .40},
        "traits": {"Problem-solver": .70, "Persistent": .60, "Analytical": .50, "Detail-oriented": .45},
    },
    "Project Manager": {
        "fos": {"Information Systems / IT": .35, "Other IT field": .25, "Computer Science": .15, "Software Engineering": .12, "Cybersecurity": .08, "Data Science": .05},
        "coding": {"I love coding": .02, "Comfortable with code": .12, "Neutral about coding": .35, "I prefer minimal coding": .35, "I'd rather avoid coding": .16},
        "wpref": {"Highly structured & predictable": .25, "Mostly structured": .38, "A balance of both": .27, "Mostly flexible": .08, "Highly flexible & creative": .02},
        "pstyle": {"People & coordination": .74, "Business & strategy": .18},
        "wstyle": {"Collaborative team": .45, "Structured corporate": .35, "Fast-paced startup": .12, "Independent / remote": .08},
        "modules": {"Project & Business Management": .90, "Databases & SQL": .25},
        "skills": {"Communication & Leadership": .90, "Business Analysis": .60},
        "acts": {"Planning & coordinating projects": .90, "Solving business problems": .50},
        "traits": {"Leader": .85, "Communicator": .75, "Persistent": .40},
    },
}

# ── Sampling helpers ───────────────────────────────────────────────────────────
def weights_for(options, weight_dict, default=SINGLE_DEFAULT):
    return [weight_dict.get(opt, default) for opt in options]


def single_choice(options, weight_dict):
    """Weighted pick, with NOISE chance of a uniformly-random override."""
    if random.random() < NOISE:
        return random.choice(options)
    return random.choices(options, weights=weights_for(options, weight_dict), k=1)[0]


def multi_choice(options, prob_dict, base=MULTI_BASE):
    """Independent Bernoulli per option, +1 noise toggle, >=1 selected."""
    selected = [o for o in options if random.random() < prob_dict.get(o, base)]
    if random.random() < NOISE:  # noise: toggle one random option
        o = random.choice(options)
        if o in selected:
            if len(selected) > 1:
                selected.remove(o)
        else:
            selected.append(o)
    if not selected:  # guarantee at least one selection
        selected = [max(options, key=lambda o: prob_dict.get(o, base))]
    return selected


def field_source(primary, partner):
    """For ambiguous rows, randomly draw each field from primary OR partner."""
    if partner is not None and random.random() < 0.5:
        return PROFILES[partner]
    return PROFILES[primary]


def generate_answers(primary, partner=None):
    """Return a dict of raw assessment answers for one synthetic respondent."""
    return {
        "field_of_study": single_choice(FIELD_OF_STUDY, field_source(primary, partner)["fos"]),
        "status": single_choice(STATUS, STATUS_WEIGHTS),
        "modules": multi_choice(MODULES, field_source(primary, partner)["modules"]),
        "coding": single_choice(CODING, field_source(primary, partner)["coding"]),
        "skills": multi_choice(SKILLS, field_source(primary, partner)["skills"]),
        "activities": multi_choice(ACTIVITIES, field_source(primary, partner)["acts"]),
        "problemStyle": single_choice(PROBLEM_STYLE, field_source(primary, partner)["pstyle"]),
        "workStyle": single_choice(WORK_STYLE, field_source(primary, partner)["wstyle"]),
        "personality": multi_choice(PERSONALITY, field_source(primary, partner)["traits"]),
        "workPreference": single_choice(WORK_PREF, field_source(primary, partner)["wpref"]),
    }


def encode(answers, career):
    """Encode raw answers -> the 53-feature row + label, per ENCODING_SPEC.md."""
    row = {}
    # ordinals
    row["academic_status"] = STATUS.index(answers["status"])
    row["coding_comfort"] = 4 - CODING.index(answers["coding"])          # love=4 … avoid=0
    row["work_flexibility"] = WORK_PREF.index(answers["workPreference"])  # structured=0 … flexible=4
    # one-hot
    for col, opt in zip(FOS_COLS, FIELD_OF_STUDY):
        row[col] = int(answers["field_of_study"] == opt)
    for col, opt in zip(PS_COLS, PROBLEM_STYLE):
        row[col] = int(answers["problemStyle"] == opt)
    for col, opt in zip(WE_COLS, WORK_STYLE):
        row[col] = int(answers["workStyle"] == opt)
    # multi-hot
    for col, opt in zip(MOD_COLS, MODULES):
        row[col] = int(opt in answers["modules"])
    for col, opt in zip(SKILL_COLS, SKILLS):
        row[col] = int(opt in answers["skills"])
    for col, opt in zip(ACT_COLS, ACTIVITIES):
        row[col] = int(opt in answers["activities"])
    for col, opt in zip(TRAIT_COLS, PERSONALITY):
        row[col] = int(opt in answers["personality"])
    # label
    row["career_path"] = career
    return row


def class_counts(total, n_classes):
    """Balanced counts that sum exactly to `total`."""
    base = total // n_classes
    counts = [base] * n_classes
    for i in range(total - base * n_classes):
        counts[i] += 1
    return counts


def main():
    rows = []
    counts = class_counts(N_ROWS, len(CAREERS))
    for career, n in zip(CAREERS, counts):
        for _ in range(n):
            ambiguous = random.random() < AMBIGUOUS_FRAC
            partner = ADJACENT[career] if ambiguous else None
            rows.append(encode(generate_answers(career, partner), career))

    random.shuffle(rows)
    df = pd.DataFrame(rows, columns=COLUMNS)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "dataset")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.abspath(os.path.join(out_dir, "career_dataset.csv"))
    df.to_csv(out_path, index=False)

    # ── Validation report ──
    print("=" * 60)
    print("PathPilot synthetic dataset — generated")
    print("=" * 60)
    print(f"\nDataset shape: {df.shape}  (expected: ({N_ROWS}, {len(COLUMNS)}))")
    print(f"Feature count: {len(COLUMNS) - 1}  |  Label: 'career_path'")

    print("\nClass distribution:")
    print(df["career_path"].value_counts().sort_index().to_string())

    print("\nFirst 5 rows:")
    with pd.option_context("display.max_columns", None, "display.width", 200):
        print(df.head().to_string())

    total_missing = int(df.isnull().sum().sum())
    print(f"\nMissing values (total): {total_missing}")

    print(f"\nOutput file path: {out_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
