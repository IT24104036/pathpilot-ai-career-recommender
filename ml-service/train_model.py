"""
PathPilot — ML training pipeline (Step 4A)
==========================================
Trains and compares two classifiers on the synthetic career dataset, then saves
the better model plus the artifacts needed for serving later.

Inputs  : dataset/career_dataset.csv   (encoded per ml-service/ENCODING_SPEC.md)
Outputs : ml-service/model/career_model.pkl
          ml-service/model/label_encoder.pkl
          ml-service/model/feature_columns.pkl

This script ONLY trains + evaluates. It does NOT touch the backend/API.
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib

# Windows consoles default to cp1252; force UTF-8 so report glyphs print cleanly.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

RANDOM_STATE = 42
TEST_SIZE = 0.20

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(HERE, "..", "dataset", "career_dataset.csv")
MODEL_DIR = os.path.join(HERE, "model")

# ── Fixed feature order (ENCODING_SPEC.md §13). Do NOT reorder. ────────────────
FEATURE_COLUMNS = [
    "academic_status", "coding_comfort", "work_flexibility",
    "fos_cs", "fos_se", "fos_is", "fos_ds", "fos_cyber", "fos_other",
    "mod_algorithms", "mod_databases", "mod_statistics", "mod_webdev",
    "mod_networking", "mod_uiux", "mod_mlai", "mod_cloud", "mod_projbusiness",
    "skill_programming", "skill_data_analysis", "skill_ml", "skill_cloud_devops",
    "skill_security", "skill_design", "skill_comm_leadership", "skill_business",
    "act_data_patterns", "act_build_apps", "act_train_ml", "act_design_ui",
    "act_secure_systems", "act_cloud_infra", "act_plan_projects", "act_business_problems",
    "ps_data_logic", "ps_build_code", "ps_visual_design", "ps_security",
    "ps_people_coord", "ps_business",
    "we_independent", "we_collaborative", "we_startup", "we_corporate", "we_research",
    "trait_analytical", "trait_creative", "trait_detail", "trait_curious",
    "trait_leader", "trait_problem_solver", "trait_communicator", "trait_persistent",
]
TARGET = "career_path"

# Canonical class order (ENCODING_SPEC.md §12) — fixes the LabelEncoder integers.
CLASSES = [
    "Data Analyst", "Data Scientist", "Machine Learning Engineer",
    "Software Engineer", "Business Analyst", "UI/UX Designer",
    "Cybersecurity Analyst", "Cloud / DevOps Engineer", "Project Manager",
]


def load_data():
    df = pd.read_csv(DATA_PATH)
    missing = [c for c in FEATURE_COLUMNS + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing expected columns: {missing}")
    X = df[FEATURE_COLUMNS].copy()              # enforce spec column order
    y_names = df[TARGET].copy()
    return df, X, y_names


def make_label_encoder():
    """LabelEncoder with the spec's canonical class order (0..8).

    classes_ is set explicitly so the integer↔name mapping matches
    ENCODING_SPEC.md. inverse_transform (used at serving) indexes classes_,
    so the manual order is safe.
    """
    le = LabelEncoder()
    le.classes_ = np.array(CLASSES)
    return le


def encode_target(y_names, le):
    name_to_int = {name: i for i, name in enumerate(CLASSES)}
    return y_names.map(name_to_int).to_numpy()


def evaluate(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n{'─' * 60}\n{name}\n{'─' * 60}")
    print(f"Test accuracy: {acc:.4f}")

    print("\nClassification report:")
    print(classification_report(y_test, y_pred, target_names=CLASSES, digits=3))

    print("Confusion matrix (rows = true, cols = predicted):")
    cm = confusion_matrix(y_test, y_pred, labels=list(range(len(CLASSES))))
    short = [c.split(" / ")[0][:14] for c in CLASSES]
    cm_df = pd.DataFrame(cm, index=short, columns=short)
    with pd.option_context("display.width", 200, "display.max_columns", None):
        print(cm_df.to_string())

    return acc, y_pred


def main():
    print("=" * 60)
    print("PathPilot — model training (Step 4A)")
    print("=" * 60)

    df, X, y_names = load_data()
    le = make_label_encoder()
    y = encode_target(y_names, le)

    print(f"\nDataset: {df.shape[0]} rows, {len(FEATURE_COLUMNS)} features, "
          f"{len(CLASSES)} classes")
    print("Class counts:")
    print(y_names.value_counts().reindex(CLASSES).to_string())

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"\nSplit: train={X_train.shape[0]}  test={X_test.shape[0]} "
          f"(stratified, test_size={TEST_SIZE})")

    # ── Models ──
    # Baseline: Logistic Regression (scaled — helps convergence/linear models).
    logreg = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
    ])
    # Main: Random Forest (no scaling needed).
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=None, random_state=RANDOM_STATE, n_jobs=-1
    )

    models = {
        "Logistic Regression (baseline)": logreg,
        "Random Forest (main)": rf,
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        acc, _ = evaluate(name, model, X_test, y_test)
        results[name] = (acc, model)

    # ── Comparison ──
    print(f"\n{'=' * 60}\nMODEL COMPARISON (test accuracy)\n{'=' * 60}")
    for name, (acc, _) in results.items():
        print(f"  {name:<34} {acc:.4f}")

    best_name = max(results, key=lambda n: results[n][0])
    best_acc, best_model = results[best_name]
    print(f"\n>> Selected best model: {best_name}  (accuracy {best_acc:.4f})")

    # ── Save artifacts ──
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "career_model.pkl")
    le_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
    cols_path = os.path.join(MODEL_DIR, "feature_columns.pkl")

    joblib.dump(best_model, model_path)
    joblib.dump(le, le_path)
    joblib.dump(FEATURE_COLUMNS, cols_path)

    print("\nSaved artifacts:")
    print(f"  model           -> {os.path.abspath(model_path)}")
    print(f"  label_encoder   -> {os.path.abspath(le_path)}")
    print(f"  feature_columns -> {os.path.abspath(cols_path)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
