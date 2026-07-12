"""
PathPilot — Step 2: Data Preprocessing
======================================
Loads dataset/career_dataset.csv, separates features/target, label-encodes the
target (using the canonical class order from ENCODING_SPEC.md), and creates a
stratified 80/20 train/test split.

Outputs:
  ml-service/processed/X_train.csv
  ml-service/processed/X_test.csv
  ml-service/processed/y_train.csv
  ml-service/processed/y_test.csv
  ml-service/model/label_encoder.pkl

This script does NOT train a model. Run:
  python ml-service/data_preprocessing.py
"""

import os
import sys

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ── Paths ──────────────────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(HERE, "..", "dataset", "career_dataset.csv"))
PROCESSED_DIR = os.path.join(HERE, "processed")
MODEL_DIR = os.path.join(HERE, "model")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

TARGET = "career_path"
EXPECTED_COLUMNS = 54
EXPECTED_FEATURES = 53
TEST_SIZE = 0.20
RANDOM_STATE = 42

# Canonical class order — must match ENCODING_SPEC.md §12 (defines int 0–8).
CAREER_CLASSES = [
    "Data Analyst",                # 0
    "Data Scientist",              # 1
    "Machine Learning Engineer",   # 2
    "Software Engineer",           # 3
    "Business Analyst",            # 4
    "UI/UX Designer",             # 5
    "Cybersecurity Analyst",       # 6
    "Cloud / DevOps Engineer",     # 7
    "Project Manager",             # 8
]


def section(title):
    print("\n" + "=" * 64)
    print(title)
    print("=" * 64)


def build_label_encoder(y_str):
    """LabelEncoder pinned to the canonical (spec) class order, not alphabetical."""
    le = LabelEncoder()
    le.classes_ = np.array(CAREER_CLASSES, dtype=object)

    # Safety: dataset classes must equal the canonical set.
    found = set(pd.unique(y_str))
    if found != set(CAREER_CLASSES):
        sys.exit(f"ERROR: dataset classes {found} != canonical {set(CAREER_CLASSES)}")

    # Round-trip sanity check (transform/inverse must be consistent).
    sample = np.array(CAREER_CLASSES, dtype=object)
    assert list(le.inverse_transform(le.transform(sample))) == CAREER_CLASSES, (
        "LabelEncoder round-trip failed"
    )
    return le


def main():
    if not os.path.exists(DATA_PATH):
        sys.exit(f"ERROR: dataset not found at {DATA_PATH}")

    # 1) Load
    df = pd.read_csv(DATA_PATH)
    section("1. Dataset loaded")
    print(f"Source: {DATA_PATH}")
    print(f"Shape : {df.shape}")

    # 2) Validate 54 columns
    section("2. Validate column count")
    ok_cols = df.shape[1] == EXPECTED_COLUMNS
    print(f"Columns = {df.shape[1]} (expected {EXPECTED_COLUMNS}) -> {'PASS' if ok_cols else 'FAIL'}")
    if not ok_cols:
        sys.exit("ERROR: unexpected column count.")

    # 3) Validate target exists
    section("3. Validate target column")
    if TARGET not in df.columns:
        sys.exit(f"ERROR: target column '{TARGET}' not found.")
    print(f"'{TARGET}' present -> PASS")

    # 4) Separate X / y
    section("4. Separate features (X) and target (y)")
    X = df.drop(columns=[TARGET])
    y_str = df[TARGET]
    print(f"X columns: {X.shape[1]}  |  y: '{TARGET}'")

    # 5) Confirm 53 input features
    section("5. Validate feature count")
    ok_feat = X.shape[1] == EXPECTED_FEATURES
    print(f"Input features = {X.shape[1]} (expected {EXPECTED_FEATURES}) -> {'PASS' if ok_feat else 'FAIL'}")
    if not ok_feat:
        sys.exit("ERROR: unexpected feature count.")

    # 6) Encode target with LabelEncoder (canonical order)
    section("6. Encode target (LabelEncoder)")
    le = build_label_encoder(y_str)
    y = le.transform(y_str)
    print("Class -> integer mapping (canonical, matches ENCODING_SPEC.md §12):")
    for i, c in enumerate(le.classes_):
        print(f"  {i} = {c}")

    # 7) Stratified 80/20 split
    section("7. Stratified train/test split (80/20)")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"test_size={TEST_SIZE}  random_state={RANDOM_STATE}  stratify=career_path")

    # 8) Print shapes + class distributions
    section("8. Shapes")
    print(f"X_train: {X_train.shape}")
    print(f"X_test : {X_test.shape}")
    print(f"y_train: {y_train.shape}")
    print(f"y_test : {y_test.shape}")

    section("8b. Train class distribution")
    print(pd.Series(le.inverse_transform(y_train)).value_counts().sort_index().to_string())
    section("8c. Test class distribution")
    print(pd.Series(le.inverse_transform(y_test)).value_counts().sort_index().to_string())

    # 9) Save processed splits
    section("9. Save processed splits")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    X_train.to_csv(os.path.join(PROCESSED_DIR, "X_train.csv"), index=False)
    X_test.to_csv(os.path.join(PROCESSED_DIR, "X_test.csv"), index=False)
    pd.DataFrame({TARGET: y_train}).to_csv(os.path.join(PROCESSED_DIR, "y_train.csv"), index=False)
    pd.DataFrame({TARGET: y_test}).to_csv(os.path.join(PROCESSED_DIR, "y_test.csv"), index=False)
    for f in ["X_train.csv", "X_test.csv", "y_train.csv", "y_test.csv"]:
        print(f"  saved -> {os.path.join(PROCESSED_DIR, f)}")

    # 10) Save label encoder
    section("10. Save label encoder")
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(le, ENCODER_PATH)
    print(f"  saved -> {ENCODER_PATH}")

    section("Summary")
    print(f"Column check (==54)     : {'PASS' if ok_cols else 'FAIL'}")
    print(f"Feature check (==53)    : {'PASS' if ok_feat else 'FAIL'}")
    print(f"Train / Test rows       : {X_train.shape[0]} / {X_test.shape[0]}")
    print(f"Encoder classes         : {len(le.classes_)}")
    print("Preprocessing complete. No model trained.")


if __name__ == "__main__":
    main()
