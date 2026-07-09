"""
PathPilot — Step 4A: Local prediction script
=============================================
Loads the saved model artifacts and predicts a career from raw assessment
answers (the exact frontend strings), encoding them per ENCODING_SPEC.md.

Artifacts:
  ml-service/model/career_model.pkl
  ml-service/model/label_encoder.pkl
  ml-service/model/feature_columns.pkl

This is a LOCAL test only — no backend, no API, no retraining.
Run:  python ml-service/predict.py
"""

import os

import pandas as pd
import joblib

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "model")

# ── Load artifacts once ────────────────────────────────────────────────────────
MODEL = joblib.load(os.path.join(MODEL_DIR, "career_model.pkl"))
LABEL_ENCODER = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
FEATURE_COLUMNS = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))

# ── Encoding maps (must match ENCODING_SPEC.md v1 exactly) ──────────────────────
STATUS = [
    "1st / 2nd year undergraduate", "3rd year undergraduate",
    "Final year undergraduate", "Recent graduate", "Postgraduate / Masters",
]  # academic_status = index (0–4)

CODING = [
    "I love coding", "Comfortable with code", "Neutral about coding",
    "I prefer minimal coding", "I'd rather avoid coding",
]  # coding_comfort = 4 - index  (love=4 … avoid=0)

WORK_PREF = [
    "Highly structured & predictable", "Mostly structured", "A balance of both",
    "Mostly flexible", "Highly flexible & creative",
]  # work_flexibility = index (0–4)

FOS_MAP = {
    "Computer Science": "fos_cs", "Software Engineering": "fos_se",
    "Information Systems / IT": "fos_is", "Data Science": "fos_ds",
    "Cybersecurity": "fos_cyber", "Other IT field": "fos_other",
}
MOD_MAP = {
    "Algorithms & Data Structures": "mod_algorithms", "Databases & SQL": "mod_databases",
    "Statistics & Math": "mod_statistics", "Web & App Development": "mod_webdev",
    "Networking & Security": "mod_networking", "UI/UX & Design": "mod_uiux",
    "Machine Learning & AI": "mod_mlai", "Cloud Computing": "mod_cloud",
    "Project & Business Management": "mod_projbusiness",
}
SKILL_MAP = {
    "Programming": "skill_programming", "Data Analysis": "skill_data_analysis",
    "Machine Learning": "skill_ml", "Cloud & DevOps": "skill_cloud_devops",
    "Cybersecurity": "skill_security", "Design & Prototyping": "skill_design",
    "Communication & Leadership": "skill_comm_leadership", "Business Analysis": "skill_business",
}
ACT_MAP = {
    "Analyzing data & finding patterns": "act_data_patterns",
    "Building apps & software": "act_build_apps", "Training ML / AI models": "act_train_ml",
    "Designing user interfaces": "act_design_ui", "Securing systems & networks": "act_secure_systems",
    "Working with cloud & infrastructure": "act_cloud_infra",
    "Planning & coordinating projects": "act_plan_projects",
    "Solving business problems": "act_business_problems",
}
PS_MAP = {
    "Data & logic puzzles": "ps_data_logic", "Building & coding challenges": "ps_build_code",
    "Visual & design problems": "ps_visual_design", "Security & investigation": "ps_security",
    "People & coordination": "ps_people_coord", "Business & strategy": "ps_business",
}
WE_MAP = {
    "Independent / remote": "we_independent", "Collaborative team": "we_collaborative",
    "Fast-paced startup": "we_startup", "Structured corporate": "we_corporate",
    "Research-focused": "we_research",
}
TRAIT_MAP = {
    "Analytical": "trait_analytical", "Creative": "trait_creative",
    "Detail-oriented": "trait_detail", "Curious": "trait_curious", "Leader": "trait_leader",
    "Problem-solver": "trait_problem_solver", "Communicator": "trait_communicator",
    "Persistent": "trait_persistent",
}


def _ordinal(value, options):
    """Index of value in options, or 0 if missing/unknown (per spec)."""
    return options.index(value) if value in options else 0


def encode_answers(answers: dict) -> pd.DataFrame:
    """
    Convert raw frontend answers into the fixed 53-feature vector (1-row DataFrame),
    ordered per feature_columns.pkl. `careerPreference` is intentionally excluded
    (label leakage). Unknown/missing values encode to 0 / all-zeros.
    """
    row = {col: 0 for col in FEATURE_COLUMNS}

    # ordinals
    row["academic_status"] = _ordinal(answers.get("status"), STATUS)
    row["work_flexibility"] = _ordinal(answers.get("workPreference"), WORK_PREF)
    coding = answers.get("coding")
    row["coding_comfort"] = (4 - CODING.index(coding)) if coding in CODING else 0

    # single-select one-hot
    for value, mapping in [
        (answers.get("field_of_study"), FOS_MAP),
        (answers.get("problemStyle"), PS_MAP),
        (answers.get("workStyle"), WE_MAP),
    ]:
        col = mapping.get(value)
        if col:
            row[col] = 1

    # multi-select multi-hot
    for key, mapping in [
        ("modules", MOD_MAP), ("skills", SKILL_MAP),
        ("activities", ACT_MAP), ("personality", TRAIT_MAP),
    ]:
        for value in answers.get(key, []) or []:
            col = mapping.get(value)
            if col:
                row[col] = 1

    # careerPreference is NOT encoded (excluded — leakage).
    return pd.DataFrame([row])[FEATURE_COLUMNS]


