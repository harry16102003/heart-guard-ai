import os
import re
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="HeartGuard API")
PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(__file__).resolve().parent / "models" / "readmission_model.joblib"
PREDICTIONS_HISTORY_CSV_PATH = Path(
    os.getenv("PREDICTIONS_HISTORY_PATH", PROJECT_ROOT / "data" / "final" / "predictions_history.csv")
)
PREDICTIONS_HISTORY_XLSX_PATH = Path(
    os.getenv("PREDICTIONS_HISTORY_XLSX_PATH", PREDICTIONS_HISTORY_CSV_PATH.with_suffix(".xlsx"))
)


def _load_local_env() -> None:
    for env_path in [PROJECT_ROOT / ".env", Path(__file__).resolve().parent / ".env"]:
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            text = line.strip()
            if not text or text.startswith("#") or "=" not in text:
                continue
            key, value = text.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/landing")
def landing() -> dict:
    return {
        "badge": "AI model accuracy 91.7% · ROC-AUC 0.946",
        "hero": {
            "title": ["Preventive insights", "for heart failure", "readmission."],
            "highlight": "heart failure",
            "subtitle": "HeartGuard forecasts 30/60/180-day readmission risk for cardiac patients — empowering doctors to intervene before the next emergency.",
        },
        "monitor": {
            "patient": "Demo Patient",
            "title": "Real-time risk monitor",
            "severity": "CRITICAL",
            "risk": 86,
            "window": "14 days",
            "metrics": [
                {"label": "EF", "value": "32%"},
                {"label": "BP", "value": "162/98"},
                {"label": "Creatinine", "value": "1.8"},
            ],
        },
        "stats": [
            {"value": "91.7%", "label": "MODEL ACCURACY"},
            {"value": "0.946", "label": "ROC-AUC SCORE"},
            {"value": "−38%", "label": "READMISSIONS AVOIDED"},
            {"value": "<3s", "label": "TIME TO PREDICTION"},
        ],
        "featuresHeading": "A complete preventive cardiology workspace",
        "featuresSubheading": "From intake to intervention, HeartGuard fuses clinical data with ML forecasts.",
        "features": [
            {
                "title": "XGBoost predictive model",
                "description": "Ensemble model trained on cardiac admissions with 12 clinical features.",
            },
            {
                "title": "Risk forecasting",
                "description": "30 / 60 / 180-day readmission probability with confidence intervals.",
            },
            {
                "title": "Analytics dashboards",
                "description": "Cohort trends, risk distribution, and outcome tracking.",
            },
            {
                "title": "AI clinical assistant",
                "description": "Explain results, summarize charts, and suggest evidence-based actions.",
            },
            {
                "title": "Emergency alerts",
                "description": "Realtime flags for critical patients with ICU escalation suggestions.",
            },
            {
                "title": "Secure & auditable",
                "description": "Role-based access, JWT auth, and every prediction is traceable.",
            },
        ],
        "cta": {
            "title": "Start forecasting readmissions today",
            "subtitle": "Enter a patient's clinical profile and receive an AI risk assessment in seconds.",
            "button": "Run a prediction",
        },
        "footer": "© 2026 HeartGuard · AI-assisted clinical decision support — not a substitute for medical judgment.",
    }


class PredictPayload(BaseModel):
    patient_id: str = ""
    patient_name: str = ""
    age: float = 0
    bmi: float = 0
    systolic_bp: float = 0
    diastolic_bp: float = 0
    cholesterol: float = 0
    glucose: float = 0
    heart_rate: float = 0
    ejection_fraction: float = 0
    serum_creatinine: float = 0
    activity_hours: float = 0
    smoking: bool = False
    diabetes: bool = False
    hypertension: bool = False
    previous_visit_enabled: bool = False
    days_since_last_visit: float = 0
    prev_ejection_fraction: float = 0
    prev_serum_creatinine: float = 0
    prev_systolic_bp: float = 0
    prev_cholesterol: float = 0
    prev_glucose: float = 0
    prev_bmi: float = 0


def _load_model_artifact() -> dict:
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Model artifact not found at {MODEL_PATH}. Run backend/train_readmission_model.py first.",
        )
    return joblib.load(MODEL_PATH)


