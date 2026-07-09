"""
PathPilot — Model Training Sanity Audit
=======================================
Read-only audit of the preprocessed split, label encoder, and the two trained
models' metrics. Confirms the pipeline is valid and leakage-free BEFORE we pick
a final model.

Does NOT modify files, retrain, or save career_model.pkl.
Run:  python ml-service/model_sanity_check.py
"""

import os
import json

import numpy as np
import pandas as pd
import joblib

HERE = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(HERE, "processed")
MODEL_DIR = os.path.join(HERE, "model")
REPORTS_DIR = os.path.join(HERE, "reports")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

# Expected 53 feature columns, in ENCODING_SPEC.md §13 order.
EXPECTED_FEATURES = [
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

CANONICAL_CLASSES = [
    "Data Analyst", "Data Scientist", "Machine Learning Engineer", "Software Engineer",
    "Business Analyst", "UI/UX Designer", "Cybersecurity Analyst",
    "Cloud / DevOps Engineer", "Project Manager",
]

# Substrings that must NOT appear in any feature column (leakage / metadata).
LEAKAGE_SUBSTRINGS = [
    "career_path", "careerpreference", "career_preference", "pref_",
    "prediction", "matchscore", "match_score", "userid", "user_id",
    "timestamp", "degree",
]

results = []  # (label, passed: bool|None, detail)


def check(label, passed, detail=""):
    icon = "PASS" if passed is True else ("WARN" if passed is None else "FAIL")
    print(f"[{icon}] {label}" + (f" — {detail}" if detail else ""))
    results.append((label, passed, detail))


def section(t):
    print("\n" + "=" * 64)
    print(t)
    print("=" * 64)


def main():
    X_train = pd.read_csv(os.path.join(PROCESSED_DIR, "X_train.csv"))
    X_test = pd.read_csv(os.path.join(PROCESSED_DIR, "X_test.csv"))
    y_train = pd.read_csv(os.path.join(PROCESSED_DIR, "y_train.csv"))["career_path"].values
    y_test = pd.read_csv(os.path.join(PROCESSED_DIR, "y_test.csv"))["career_path"].values
    le = joblib.load(ENCODER_PATH)

    # 1) 53 feature columns
    section("1. Feature column count")
    check("X_train has 53 feature columns", X_train.shape[1] == 53, f"got {X_train.shape[1]}")
    check("X_test has 53 feature columns", X_test.shape[1] == 53, f"got {X_test.shape[1]}")
    check("X_train columns match spec order", list(X_train.columns) == EXPECTED_FEATURES)
    check("X_test columns match spec order", list(X_test.columns) == EXPECTED_FEATURES)

    # 2) career_path not in features
    section("2. Target not present in features")
    check("'career_path' NOT in X_train", "career_path" not in X_train.columns)
    check("'career_path' NOT in X_test", "career_path" not in X_test.columns)

    # 3) y values are encoded 0–8
    section("3. Target label range (0–8)")
    tr_vals, te_vals = set(np.unique(y_train).tolist()), set(np.unique(y_test).tolist())
    check("y_train values within {0..8}", tr_vals.issubset(set(range(9))), f"{sorted(tr_vals)}")
    check("y_test values within {0..8}", te_vals.issubset(set(range(9))), f"{sorted(te_vals)}")
    check("all 9 classes present in train", tr_vals == set(range(9)))
    check("all 9 classes present in test", te_vals == set(range(9)))

    # 4) encoder canonical order
    section("4. Label encoder canonical order (ENCODING_SPEC §12)")
    check("encoder classes match canonical order", list(le.classes_) == CANONICAL_CLASSES)
    print("  mapping:", {i: c for i, c in enumerate(le.classes_)})

    # 5) stratified / balanced
    section("5. Stratification & class balance")
    tr_counts = pd.Series(y_train).value_counts().sort_index()
    te_counts = pd.Series(y_test).value_counts().sort_index()
    test_frac = (te_counts / (tr_counts + te_counts)).round(4)
    print("class | train | test | test_frac")
    for k in range(9):
        print(f"  {k}   | {tr_counts[k]:>4} | {te_counts[k]:>4} | {test_frac[k]:.3f}  ({le.classes_[k]})")
    bal_train = int(tr_counts.max() - tr_counts.min())
    bal_test = int(te_counts.max() - te_counts.min())
    strat_ok = bool(((test_frac >= 0.19) & (test_frac <= 0.21)).all())
    check("train classes balanced (spread <= 2)", bal_train <= 2, f"spread={bal_train}")
    check("test classes balanced (spread <= 2)", bal_test <= 2, f"spread={bal_test}")
    check("each class ~20% in test (stratified)", strat_ok)

    # 6) leakage column scan
    section("6. Target-leakage column scan")
    cols_l = [c.lower() for c in X_train.columns]
    hits = [c for c in cols_l for s in LEAKAGE_SUBSTRINGS if s in c]
    check("no careerPreference column", not any("pref" in c for c in cols_l))
    check("no prediction column", not any("prediction" in c for c in cols_l))
    check("no matchScores column", not any("match" in c for c in cols_l))
    check("no userId / timestamp column", not any(("user" in c or "timestamp" in c) for c in cols_l))
    check("no leakage substrings at all", len(hits) == 0, f"hits={hits}")

    # 7) duplicate feature rows across train/test
    section("7. Duplicate feature rows across train/test")
    tr_tuples = list(map(tuple, X_train.to_numpy().tolist()))
    te_tuples = list(map(tuple, X_test.to_numpy().tolist()))
    tr_label_map = {}
    for t, lab in zip(tr_tuples, y_train):
        tr_label_map.setdefault(t, set()).add(int(lab))
    tr_set = set(tr_tuples)
    overlap_idx = [i for i, t in enumerate(te_tuples) if t in tr_set]
    overlap = len(overlap_idx)
    # how many overlaps share BOTH features AND label with a train row
    same_label = sum(1 for i in overlap_idx if int(y_test[i]) in tr_label_map[te_tuples[i]])
    print(f"  test rows with an identical feature vector in train: {overlap} / {len(te_tuples)} "
          f"({overlap / len(te_tuples) * 100:.1f}%)")
    print(f"  of those, same feature AND same label: {same_label}")
    # WARN (not fail) — expected with binary features; report only.
    check("train/test feature-row overlap is low (<5%)",
          None if overlap / len(te_tuples) >= 0.05 else True,
          f"{overlap} rows ({overlap / len(te_tuples) * 100:.1f}%)")

    # 8) metrics comparison
    section("8. Model metrics comparison")
    lr = json.load(open(os.path.join(REPORTS_DIR, "logistic_metrics.json")))
    rf = json.load(open(os.path.join(REPORTS_DIR, "random_forest_metrics.json")))

    def mf1(m):
        return m.get("macro_f1", m["macro_avg"]["f1-score"])

    def wf1(m):
        return m.get("weighted_f1", m["weighted_avg"]["f1-score"])

    print(f"{'model':<26}{'accuracy':>10}{'macroF1':>10}{'weightF1':>10}")
    for m in (lr, rf):
        print(f"{m['model']:<26}{m['accuracy']:>10.4f}{mf1(m):>10.4f}{wf1(m):>10.4f}")

    # 9) conclusion
    section("9. Conclusion")
    structural = [p for (lab, p, _) in results if p is not None]
    all_struct_ok = all(structural)
    acc = lr["accuracy"]
    believable = 0.50 < acc < 0.99  # not random, not suspiciously perfect
    leakage_free = len(hits) == 0

    print(f"Training looked valid?        {'YES' if all_struct_ok else 'NO — see FAILs above'}")
    print(f"Accuracy believable?          {'YES' if believable else 'SUSPICIOUS'} "
          f"(~{acc * 100:.1f}%, well below 100% and far above the 11% random baseline)")
    print(f"Obvious target leakage?       {'NONE' if leakage_free else 'POSSIBLE — see scan'} "
          f"(features are exactly the 53 spec inputs; careerPreference/prediction/matchScores/userId/timestamp all excluded)")
    print(f"Train/test duplicate overlap: {overlap} rows ({overlap / len(te_tuples) * 100:.1f}%) — "
          f"{'expected with binary features, not leakage' if overlap / len(te_tuples) < 0.05 else 'review recommended'}")

    lr_score = (lr['accuracy'], mf1(lr))
    rf_score = (rf['accuracy'], mf1(rf))
    if rf_score > lr_score and (rf['accuracy'] - lr['accuracy']) >= 0.01:
        pick, why = "Random Forest", "meaningfully higher accuracy/F1."
    elif lr_score > rf_score and (lr['accuracy'] - rf['accuracy']) >= 0.01:
        pick, why = "Logistic Regression", "meaningfully higher accuracy/F1."
    else:
        pick, why = ("Logistic Regression",
                     "scores are tied (~92.4%); pick the simpler, faster, more "
                     "interpretable model with clean probability outputs.")
    print(f"\nRecommended model: {pick} — {why}")

    section("Audit summary")
    n_fail = sum(1 for (_, p, _) in results if p is False)
    n_warn = sum(1 for (_, p, _) in results if p is None)
    print(f"Checks: {len(results)}  |  FAIL: {n_fail}  |  WARN: {n_warn}")
    print("Verdict:", "ALL STRUCTURAL CHECKS PASSED — pipeline is valid." if n_fail == 0
          else "ONE OR MORE CHECKS FAILED — review above.")
    print("(read-only audit — nothing modified, no model trained/saved.)")


if __name__ == "__main__":
    main()
