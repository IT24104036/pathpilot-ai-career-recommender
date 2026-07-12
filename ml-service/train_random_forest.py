"""
PathPilot — Step 3B: Random Forest model
========================================
Trains a Random Forest classifier on the preprocessed split and reports accuracy,
macro/weighted F1, a classification report, and a confusion matrix — for direct
comparison against the Logistic Regression baseline (Step 3A).

Inputs : ml-service/processed/{X_train,X_test,y_train,y_test}.csv
         ml-service/model/label_encoder.pkl
Outputs: ml-service/reports/random_forest_confusion_matrix.png
         ml-service/reports/random_forest_classification_report.txt
         ml-service/reports/random_forest_metrics.json

This trains ONLY Random Forest and does NOT save the final career_model.pkl.
Run:  python ml-service/train_random_forest.py
"""

import os
import json

import numpy as np
import pandas as pd
import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

MODEL_NAME = "Random Forest"
RANDOM_STATE = 42

# Beginner-friendly, reasonable parameters.
PARAMS = dict(
    n_estimators=300,
    max_depth=None,            # let trees grow fully (data is clean + balanced)
    random_state=RANDOM_STATE,
    class_weight="balanced",
    n_jobs=-1,
)

HERE = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(HERE, "processed")
MODEL_DIR = os.path.join(HERE, "model")
REPORTS_DIR = os.path.join(HERE, "reports")

ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
CM_PATH = os.path.join(REPORTS_DIR, "random_forest_confusion_matrix.png")
REPORT_PATH = os.path.join(REPORTS_DIR, "random_forest_classification_report.txt")
METRICS_PATH = os.path.join(REPORTS_DIR, "random_forest_metrics.json")


def section(title):
    print("\n" + "=" * 64)
    print(title)
    print("=" * 64)


def main():
    os.makedirs(REPORTS_DIR, exist_ok=True)

    # 1) Load processed train/test data
    section("1. Load processed data")
    X_train = pd.read_csv(os.path.join(PROCESSED_DIR, "X_train.csv"))
    X_test = pd.read_csv(os.path.join(PROCESSED_DIR, "X_test.csv"))
    y_train = pd.read_csv(os.path.join(PROCESSED_DIR, "y_train.csv"))["career_path"].values
    y_test = pd.read_csv(os.path.join(PROCESSED_DIR, "y_test.csv"))["career_path"].values
    le = joblib.load(ENCODER_PATH)
    class_names = list(le.classes_)
    print(f"X_train {X_train.shape} | X_test {X_test.shape}")
    print(f"y_train {y_train.shape} | y_test {y_test.shape} | classes {len(class_names)}")

    # 2) Train Random Forest (no scaling needed — trees are scale-invariant)
    section("2. Train Random Forest")
    model = RandomForestClassifier(**PARAMS)
    model.fit(X_train, y_train)
    print(f"Trained RandomForestClassifier({', '.join(f'{k}={v}' for k, v in PARAMS.items())})")

    # 3) Predict on the test set
    y_pred = model.predict(X_test)

    # 4) Accuracy
    section("3. Accuracy")
    acc = accuracy_score(y_test, y_pred)
    print(f"Test accuracy: {acc:.4f}  ({acc * 100:.2f}%)")

    # 5) Macro F1 + Weighted F1
    section("4. F1 scores")
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    weighted_f1 = f1_score(y_test, y_pred, average="weighted")
    print(f"Macro F1   : {macro_f1:.4f}")
    print(f"Weighted F1: {weighted_f1:.4f}")

    # 6) Classification report
    section("5. Classification report")
    report_txt = classification_report(y_test, y_pred, target_names=class_names, digits=4)
    report_dict = classification_report(
        y_test, y_pred, target_names=class_names, digits=4, output_dict=True
    )
    print(report_txt)

    # 7) Confusion matrix
    section("6. Confusion matrix")
    cm = confusion_matrix(y_test, y_pred)
    print("(rows = true, cols = predicted; class order = encoder canonical order)")
    print(cm)

    # Top feature importances (useful for RF documentation)
    importances = sorted(
        zip(X_train.columns, model.feature_importances_), key=lambda t: t[1], reverse=True
    )
    section("7. Top 10 feature importances")
    for name, imp in importances[:10]:
        print(f"  {name:<22} {imp:.4f}")

    # 8) Save confusion matrix chart
    fig, ax = plt.subplots(figsize=(9, 8))
    ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names).plot(
        ax=ax, cmap="Greens", colorbar=False, xticks_rotation=45
    )
    ax.set_title(f"{MODEL_NAME} — Confusion Matrix (test set)", fontsize=12, fontweight="bold")
    fig.tight_layout()
    fig.savefig(CM_PATH, dpi=120)
    plt.close(fig)
    print(f"\nSaved -> {CM_PATH}")

    # 9) Save classification report text
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(f"Model: {MODEL_NAME}\n")
        f.write(f"Params: {PARAMS}\n")
        f.write(f"Test accuracy: {acc:.4f} ({acc * 100:.2f}%)\n")
        f.write(f"Macro F1: {macro_f1:.4f} | Weighted F1: {weighted_f1:.4f}\n")
        f.write(f"Train rows: {len(y_train)} | Test rows: {len(y_test)}\n\n")
        f.write("Classification report (test set):\n")
        f.write(report_txt + "\n")
        f.write("Confusion matrix (rows=true, cols=pred; canonical class order):\n")
        f.write(np.array2string(cm) + "\n\n")
        f.write("Top 10 feature importances:\n")
        for name, imp in importances[:10]:
            f.write(f"  {name}: {imp:.4f}\n")
    print(f"Saved -> {REPORT_PATH}")

    # 10) Save metrics JSON
    metrics = {
        "model": MODEL_NAME,
        "params": PARAMS,
        "n_train": int(len(y_train)),
        "n_test": int(len(y_test)),
        "n_features": int(X_train.shape[1]),
        "n_classes": len(class_names),
        "class_names": class_names,
        "accuracy": round(float(acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "macro_avg": report_dict["macro avg"],
        "weighted_avg": report_dict["weighted avg"],
        "per_class": {c: report_dict[c] for c in class_names},
        "confusion_matrix": cm.tolist(),
        "top_feature_importances": [
            {"feature": n, "importance": round(float(i), 4)} for n, i in importances[:15]
        ],
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved -> {METRICS_PATH}")

    section("Summary")
    print(f"Model       : {MODEL_NAME}")
    print(f"Accuracy    : {acc:.4f}")
    print(f"Macro F1    : {macro_f1:.4f}")
    print(f"Weighted F1 : {weighted_f1:.4f}")
    print("Reports     : random_forest_confusion_matrix.png, random_forest_classification_report.txt, random_forest_metrics.json")
    print("Note: career_model.pkl NOT saved (comparison step only).")


if __name__ == "__main__":
    main()