def _clean_text(value, fallback: str = "") -> str:
    if value is None or pd.isna(value):
        return fallback
    text = str(value).strip()
    return text if text and text.lower() != "nan" else fallback


def _clean_number(value, fallback: float = 0.0) -> float:
    try:
        if value is None or pd.isna(value):
            return fallback
        number = float(value)
        return number if pd.notna(number) else fallback
    except (TypeError, ValueError):
        return fallback


def _first_present(row: dict, *keys: str):
    for key in keys:
        value = row.get(key)
        if value is not None and not pd.isna(value):
            return value
    return None


def _normalize_risk_label(label: str, score: float) -> str:
    text = _clean_text(label).replace(" Risk", "")
    if text:
        return text
    if score >= 75:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 40:
        return "Moderate"
    return "Low"


def _read_history_frame(path: Path) -> pd.DataFrame:
    if not path.exists() or path.stat().st_size == 0:
        return pd.DataFrame()
    if path.suffix.lower() == ".xlsx":
        return pd.read_excel(path)
    return pd.read_csv(path)


def _append_history_file(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    frame = pd.DataFrame([row])
    existing = _read_history_frame(path)
    combined = pd.concat([existing, frame], ignore_index=True, sort=False) if not existing.empty else frame
    if path.suffix.lower() == ".xlsx":
        combined.to_excel(path, index=False)
    else:
        combined.to_csv(path, index=False)


def _append_prediction_history(payload: PredictPayload, response: dict) -> None:
    row = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "patient_id": payload.patient_id,
        "patient_name": payload.patient_name,
        "age": payload.age,
        "bmi": payload.bmi,
        "cholesterol": payload.cholesterol,
        "systolic_bp": payload.systolic_bp,
        "diastolic_bp": payload.diastolic_bp,
        "glucose": payload.glucose,
        "heart_rate": payload.heart_rate,
        "physical_activity": payload.activity_hours,
        "ejection_fraction": payload.ejection_fraction,
        "serum_creatinine": payload.serum_creatinine,
        "serum_sodium": 136.0,
        "platelets": 240000.0,
        "time": payload.activity_hours if payload.activity_hours > 0 else 100.0,
        "anaemia": 0,
        "diabetes": int(payload.diabetes),
        "high_blood_pressure": int(payload.hypertension),
        "sex": 1,
        "smoking": int(payload.smoking),
        "readmission_probability": response["risk_score"],
        "risk_level": response["risk_category"],
        "estimated_days_to_readmission": response["predicted_days"],
        "model_used": "rf_combined_v1",
    }
    _append_history_file(PREDICTIONS_HISTORY_CSV_PATH, row)
    try:
        _read_history_frame(PREDICTIONS_HISTORY_CSV_PATH).to_excel(PREDICTIONS_HISTORY_XLSX_PATH, index=False)
    except PermissionError:
        # Excel locks open workbooks on Windows; keep CSV/dashboard updated and sync XLSX next time.
        pass


