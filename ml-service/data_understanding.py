"""
PathPilot — Step 1: Data Understanding
======================================
Inspects dataset/career_dataset.csv and produces a class-distribution chart.

This script is read-only: it does NOT preprocess, train, or modify the dataset.
Run:  python ml-service/data_understanding.py
"""

import os
import sys

import pandas as pd
import matplotlib

matplotlib.use("Agg")  # headless: write PNG without a display
import matplotlib.pyplot as plt

# ── Paths ──────────────────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(HERE, "..", "dataset", "career_dataset.csv"))
REPORTS_DIR = os.path.join(HERE, "reports")
CHART_PATH = os.path.join(REPORTS_DIR, "class_distribution.png")

TARGET = "career_path"
EXPECTED_COLUMNS = 54
EXPECTED_FEATURES = 53


def section(title):
    print("\n" + "=" * 64)
    print(title)
    print("=" * 64)


def main():
    if not os.path.exists(DATA_PATH):
        sys.exit(f"ERROR: dataset not found at {DATA_PATH}")

    # 1) Load the dataset
    df = pd.read_csv(DATA_PATH)
    section("1. Dataset loaded")
    print(f"Source: {DATA_PATH}")

    # 2) Shape
    section("2. Dataset shape")
    print(f"rows x columns = {df.shape}")

    # 3) Column names
    section("3. Column names")
    for i, col in enumerate(df.columns):
        print(f"  [{i:>2}] {col}")

    # 4) Data types
    section("4. Data types")
    print(df.dtypes.to_string())

    # 5) Missing values
    section("5. Missing values")
    missing = df.isnull().sum()
    total_missing = int(missing.sum())
    if total_missing == 0:
        print("No missing values. (OK)")
    else:
        print(missing[missing > 0].to_string())
        print(f"Total missing: {total_missing}")

    # 6) Duplicate rows
    section("6. Duplicate rows")
    dup_count = int(df.duplicated().sum())
    print(f"Duplicate rows: {dup_count}")
    print(
        "Note: with binary/ordinal features, some identical feature rows are "
        "expected and not necessarily errors."
    )

    # 7) Class distribution of career_path
    section("7. Class distribution (career_path)")
    if TARGET not in df.columns:
        sys.exit(f"ERROR: target column '{TARGET}' not found.")
    counts = df[TARGET].value_counts().sort_index()
    print(counts.to_string())
    print(f"\nClasses: {df[TARGET].nunique()}")
    print(f"Balance: min={counts.min()}  max={counts.max()}  spread={counts.max() - counts.min()}")

    # 8) Validate column count == 54
    section("8. Validate column count")
    n_cols = df.shape[1]
    ok_cols = n_cols == EXPECTED_COLUMNS
    print(f"Columns = {n_cols} (expected {EXPECTED_COLUMNS}) -> {'PASS' if ok_cols else 'FAIL'}")

    # 9) Validate 53 features + 1 target
    section("9. Validate feature/target split")
    n_features = n_cols - (1 if TARGET in df.columns else 0)
    ok_features = n_features == EXPECTED_FEATURES and TARGET in df.columns
    print(f"Input features = {n_features} (expected {EXPECTED_FEATURES})")
    print(f"Target column  = '{TARGET}' present: {TARGET in df.columns}")
    print(f"-> {'PASS' if ok_features else 'FAIL'}")

    # 10) Class distribution chart
    section("10. Class distribution chart")
    os.makedirs(REPORTS_DIR, exist_ok=True)
    plot_counts = df[TARGET].value_counts().sort_values(ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(plot_counts.index, plot_counts.values, color="#16B5C4")
    ax.set_title("PathPilot — career_path class distribution", fontsize=13, fontweight="bold")
    ax.set_xlabel("Number of samples")
    ax.set_ylabel("Career path")
    for i, v in enumerate(plot_counts.values):
        ax.text(v + max(plot_counts.values) * 0.01, i, str(int(v)), va="center", fontsize=9)
    fig.tight_layout()
    fig.savefig(CHART_PATH, dpi=120)
    plt.close(fig)
    print(f"Saved chart -> {CHART_PATH}")

    # ── Summary ──
    section("Summary")
    print(f"Column-count check (==54)        : {'PASS' if ok_cols else 'FAIL'}")
    print(f"Feature/target check (53 + 1)    : {'PASS' if ok_features else 'FAIL'}")
    print(f"Missing values                   : {total_missing}")
    print(f"Duplicate rows                   : {dup_count}")
    print(f"Class chart                      : {CHART_PATH}")


if __name__ == "__main__":
    main()
