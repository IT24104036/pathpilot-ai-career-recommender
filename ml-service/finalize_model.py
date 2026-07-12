"""
PathPilot — Step 3C: Finalize & save the official model
=======================================================
Selected model: Logistic Regression (StandardScaler -> LogisticRegression).

Trains the FINAL model on the full dataset (all rows) using the canonical label
encoder, then saves the official artifacts the serving layer will load later.

Inputs : dataset/career_dataset.csv
         ml-service/model/label_encoder.pkl   (canonical, from Step 2)
         ml-service/reports/logistic_metrics.json  (reference test accuracy)
Outputs: ml-service/model/career_model.pkl
         ml-service/model/feature_columns.pkl
         ml-service/reports/final_model_summary.txt

Does NOT touch the backend or build a prediction API.
Run:  python ml-service/finalize_model.py
"""

import os
import json

import pandas as pd
import joblib
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

MODEL_NAME = "Logistic Regression"
RANDOM_STATE = 42

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(HERE, "..", "dataset", "career_dataset.csv"))
MODEL_DIR = os.path.join(HERE, "model")
REPORTS_DIR = os.path.join(HERE, "reports")

ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "career_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")
SUMMARY_PATH = os.path.join(REPORTS_DIR, "final_model_summary.txt")
LR_METRICS_PATH = os.path.join(REPORTS_DIR, "logistic_metrics.json")
RF_METRICS_PATH = os.path.join(REPORTS_DIR, "random_forest_metrics.json")

TARGET = "career_path"

# Fixed 53-feature order — ENCODING_SPEC.md §13.
FEATURE_COLUMNS = [
    "academic_status", "coding_comfort", "work_flexibility",
    "fos_cs", "fos_se", "fos_is", "fos_ds", "fos_cyber", "fos_other",
    "mod_algorithms", "mod_databases", "mod_statistics", "mod_webdev", "mod_networking",
    "mod_uiux", "mod_mlai", "mod_cloud", "mod_projbusiness",
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


def section(t):
    print("\n" + "=" * 64)
    print(t)
    print("=" * 64)


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    # 1) Load full dataset
    section("1. Load full dataset")
    df = pd.read_csv(DATA_PATH)
    print(f"Source: {DATA_PATH}")
    print(f"Shape : {df.shape}")

    # 2) Separate X / y using the fixed 53-feature order
    section("2. Separate X / y (fixed 53-feature order)")
    missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing or TARGET not in df.columns:
        raise SystemExit(f"ERROR: missing columns: {missing} | target present: {TARGET in df.columns}")
    X = df[FEATURE_COLUMNS].copy()      # enforces spec order
    y_str = df[TARGET]
    print(f"X: {X.shape} (53 features, spec order)  |  y: '{TARGET}'")

    # 3) Load canonical label encoder
    section("3. Load canonical label encoder")
    le = joblib.load(ENCODER_PATH)
    class_names = list(le.classes_)
    print("classes:", {i: c for i, c in enumerate(class_names)})

    # 4) Transform y with the canonical encoder
    section("4. Encode target")
    y = le.transform(y_str)
    print(f"y encoded -> range {int(y.min())}..{int(y.max())}, {len(set(y))} classes")

    # 5/6) Train final Logistic Regression on the FULL dataset (with scaling)
    section("5. Train final model on FULL dataset")
    model = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
    )
    model.fit(X, y)
    train_acc = model.score(X, y)
    print(f"Pipeline: StandardScaler -> LogisticRegression(max_iter=2000)")
    print(f"Trained on all {len(X)} rows. In-sample accuracy: {train_acc:.4f}")

    # 7) Save official model
    section("7. Save official model")
    joblib.dump(model, MODEL_PATH)
    print(f"saved -> {MODEL_PATH}")

    # 8) Save fixed feature columns
    section("8. Save feature columns")
    joblib.dump(FEATURE_COLUMNS, FEATURES_PATH)
    print(f"saved -> {FEATURES_PATH}  ({len(FEATURE_COLUMNS)} features)")

    # Reference test metrics from earlier held-out evaluation (Step 3A)
    lr_metrics = json.load(open(LR_METRICS_PATH))
    rf_metrics = json.load(open(RF_METRICS_PATH))
    ref_acc = lr_metrics["accuracy"]
    ref_macro_f1 = lr_metrics["macro_avg"]["f1-score"]
    rf_acc = rf_metrics["accuracy"]
    rf_macro_f1 = rf_metrics.get("macro_f1", rf_metrics["macro_avg"]["f1-score"])

    # 9) Save final model summary
    section("9. Save final model summary")
    lines = [
        "PathPilot — Final Model Summary",
        "=" * 40,
        f"Selected model      : {MODEL_NAME}",
        f"Pipeline            : StandardScaler -> LogisticRegression(max_iter=2000, random_state={RANDOM_STATE})",
        "",
        "Why Logistic Regression over Random Forest:",
        f"  - Accuracy is tied with Random Forest on the held-out test set",
        f"    (LR {ref_acc:.4f} vs RF {rf_acc:.4f}; macro-F1 LR {ref_macro_f1:.4f} vs RF {rf_macro_f1:.4f}).",
        "  - Simpler and faster to train and serve.",
        "  - Interpretable per-class coefficients (supports the 'why this match' explanation).",
        "  - Produces well-behaved class probabilities -> ideal for percentage-based",
        "    career match scores and top-3 ranking.",
        "",
        f"Final feature count : {len(FEATURE_COLUMNS)} (per ENCODING_SPEC.md v1)",
        f"Target classes ({len(class_names)}):",
    ]
    for i, c in enumerate(class_names):
        lines.append(f"  {i} = {c}")
    lines += [
        "",
        "Reference held-out test metrics (Step 3A, 80/20 split):",
        f"  Accuracy   : {ref_acc:.4f} ({ref_acc * 100:.2f}%)",
        f"  Macro F1   : {ref_macro_f1:.4f}",
        f"  Weighted F1: {lr_metrics['weighted_avg']['f1-score']:.4f}",
        "",
        f"Final model trained on : full dataset ({len(X)} rows)",
        "",
        "Saved files:",
        f"  Model           : {MODEL_PATH}",
        f"  Feature columns : {FEATURES_PATH}",
        f"  Label encoder   : {ENCODER_PATH}",
        f"  This summary    : {SUMMARY_PATH}",
    ]
    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"saved -> {SUMMARY_PATH}")

    # Reload sanity check (artifacts are usable together)
    section("10. Reload sanity check")
    m2 = joblib.load(MODEL_PATH)
    cols2 = joblib.load(FEATURES_PATH)
    sample = X.iloc[[0]][cols2]
    pred = le.inverse_transform(m2.predict(sample))[0]
    print(f"Reloaded model predicts row 0 -> '{pred}' (true: '{y_str.iloc[0]}')")

    section("Done")
    print(f"Final model       : {MODEL_NAME}")
    print(f"Reference test acc : {ref_acc:.4f}")
    print("Saved: career_model.pkl, feature_columns.pkl, final_model_summary.txt")
    print("Backend untouched; no prediction API built.")


if __name__ == "__main__":
    main()
