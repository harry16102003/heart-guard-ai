# Prediction Test Cases

These cases verify prediction behavior for both new patients and existing patients.
Exact risk scores can vary with the trained model, so expected results focus on
response shape, patient identity handling, history updates, and validation.

## API Base URL

```text
http://127.0.0.1:8000
```

## TC-01: New Patient Prediction

Purpose: Verify that a prediction can be created for a brand-new patient ID/name.

Request:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "patient_id": "PT-2001",
    "patient_name": "Aarav Mehta",
    "age": 58,
    "bmi": 29.4,
    "systolic_bp": 142,
    "diastolic_bp": 88,
    "cholesterol": 224,
    "glucose": 128,
    "heart_rate": 92,
    "ejection_fraction": 42,
    "serum_creatinine": 1.4,
    "activity_hours": 2,
    "smoking": false,
    "diabetes": true,
    "hypertension": true,
    "previous_visit_enabled": false
  }'
```

Expected:

- HTTP status is `200`.
- Response contains `risk_score`, `risk_category`, `predicted_days`,
  `top_factors`, `summary`, `recommendations`, `trajectory`, and
  `forecast_points`.
- `trajectory.enabled` is `false`.
- `/api/predictions/history` includes patient `PT-2001` with name
  `Aarav Mehta`.

## TC-02: Existing Patient Prediction With Previous Visit

Purpose: Verify that selecting an existing patient reuses the same patient ID and
enables previous-visit trajectory.

Precondition: Run TC-01 first, or use any patient already visible in the Patients
screen.

Request:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "patient_id": "PT-2001",
    "patient_name": "Aarav Mehta",
    "age": 58,
    "bmi": 30.1,
    "systolic_bp": 154,
    "diastolic_bp": 94,
    "cholesterol": 238,
    "glucose": 146,
    "heart_rate": 98,
    "ejection_fraction": 36,
    "serum_creatinine": 1.8,
    "activity_hours": 1,
    "smoking": false,
    "diabetes": true,
    "hypertension": true,
    "previous_visit_enabled": true,
    "days_since_last_visit": 21,
    "prev_ejection_fraction": 42,
    "prev_serum_creatinine": 1.4,
    "prev_systolic_bp": 142,
    "prev_cholesterol": 224,
    "prev_glucose": 128,
    "prev_bmi": 29.4
  }'
```

Expected:

- HTTP status is `200`.
- Response `trajectory.enabled` is `true`.
- Response `trajectory.direction` is usually `worsening` for this payload.
- `top_factors` can include `Deteriorating trajectory vs last visit`.
- `/api/predictions/history` contains another prediction row for `PT-2001`.
- The Patients screen keeps one current row for `PT-2001`, updated with latest
  prediction values.

## TC-03: New High-Risk Patient

Purpose: Verify new patient creation for a severe clinical profile.

Request:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "patient_id": "PT-2002",
    "patient_name": "Nisha Rao",
    "age": 72,
    "bmi": 34.7,
    "systolic_bp": 168,
    "diastolic_bp": 102,
    "cholesterol": 286,
    "glucose": 212,
    "heart_rate": 112,
    "ejection_fraction": 28,
    "serum_creatinine": 2.3,
    "activity_hours": 0,
    "smoking": true,
    "diabetes": true,
    "hypertension": true,
    "previous_visit_enabled": false
  }'
```

Expected:

- HTTP status is `200`.
- `risk_score` is between `1` and `99`.
- `risk_category` is one of `Low`, `Moderate`, `High`, or `Critical`.
- Recommendations include extra guidance for smoking, diabetes, and low
  ejection fraction.
- History includes `PT-2002`.

## TC-04: Existing Patient Selected By UI

Purpose: Verify frontend prediction flow for an existing patient.

Steps:

1. Open `http://127.0.0.1:5173/predict`.
2. In the patient search field, type an existing name or ID, for example
   `PT-2001`.
3. Select the suggestion.
4. Confirm the patient field changes to `Aarav Mehta (PT-2001)`.
5. Continue through the wizard and enter new current clinical values.
6. On the previous visit step, keep previous visit enabled.
7. Run prediction.

Expected:

- Previous visit fields are available only after selecting the existing patient.
- Prediction result appears without creating a duplicate patient ID.
- Patients, Dashboard, Analytics, and Prediction History use the updated
  `PT-2001` values.

## TC-05: New Patient Typed In UI

Purpose: Verify frontend prediction flow for a typed new patient.

Steps:

1. Open `http://127.0.0.1:5173/predict`.
2. Type a new patient name, for example `Kabir Shah`.
3. Confirm the UI displays `New patient will be created as PT-...`.
4. Continue through the wizard and enter at least one clinical value.
5. Run prediction.

Expected:

- Previous visit fields stay disabled because no existing patient was selected.
- Prediction result appears.
- New patient is added to Patients with the generated `PT-...` ID.
- Prediction History contains the new patient prediction.

## TC-06: Missing Patient Name Validation

Purpose: Verify backend rejects empty patient identity.

Request:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "patient_id": "PT-EMPTY",
    "patient_name": "",
    "age": 60
  }'
```

Expected:

- HTTP status is `400`.
- Error detail is `Patient name is required before running prediction.`

## TC-07: Missing Clinical Inputs Validation

Purpose: Verify backend rejects predictions with no clinical values or flags.

Request:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "patient_id": "PT-2003",
    "patient_name": "Minimal Input Patient"
  }'
```

Expected:

- HTTP status is `400`.
- Error detail is `Enter at least one clinical value before running prediction.`

## TC-08: History Deduplicates Patients But Keeps Predictions

Purpose: Verify history keeps every prediction while patient list shows latest
record per patient.

Steps:

1. Run TC-01.
2. Run TC-02.
3. Call:

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/api/predictions/history"
```

Expected:

- `predictions` includes at least two rows for `PT-2001`.
- `patients` includes only the latest row for `PT-2001`.
- Latest patient values match the TC-02 request.
