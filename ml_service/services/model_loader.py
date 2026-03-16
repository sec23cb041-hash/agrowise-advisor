import logging
import os
import sys

import joblib

try:
    import tensorflow as tf
    _TF_AVAILABLE = True
except ImportError:
    tf = None
    _TF_AVAILABLE = False
    print("[model_loader] TensorFlow not installed — image models disabled")

logger = logging.getLogger(__name__)

# ml_service/ directory (parent of services/)
_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODELS_DIR = os.path.join(_ML_DIR, "models")


def _maybe_train_crop_model() -> None:
    """Auto-train the crop recommendation model if crop_model.pkl is missing."""
    pkl_path = os.path.join(_MODELS_DIR, "crop_model.pkl")
    if os.path.exists(pkl_path):
        return

    logger.info("crop_model.pkl not found — auto-training now …")
    print("[model_loader] crop_model.pkl not found — auto-training now …")

    # Add ml_service/ to sys.path so train_crop_model can be imported directly
    if _ML_DIR not in sys.path:
        sys.path.insert(0, _ML_DIR)

    try:
        import train_crop_model
        train_crop_model.train_model()
    except Exception as exc:
        logger.error("Auto-training failed: %s", exc)
        print(f"[model_loader] Auto-training failed: {exc}")


# ── Singletons ────────────────────────────────────────────────────────────────
_crop_disease_model = None
_soil_model = None
_crop_recommend_model = None  # dict: {model, label_encoder}
_rain_classifier = None       # dict: {model, features}
_rainfall_regressor = None    # dict: {model, features}


def _maybe_train_weather_models() -> None:
    """Auto-train weather models if missing."""
    clf_path = os.path.join(_MODELS_DIR, "rain_classifier.pkl")
    reg_path = os.path.join(_MODELS_DIR, "rainfall_model.pkl")
    if os.path.exists(clf_path) and os.path.exists(reg_path):
        return

    logger.info("Weather models not found — auto-training now …")
    print("[model_loader] Weather models not found — auto-training now …")

    if _ML_DIR not in sys.path:
        sys.path.insert(0, _ML_DIR)

    try:
        import train_weather_model
        train_weather_model.train_model()
    except Exception as exc:
        logger.error("Weather model auto-training failed: %s", exc)
        print(f"[model_loader] Weather model auto-training failed: {exc}")


def load_models() -> None:
    global _crop_disease_model, _soil_model, _crop_recommend_model, _rain_classifier, _rainfall_regressor

    # ── TensorFlow image models ───────────────────────────────────────────────
    crop_path = os.path.join(_MODELS_DIR, "crop_disease_model.h5")
    soil_path = os.path.join(_MODELS_DIR, "soil_classification_model.h5")

    if _TF_AVAILABLE:
        try:
            _crop_disease_model = tf.keras.models.load_model(crop_path)
            logger.info("Crop disease model loaded from %s", crop_path)
        except (OSError, FileNotFoundError) as exc:
            logger.error("Failed to load crop disease model: %s", exc)
            _crop_disease_model = None

        try:
            _soil_model = tf.keras.models.load_model(soil_path)
            logger.info("Soil classification model loaded from %s", soil_path)
        except (OSError, FileNotFoundError) as exc:
            logger.error("Failed to load soil classification model: %s", exc)
            _soil_model = None
    else:
        _crop_disease_model = None
        _soil_model = None

    # ── Crop recommendation RandomForest ──────────────────────────────────────
    _maybe_train_crop_model()

    pkl_path = os.path.join(_MODELS_DIR, "crop_model.pkl")
    try:
        _crop_recommend_model = joblib.load(pkl_path)
        logger.info("Crop recommendation model loaded from %s", pkl_path)
        print(f"[model_loader] Crop recommendation model loaded from {pkl_path}")
    except (OSError, FileNotFoundError) as exc:
        logger.error("Failed to load crop recommendation model: %s", exc)
        _crop_recommend_model = None

    # ── Weather ML models ─────────────────────────────────────────────────────
    _maybe_train_weather_models()

    clf_path = os.path.join(_MODELS_DIR, "rain_classifier.pkl")
    reg_path = os.path.join(_MODELS_DIR, "rainfall_model.pkl")

    try:
        _rain_classifier = joblib.load(clf_path)
        logger.info("Rain classifier loaded from %s", clf_path)
        print(f"[model_loader] Rain classifier loaded from {clf_path}")
    except (OSError, FileNotFoundError) as exc:
        logger.error("Failed to load rain classifier: %s", exc)
        _rain_classifier = None

    try:
        _rainfall_regressor = joblib.load(reg_path)
        logger.info("Rainfall regressor loaded from %s", reg_path)
        print(f"[model_loader] Rainfall regressor loaded from {reg_path}")
    except (OSError, FileNotFoundError) as exc:
        logger.error("Failed to load rainfall regressor: %s", exc)
        _rainfall_regressor = None


def get_crop_disease_model():
    return _crop_disease_model


def get_soil_model():
    return _soil_model


def get_crop_recommend_model():
    """Return the crop recommendation bundle {model, label_encoder} or None."""
    return _crop_recommend_model


def get_rain_classifier():
    """Return the rain classifier bundle {model, features} or None."""
    return _rain_classifier


def get_rainfall_regressor():
    """Return the rainfall regressor bundle {model, features} or None."""
    return _rainfall_regressor
