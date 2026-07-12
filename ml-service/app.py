"""
PathPilot — Step 4B: FastAPI prediction service
================================================
Thin HTTP wrapper around the existing, tested prediction logic in predict.py.
Loads the saved artifacts (via predict.py) and exposes /, /health, /predict.

NOTE: scores are returned as fractions in [0, 1] (e.g. 0.92), matching the
requested API contract. predict.py's percentages are divided by 100 here.

Run:  uvicorn app:app --reload --port 8000     (from the ml-service/ folder)
"""

from typing import List, Optional, Dict

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

# Reuse the already-working logic + loaded artifacts.
from predict import predict_career, FEATURE_COLUMNS, MODEL

app = FastAPI(title="PathPilot ML Service", version="1.0")


# ── Request / response schemas ─────────────────────────────────────────────────
class AssessmentInput(BaseModel):
    """Raw assessment answers (the exact frontend strings).
    Extra keys (e.g. careerPreference, degree) are accepted and ignored."""
    field_of_study: Optional[str] = None
    status: Optional[str] = None
    modules: Optional[List[str]] = None
    coding: Optional[str] = None
    skills: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    problemStyle: Optional[str] = None
    workStyle: Optional[str] = None
    personality: Optional[List[str]] = None
    workPreference: Optional[str] = None
    careerPreference: Optional[List[str]] = None  # ignored by the model (leakage)

    model_config = ConfigDict(extra="allow")


class CareerScore(BaseModel):
    career: str
    score: float


class PredictResponse(BaseModel):
    topCareer: str
    confidence: float
    top3: List[CareerScore]
    matchScores: Dict[str, float]


def _to_fraction(pct: float) -> float:
    """predict.py returns percentages (0–100); the API contract uses 0–1."""
    return round(pct / 100.0, 4)


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "PathPilot ML Service is running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL is not None}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: AssessmentInput):
    answers = payload.model_dump()
    result = predict_career(answers)
    return {
        "topCareer": result["topCareer"],
        "confidence": _to_fraction(result["confidence"]),
        "top3": [
            {"career": m["career"], "score": _to_fraction(m["score"])}
            for m in result["top3"]
        ],
        "matchScores": {k: _to_fraction(v) for k, v in result["matchScores"].items()},
    }
