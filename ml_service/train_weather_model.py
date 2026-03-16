"""
Train weather ML models:
  1. rain_classifier.pkl  — RandomForest classifier (rain / no rain)
  2. rainfall_model.pkl   — RandomForest regressor (rainfall mm)

Run from ml_service/ directory:
    py train_weather_model.py
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder

_ML_DIR = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_ML_DIR)
_MODELS_DIR = os.path.join(_ML_DIR, "models")
os.makedirs(_MODELS_DIR, exist_ok=True)

def _find(name):
    for base in [os.path.join(_ROOT, "dataset"), os.path.join(_ROOT, "datasets")]:
        p = os.path.join(base, name)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"{name} not found in dataset/ or datasets/")


def train_rain_classifier():
    print("[weather] Training rain classifier …")
    df = pd.read_csv(_find("weather_forecast_data.csv"))
    df.columns = df.columns.str.strip()
    df = df.dropna()

    features = ["Temperature", "Humidity", "Wind_Speed", "Cloud_Cover", "Pressure"]
    X = df[features].astype(float)
    y = (df["Rain"].str.strip().str.lower() == "rain").astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"[weather] Rain classifier accuracy: {acc:.2%}")

    out = os.path.join(_MODELS_DIR, "rain_classifier.pkl")
    joblib.dump({"model": model, "features": features}, out)
    print(f"[weather] Saved -> {out}")
    return model, features


def train_rainfall_regressor():
    print("[weather] Training rainfall regressor …")
    df = pd.read_csv(_find("rainfall_dataset.csv"))
    df.columns = df.columns.str.strip()
    df = df.dropna(subset=["PRECTOTCORR", "RH2M", "PS", "WS50M", "T2M_MAX", "T2M_MIN"])

    # Map to standard feature names
    df = df.rename(columns={
        "RH2M": "Humidity",
        "PS": "Pressure",
        "WS50M": "Wind_Speed",
        "T2M_MAX": "TempMax",
        "T2M_MIN": "TempMin",
        "PRECTOTCORR": "Rainfall",
    })
    df["Temperature"] = (df["TempMax"] + df["TempMin"]) / 2
    df["Cloud_Cover"] = 50.0  # not in dataset, use neutral default

    features = ["Temperature", "Humidity", "Wind_Speed", "Cloud_Cover", "Pressure"]
    X = df[features].astype(float)
    y = df["Rainfall"].astype(float).clip(lower=0)

    # Sample for speed (565k rows is large)
    if len(X) > 50000:
        idx = np.random.RandomState(42).choice(len(X), 50000, replace=False)
        X, y = X.iloc[idx], y.iloc[idx]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"[weather] Rainfall regressor MAE: {mae:.3f} mm")

    out = os.path.join(_MODELS_DIR, "rainfall_model.pkl")
    joblib.dump({"model": model, "features": features}, out)
    print(f"[weather] Saved -> {out}")
    return model, features


def train_model():
    train_rain_classifier()
    train_rainfall_regressor()
    print("[weather] All weather models trained successfully.")


if __name__ == "__main__":
    train_model()