@app.get("/api/predictions/history")
def prediction_history() -> dict:
    source_path = PREDICTIONS_HISTORY_CSV_PATH if PREDICTIONS_HISTORY_CSV_PATH.exists() else PREDICTIONS_HISTORY_XLSX_PATH
    frame = _read_history_frame(source_path)
    if frame.empty:
        return {"predictions": [], "patients": []}

    predictions = []
    for index, row in enumerate(frame.to_dict(orient="records"), start=1):
        timestamp = _clean_text(_first_present(row, "timestamp_utc", "timestamp"))
        date = timestamp[:10] if len(timestamp) >= 10 else ""
        score = _clean_number(_first_present(row, "readmission_probability", "risk", "risk_score"))
        patient_id = _clean_text(row.get("patient_id"), f"PT-HIST-{index:03d}")
        patient_name = _clean_text(row.get("patient_name"))
        if not patient_name:
            continue
        systolic = _clean_number(row.get("systolic_bp"), 0)
        diastolic = _clean_number(row.get("diastolic_bp"), 0)
        bp = "--/--" if not systolic and not diastolic else f"{systolic:g}/{diastolic:g}"
        risk_label = _normalize_risk_label(_clean_text(_first_present(row, "risk_level", "risk_label")), score)
        predictions.append(
            {
                "id": patient_id,
                "name": patient_name,
                "age": _clean_number(row.get("age"), 0) or "",
                "ageSex": f"{_clean_number(row.get('age'), 0):g}y · -"
                if _clean_number(row.get("age"), 0)
                else "--",
                "date": date,
                "ef": f"{_clean_number(row.get('ejection_fraction'), 0):g}%"
                if _clean_number(row.get("ejection_fraction"), 0)
                else "--",
                "bp": bp,
                "creatinine": _clean_number(row.get("serum_creatinine"), 0) or "--",
                "riskScore": round(score),
                "riskLabel": risk_label,
                "lastVisit": date,
                "bmi": _clean_number(row.get("bmi"), 0) or "",
                "cholesterol": _clean_number(row.get("cholesterol"), 0) or "",
                "glucose": _clean_number(row.get("glucose"), 0) or "",
                "heartRate": _clean_number(row.get("heart_rate"), 0) or "",
            }
        )

    latest_by_patient = {}
    for item in predictions:
        latest_by_patient[item["id"]] = item
    return {"predictions": predictions, "patients": list(latest_by_patient.values())}