def predict_career(answers: dict) -> dict:
    """Return top career, confidence, top-3, and all match scores (%)."""
    X = encode_answers(answers)
    proba = MODEL.predict_proba(X)[0]

    # Map each model class index -> career name + percentage.
    scores = {}
    for idx, cls_int in enumerate(MODEL.classes_):
        name = LABEL_ENCODER.inverse_transform([cls_int])[0]
        scores[name] = round(float(proba[idx]) * 100, 2)

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    return {
        "topCareer": ranked[0][0],
        "confidence": ranked[0][1],
        "top3": [{"career": c, "score": s} for c, s in ranked[:3]],
        "matchScores": dict(ranked),
    }


# ── Sample test profiles (raw frontend-style answers) ──────────────────────────
SAMPLES = {
    "1. Data Analyst type student": {
        "field_of_study": "Information Systems / IT",
        "status": "Final year undergraduate",
        "modules": ["Databases & SQL", "Statistics & Math"],
        "coding": "Comfortable with code",
        "skills": ["Data Analysis"],
        "activities": ["Analyzing data & finding patterns"],
        "problemStyle": "Data & logic puzzles",
        "workStyle": "Collaborative team",
        "personality": ["Analytical", "Detail-oriented"],
        "workPreference": "Mostly structured",
        "careerPreference": ["Data Analyst"],  # excluded from the model
    },
    "2. Software Engineer type student": {
        "field_of_study": "Software Engineering",
        "status": "3rd year undergraduate",
        "modules": ["Web & App Development", "Algorithms & Data Structures"],
        "coding": "I love coding",
        "skills": ["Programming"],
        "activities": ["Building apps & software"],
        "problemStyle": "Building & coding challenges",
        "workStyle": "Independent / remote",
        "personality": ["Problem-solver", "Persistent"],
        "workPreference": "Mostly flexible",
        "careerPreference": ["Software Engineer"],
    },
    "3. Business Analyst / Project Manager type student": {
        "field_of_study": "Information Systems / IT",
        "status": "Recent graduate",
        "modules": ["Project & Business Management"],
        "coding": "I prefer minimal coding",
        "skills": ["Communication & Leadership", "Business Analysis"],
        "activities": ["Solving business problems", "Planning & coordinating projects"],
        "problemStyle": "Business & strategy",
        "workStyle": "Structured corporate",
        "personality": ["Communicator", "Leader"],
        "workPreference": "Highly structured & predictable",
        "careerPreference": ["Business Analyst", "Project Manager"],
    },
    "4. UI/UX Designer type student": {
        "field_of_study": "Other IT field",
        "status": "3rd year undergraduate",
        "modules": ["UI/UX & Design"],
        "coding": "I prefer minimal coding",
        "skills": ["Design & Prototyping"],
        "activities": ["Designing user interfaces"],
        "problemStyle": "Visual & design problems",
        "workStyle": "Fast-paced startup",
        "personality": ["Creative", "Detail-oriented"],
        "workPreference": "Mostly flexible",
        "careerPreference": ["UI/UX Designer"],
    },
    "5. Cybersecurity Analyst type student": {
        "field_of_study": "Cybersecurity",
        "status": "Final year undergraduate",
        "modules": ["Networking & Security"],
        "coding": "Comfortable with code",
        "skills": ["Cybersecurity"],
        "activities": ["Securing systems & networks"],
        "problemStyle": "Security & investigation",
        "workStyle": "Structured corporate",
        "personality": ["Detail-oriented", "Analytical"],
        "workPreference": "Mostly structured",
        "careerPreference": ["Cybersecurity Analyst"],
    },
    "6. Cloud / DevOps Engineer type student": {
        "field_of_study": "Computer Science",
        "status": "Recent graduate",
        "modules": ["Cloud Computing", "Networking & Security"],
        "coding": "Comfortable with code",
        "skills": ["Cloud & DevOps", "Programming"],
        "activities": ["Working with cloud & infrastructure"],
        "problemStyle": "Building & coding challenges",
        "workStyle": "Structured corporate",
        "personality": ["Problem-solver", "Persistent"],
        "workPreference": "A balance of both",
        "careerPreference": ["Cloud / DevOps Engineer"],
    },
}


def main():
    # Encoding sanity: confirm the vector is exactly the 53 model features.
    sample_vec = encode_answers(next(iter(SAMPLES.values())))
    assert list(sample_vec.columns) == list(FEATURE_COLUMNS), "feature order mismatch!"
    assert sample_vec.shape == (1, 53), f"expected (1,53), got {sample_vec.shape}"
    print(f"Loaded model + encoder + {len(FEATURE_COLUMNS)} feature columns. "
          f"Encoding produces shape {sample_vec.shape}.\n")

    for label, answers in SAMPLES.items():
        result = predict_career(answers)
        print("=" * 64)
        print(label)
        print("=" * 64)
        print(f"  Top career : {result['topCareer']}  ({result['confidence']:.2f}% confidence)")
        print("  Top 3 matches:")
        for m in result["top3"]:
            print(f"    - {m['career']:<26} {m['score']:5.2f}%")
        print("  All match scores:")
        for career, score in result["matchScores"].items():
            print(f"    {career:<28} {score:5.2f}%")
        print()


if __name__ == "__main__":
    main()
