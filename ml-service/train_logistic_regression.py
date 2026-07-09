"""
PathPilot — Step 3A: Baseline model (Logistic Regression)
=========================================================
Trains a Logistic Regression baseline on the preprocessed split and reports
accuracy, a classification report, and a confusion matrix.

Inputs : ml-service/processed/{X_train,X_test,y_train,y_test}.csv
         ml-service/model/label_encoder.pkl
Outputs: ml-service/reports/logistic_confusion_matrix.png
         ml-service/reports/logistic_classification_report.txt
         ml-service/reports/logistic_metrics.json

This trains ONLY Logistic Regression and does NOT save a final career_model.pkl.
Run:  python ml-service/train_logistic_regression.py
"""

import os
import json

import numpy as np
import pandas as pd
import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

MODEL_NAME = "Logistic Regression (baseline)"
RANDOM_STATE = 42

HERE = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(HERE, "processed")
MODEL_DIR = os.path.join(HERE, "model")
REPORTS_DIR = os.path.join(HERE, "reports")

ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
CM_PATH = os.path.join(REPORTS_DIR, "logistic_confusion_matrix.png")
REPORT_PATH = os.path.join(REPORTS_DIR, "logistic_classification_report.txt")
METRICS_PATH = os.path.join(REPORTS_DIR, "logistic_metrics.json")


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

    # 2) Train Logistic Regression baseline
    section("2. Train Logistic Regression")
    # StandardScaler helps LR converge and treats the 0–4 ordinals and 0/1
    # binaries on a comparable scale. multinomial (softmax) for 9 classes.
    model = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
    )
    model.fit(X_train, y_train)
    print("Trained: StandardScaler -> LogisticRegression(max_iter=2000)")

    # 3) Predict on the test set
    y_pred = model.predict(X_test)

    # 4) Accuracy
    section("3. Accuracy")
    acc = accuracy_score(y_test, y_pred)
    print(f"Test accuracy: {acc:.4f}  ({acc * 100:.2f}%)")

    # 5) Classification report
    section("4. Classification report")
    report_txt = classification_report(y_test, y_pred, target_names=class_names, digits=4)
    report_dict = classification_report(
        y_test, y_pred, target_names=class_names, digits=4, output_dict=True
    )
    print(report_txt)

    # 6) Confusion matrix
    section("5. Confusion matrix")
    cm = confusion_matrix(y_test, y_pred)
    print("(rows = true, cols = predicted; class order = encoder canonical order)")
    print(cm)

    # 7) Save confusion matrix chart
    fig, ax = plt.subplots(figsize=(9, 8))
    ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names).plot(
        ax=ax, cmap="Blues", colorbar=False, xticks_rotation=45
    )
    ax.set_title(f"{MODEL_NAME} — Confusion Matrix (test set)", fontsize=12, fontweight="bold")
    fig.tight_layout()
    fig.savefig(CM_PATH, dpi=120)
    plt.close(fig)
    print(f"Saved -> {CM_PATH}")

    # 8) Save classification report text
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(f"Model: {MODEL_NAME}\n")
        f.write(f"Test accuracy: {acc:.4f} ({acc * 100:.2f}%)\n")
        f.write(f"Train rows: {len(y_train)} | Test rows: {len(y_test)}\n\n")
        f.write("Classification report (test set):\n")
        f.write(report_txt + "\n")
        f.write("Confusion matrix (rows=true, cols=pred; canonical class order):\n")
        f.write(np.array2string(cm) + "\n")
    print(f"Saved -> {REPORT_PATH}")

    # 9) Save metrics JSON
    metrics = {
        "model": MODEL_NAME,
        "random_state": RANDOM_STATE,
        "n_train": int(len(y_train)),
        "n_test": int(len(y_test)),
        "n_features": int(X_train.shape[1]),
        "n_classes": len(class_names),
        "class_names": class_names,
        "accuracy": round(float(acc), 4),
        "macro_avg": report_dict["macro avg"],
        "weighted_avg": report_dict["weighted avg"],
        "per_class": {c: report_dict[c] for c in class_names},
        "confusion_matrix": cm.tolist(),
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved -> {METRICS_PATH}")

    section("Summary")
    print(f"Model     : {MODEL_NAME}")
    print(f"Accuracy  : {acc:.4f}")
    print(f"Macro F1  : {report_dict['macro avg']['f1-score']:.4f}")
    print("Reports   : logistic_confusion_matrix.png, logistic_classification_report.txt, logistic_metrics.json")
    print("Note: no career_model.pkl saved (baseline only).")


if __name__ == "__main__":
    main()