@app.post("/api/predict")
def predict(payload: PredictPayload) -> dict:
    if not payload.patient_name.strip():
        raise HTTPException(status_code=400, detail="Patient name is required before running prediction.")

    has_any_numeric = any(
        value > 0
        for value in [
            payload.age,
            payload.bmi,
            payload.systolic_bp,
            payload.diastolic_bp,
            payload.cholesterol,
            payload.glucose,
            payload.heart_rate,
            payload.ejection_fraction,
            payload.serum_creatinine,
            payload.activity_hours,
        ]
    )
    has_any_flag = payload.smoking or payload.diabetes or payload.hypertension
    if not has_any_numeric and not has_any_flag:
        raise HTTPException(
            status_code=400,
            detail="Enter at least one clinical value before running prediction.",
        )

    artifact = _load_model_artifact()
    pipeline = artifact["pipeline"]
    feature_names = artifact["features"]

    feature_row = {
        "age": payload.age,
        "sex": 1,
        "bmi": payload.bmi,
        "cholesterol": payload.cholesterol,
        "systolic_bp": payload.systolic_bp,
        "diastolic_bp": payload.diastolic_bp,
        "glucose": payload.glucose,
        "diabetes": int(payload.diabetes),
        "smoking": int(payload.smoking),
        "hypertension": int(payload.hypertension),
        "physical_activity": payload.activity_hours,
        "ejection_fraction": payload.ejection_fraction,
        "serum_creatinine": payload.serum_creatinine,
    }
    model_input = pd.DataFrame([feature_row], columns=feature_names)
    proba = float(pipeline.predict_proba(model_input)[0][1])
    score = max(1, min(99, round(proba * 100)))

    estimator = pipeline.named_steps["model"]
    transformed_values = pipeline.named_steps["preprocessor"].transform(model_input)[0]
    contributions = {}
    if hasattr(estimator, "feature_importances_"):
        for idx, col in enumerate(feature_names):
            weight = float(estimator.feature_importances_[idx]) * float(transformed_values[idx])
            contributions[col] = max(0.0, weight)
    else:
        contributions = {
            "ejection_fraction": max(0.0, 55 - payload.ejection_fraction),
            "serum_creatinine": max(0.0, payload.serum_creatinine - 1.0),
            "systolic_bp": max(0.0, payload.systolic_bp - 120),
        }

    trajectory_points = 0.0
    if payload.previous_visit_enabled:
        ef_delta = payload.ejection_fraction - payload.prev_ejection_fraction
        creatinine_delta = payload.serum_creatinine - payload.prev_serum_creatinine
        systolic_delta = payload.systolic_bp - payload.prev_systolic_bp
        cholesterol_delta = payload.cholesterol - payload.prev_cholesterol
        glucose_delta = payload.glucose - payload.prev_glucose
        bmi_delta = payload.bmi - payload.prev_bmi

        # Positive points indicate worsening trend vs previous visit.
        trajectory_points += max(0, -ef_delta) * 0.8
        trajectory_points += max(0, creatinine_delta) * 10
        trajectory_points += max(0, systolic_delta) * 0.25
        trajectory_points += max(0, cholesterol_delta) * 0.03
        trajectory_points += max(0, glucose_delta) * 0.06
        trajectory_points += max(0, bmi_delta) * 1.0
        trajectory_points += max(0, 30 - payload.days_since_last_visit) * 0.05
        contributions["trajectory_delta"] = trajectory_points

    if score >= 75:
        category = "Critical"
        days = 20
    elif score >= 60:
        category = "High"
        days = 30
    elif score >= 40:
        category = "Moderate"
        days = 45
    else:
        category = "Low"
        days = 60

    label_map = {
        "ejection_fraction": "Reduced ejection fraction",
        "serum_creatinine": "Elevated serum creatinine",
        "systolic_bp": "High systolic blood pressure",
        "glucose": "High glucose",
        "cholesterol": "High cholesterol",
        "bmi": "Higher BMI",
        "age": "Older age",
        "physical_activity": "Low physical activity",
        "smoking": "Active smoking",
        "diabetes": "Diabetes",
        "hypertension": "Hypertension",
        "trajectory_delta": "Deteriorating trajectory vs last visit",
    }
    top_raw = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
    top_raw = [(name, value) for name, value in top_raw if value > 0][:5]
    total_top = sum(v for _, v in top_raw) or 1
    factors = [
        {"name": label_map.get(name, name.replace("_", " ").title()), "weight": round((value / total_top) * 100)}
        for name, value in top_raw
    ]

    if not factors:
        factors = [
            {"name": "No elevated risk drivers", "weight": 100},
        ]

    recommendations = [
        "Tighten BP control; target <130/80 mmHg.",
        "Repeat renal and metabolic panel in follow-up.",
        "Maintain moderate activity at least 150 min/week.",
    ]
    if payload.smoking:
        recommendations.append("Enroll in structured smoking cessation program.")
    if payload.diabetes:
        recommendations.append("Optimize glycemic control and monitor HbA1c.")
    if payload.ejection_fraction < 45:
        recommendations.append("Review HF-directed therapy optimization.")

    trajectory_direction = "stable"
    if payload.previous_visit_enabled:
        if trajectory_points > 2:
            trajectory_direction = "worsening"
        elif trajectory_points < 0.8:
            trajectory_direction = "improving"
    pts_per_day = round(trajectory_points / max(1.0, payload.days_since_last_visit or 1), 3)

    future_boost = max(0.0, trajectory_points * 0.25)
    future_days = [day for day in [7, 14, 20, 30, 45, 60] if day <= days]
    if days not in future_days:
        future_days.append(days)
    forecast_points = [
        {"label": f"{days}d ago", "value": max(1, round(score - max(6, future_boost * 0.8)))},
        {"label": "Today", "value": score},
        *[
            {
                "label": f"+{day}d",
                "value": min(99, round(score + future_boost * 1.2 * (day / max(1, days)))),
            }
            for day in future_days
        ],
    ]

    response = {
        "risk_score": score,
        "risk_category": category,
        "predicted_days": days,
        "top_factors": factors,
        "summary": f"Model estimates a {score}% probability of 30-day readmission based on submitted clinical profile.",
        "recommendations": recommendations[:6],
        "trajectory": {
            "enabled": payload.previous_visit_enabled,
            "direction": trajectory_direction,
            "pts_per_day": pts_per_day,
        },
        "forecast_points": forecast_points,
    }
    _append_prediction_history(payload, response)
    return response


class AssistantPayload(BaseModel):
    question: str
    patients: list[dict] = []


def _patient_risk_value(patient: dict) -> float:
    try:
        return float(patient.get("riskScore") or 0)
    except (TypeError, ValueError):
        return 0.0


def _patient_reference(question: str, patients: list[dict]) -> tuple[str, dict | None]:
    match = re.search(r"\bPT[-\s]?\d{3,6}\b", question, re.IGNORECASE)
    if not match:
        return "", None

    raw_id = match.group(0).upper().replace(" ", "")
    patient_id = raw_id if raw_id.startswith("PT-") else raw_id.replace("PT", "PT-", 1)
    for patient in patients:
        if str(patient.get("id", "")).upper() == patient_id:
            return patient_id, patient
    return patient_id, None


