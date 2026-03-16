"""
Train a RandomForest crop recommendation model.
Dataset: datasets/data_core.csv (project root)

Run from anywhere:
    python ml_service/train_crop_model.py
  or from inside ml_service/:
    python train_crop_model.py
"""
import os
import sys

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ── Paths (resolved relative to this file so they work from any cwd) ──────────
_HERE = os.path.dirname(os.path.abspath(__file__))          # ml_service/
_ROOT = os.path.dirname(_HERE)                               # project root

# Try both 'dataset/' (user-specified primary) and 'datasets/' (alternate)
def _find_dataset() -> str:
    candidates = [
        os.path.join(_ROOT, "dataset", "data_core.csv"),
        os.path.join(_ROOT, "datasets", "data_core.csv"),
    ]
    for p in candidates:
        if os.path.exists(os.path.abspath(p)):
            return os.path.abspath(p)
    return os.path.abspath(candidates[0])  # return primary path for error message

DATASET_PATH = _find_dataset()
MODELS_DIR = os.path.abspath(os.path.join(_HERE, "models"))
MODEL_PATH = os.path.join(MODELS_DIR, "crop_model.pkl")

FEATURES = ["Nitrogen", "Phosphorous", "Potassium", "Temparature", "Humidity", "Moisture"]
TARGET = "Crop Type"


def train_model() -> float:
    print("Loading dataset...")
    print(f"  Path: {DATASET_PATH}")

    if not os.path.exists(DATASET_PATH):
        print(f"ERROR: Dataset not found at {DATASET_PATH}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    # Strip any accidental whitespace from column names
    df.columns = df.columns.str.strip()

    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"  Columns: {list(df.columns)}")

    # Validate required columns exist
    missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
    if missing:
        print(f"ERROR: Missing columns: {missing}", file=sys.stderr)
        print(f"  Available: {list(df.columns)}", file=sys.stderr)
        sys.exit(1)

    df = df.dropna(subset=FEATURES + [TARGET])
    print(f"  After dropping NaN rows: {len(df)} rows")

    X = df[FEATURES].values
    y = df[TARGET].values

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    print(f"  Classes ({len(label_encoder.classes_)}): {list(label_encoder.classes_)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"  Train: {len(X_train)}, Test: {len(X_test)}")

    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy * 100:.2f}%")

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump({"model": model, "label_encoder": label_encoder}, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

    return accuracy


if __name__ == "__main__":
    train_model()
