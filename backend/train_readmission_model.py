from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "final"
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "readmission_model.joblib"


TARGET_COLUMN = "target"
FEATURE_COLUMNS = [
    "age",
    "sex",
    "bmi",
    "cholesterol",
    "systolic_bp",
    "diastolic_bp",
    "glucose",
    "diabetes",
    "smoking",
    "hypertension",
    "physical_activity",
    "ejection_fraction",
    "serum_creatinine",
]


def load_and_combine() -> pd.DataFrame:
    master_path = DATA_DIR / "heartguard_master_dataset_v1.csv"
    readmission_path = DATA_DIR / "heartguard_readmission_training_dataset.csv"

    master_df = pd.read_csv(master_path)
    master_df = master_df.rename(columns={"target": TARGET_COLUMN, "activity_hours": "physical_activity"})
    master_df = master_df.reindex(columns=FEATURE_COLUMNS + [TARGET_COLUMN])

    readmission_df = pd.read_csv(readmission_path)
    readmission_df = readmission_df.rename(
        columns={
            "target_binary": TARGET_COLUMN,
            "high_blood_pressure": "hypertension",
            "time": "physical_activity",
        }
    )
    readmission_df = readmission_df.reindex(columns=FEATURE_COLUMNS + [TARGET_COLUMN])

    combined_df = pd.concat([master_df, readmission_df], ignore_index=True)
    combined_df = combined_df.dropna(subset=[TARGET_COLUMN]).copy()
    combined_df[TARGET_COLUMN] = combined_df[TARGET_COLUMN].astype(int)
    return combined_df


def train() -> None:
    df = load_and_combine()
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                SimpleImputer(strategy="median"),
                FEATURE_COLUMNS,
            ),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=400,
        max_depth=14,
        min_samples_leaf=2,
        n_jobs=-1,
        random_state=42,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    pipeline.fit(X_train, y_train)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    artifact = {
        "pipeline": pipeline,
        "features": FEATURE_COLUMNS,
        "auc": float(auc),
        "rows": int(len(df)),
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"Saved model to: {MODEL_PATH}")
    print(f"Training rows: {len(df)}")
    print(f"Holdout ROC-AUC: {auc:.4f}")


if __name__ == "__main__":
    train()