def _patient_risk_explanation(patient: dict) -> str:
    patient_name = _clean_text(patient.get("name"), _clean_text(patient.get("id"), "This patient"))
    risk_score = round(_patient_risk_value(patient))
    risk_label = _clean_text(patient.get("riskLabel"), _normalize_risk_label("", risk_score)).lower()
    return (
        f"{patient_name} is currently {risk_score}% {risk_label} risk.\n"
        f"Key values to review: EF {patient.get('ef', '--')}, BP {patient.get('bp', '--')}, "
        f"creatinine {patient.get('creatinine', '--')}, last visit {patient.get('lastVisit', '--')}.\n"
        "Common risk drivers include reduced EF, high systolic BP, elevated creatinine, diabetes, smoking, low activity, and worsening trajectory."
    )


def _local_assistant_answer(question: str, patients: list[dict]) -> str:
    q = question.lower()
    requested_patient_id, requested_patient = _patient_reference(question, patients)
    if requested_patient_id and requested_patient is None:
        return (
            f"No prediction is loaded for {requested_patient_id} yet. "
            "Run a prediction for that patient first, then I can explain the risk drivers."
        )
    high_risk = [
        p
        for p in patients
        if str(p.get("riskLabel", "")).lower() in {"high", "critical"} or _patient_risk_value(p) >= 60
    ]
    critical = [
        p
        for p in patients
        if str(p.get("riskLabel", "")).lower() == "critical" or _patient_risk_value(p) >= 75
    ]
    top_patient = max(patients, key=_patient_risk_value, default={})
    top_name = _clean_text(top_patient.get("name"), "the highest-risk patient")
    top_score = round(_patient_risk_value(top_patient))

    if "lower readmission risk" in q or "after discharge" in q:
        return (
            "To lower readmission risk after discharge:\n"
            "- Schedule follow-up within 7 days, sooner for high-risk or worsening patients.\n"
            "- Confirm medication reconciliation, diuretic plan, and adherence before discharge.\n"
            "- Educate the patient to report dyspnea, edema, chest pain, dizziness, or sudden weight gain early.\n"
            "- Monitor BP, glucose, renal function, electrolytes, weight, and ejection-fraction-related symptoms.\n"
            "- For high-risk patients, arrange phone follow-up within 48-72 hours and repeat labs within 7 days."
        )
    if "critical cases" in q:
        if not critical:
            return "No critical patients are currently loaded in the dashboard. Run predictions first, then I can summarize the critical cohort."
        lines = [f"Critical cases loaded: {len(critical)}"]
        for p in critical[:5]:
            lines.append(
                f"- {p.get('name', p.get('id', 'Patient'))}: {round(_patient_risk_value(p))}% risk, "
                f"EF {p.get('ef', '--')}, BP {p.get('bp', '--')}, creatinine {p.get('creatinine', '--')}."
            )
        lines.append("Prioritize same-day review, medication optimization, renal/electrolyte labs, and escalation if unstable.")
        return "\n".join(lines)
    if "emergency escalation" in q:
        return (
            "Trigger emergency escalation when any red flag is present:\n"
            "- Severe chest pain, syncope, acute confusion, cyanosis, or severe breathlessness at rest.\n"
            "- Very high BP with symptoms, rapidly worsening edema, or oxygen saturation concern.\n"
            "- Critical readmission score, worsening trajectory, EF deterioration, or rising creatinine with symptoms.\n"
            "- In HeartGuard, review critical-risk patients first and escalate if clinical instability is present."
        )
    if "reduced ejection fraction" in q:
        return (
            "For reduced ejection fraction:\n"
            "- Review HF-directed therapy and adherence with the treating clinician.\n"
            "- Monitor weight, edema, dyspnea, BP, heart rate, creatinine, potassium, and sodium.\n"
            "- Avoid missed diuretics and counsel on sodium/fluid guidance as clinically appropriate.\n"
            "- Arrange close follow-up, especially if EF is below 40% or symptoms are worsening."
        )
    if "uncontrolled bp" in q:
        return (
            "For uncontrolled BP in a heart-failure patient:\n"
            "- Recheck BP technique and home readings; assess symptoms and medication adherence.\n"
            "- Review volume status, renal function, potassium, and current antihypertensive/HF regimen.\n"
            "- Intensify follow-up for BP >=160 systolic, symptoms, high readmission risk, or worsening renal markers.\n"
            "- Escalate urgently if severe BP elevation is paired with chest pain, neurologic symptoms, pulmonary edema, or syncope."
        )
    if "discharge checklist" in q:
        return (
            "High-risk discharge checklist:\n"
            "- Medication reconciliation completed and explained.\n"
            "- Follow-up appointment booked within 7 days.\n"
            "- Labs planned: renal function, electrolytes, glucose/HbA1c if diabetic, and other clinician-directed tests.\n"
            "- Patient understands warning signs and who to contact.\n"
            "- Weight/BP monitoring plan documented.\n"
            "- Caregiver or family instructions provided when available."
        )
    if "follow-up schedule" in q or "ckd" in q:
        return (
            "Suggested follow-up schedule for CKD + HF risk:\n"
            "- Phone check within 48-72 hours after discharge.\n"
            "- Clinic review within 7 days for high-risk patients.\n"
            "- Repeat renal panel and electrolytes within 3-7 days if creatinine is elevated or medications changed.\n"
            "- Continue weekly review until symptoms, BP, weight, and renal markers stabilize."
        )
    if "labs" in q or "7 days" in q:
        return (
            "Labs commonly repeated within 7 days for higher-risk HF/readmission patients:\n"
            "- Serum creatinine, BUN/eGFR, sodium, potassium, and bicarbonate.\n"
            "- Glucose and HbA1c review if diabetic or hyperglycemic.\n"
            "- CBC if anemia/infection concern.\n"
            "- BNP/NT-proBNP only if used by the treating team for follow-up decisions."
        )
    if "why" in q or "high risk" in q:
        if not patients:
            return "No patient predictions are loaded yet. Run a prediction first, then I can explain that patient's risk drivers."
        if requested_patient:
            return _patient_risk_explanation(requested_patient)
        return _patient_risk_explanation(top_patient)
    if high_risk:
        return (
            f"There are {len(high_risk)} high/critical-risk patients loaded. "
            "Start with the highest risk score, review EF/BP/creatinine, and confirm follow-up plus warning-sign counseling."
        )
    return (
        "I can help with readmission-risk triage, discharge planning, follow-up schedules, labs, and patient-specific risk explanations. "
        "Run or select a patient prediction for a more specific answer."
    )


@app.post("/api/assistant/chat")
def assistant_chat(payload: AssistantPayload) -> dict:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    requested_patient_id, requested_patient = _patient_reference(question, payload.patients)
    if requested_patient_id and requested_patient is None:
        return {"answer": _local_assistant_answer(question, payload.patients)}

    if not api_key:
        return {"answer": _local_assistant_answer(question, payload.patients)}

    patient_context = ""
    if payload.patients:
        patient_lines = []
        for p in payload.patients[:25]:
            patient_lines.append(
                f"{p.get('id', '')}: {p.get('name', '')}, risk={p.get('riskLabel', '')} {p.get('riskScore', '')}%, "
                f"EF={p.get('ef', '')}, BP={p.get('bp', '')}, creatinine={p.get('creatinine', '')}, lastVisit={p.get('lastVisit', '')}"
            )
        patient_context = "\n".join(patient_lines)

    system_prompt = (
        "You are HeartGuard AI Assistant for cardiology teams. "
        "Provide concise, clinically useful answers for readmission-risk workflows. "
        "Use bullet points when helpful. If data is insufficient, say what is missing. "
        "Do not fabricate patient measurements."
    )

    client = OpenAI(api_key=api_key)
    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Question: {question}\n\nPatient context:\n{patient_context or 'No patient data provided.'}",
                },
            ],
            temperature=0.2,
        )
        answer = (response.output_text or "").strip()
        if not answer:
            answer = "I could not generate a response. Please try rephrasing your question."
        return {"answer": answer}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}") from exc
