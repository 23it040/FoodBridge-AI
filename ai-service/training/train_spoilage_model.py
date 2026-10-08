import os
import json
import logging
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "spoilage_dataset.csv")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
MODEL_OUTPUT_PATH = os.path.join(SAVED_MODELS_DIR, "spoilage_risk_model.joblib")
METADATA_OUTPUT_PATH = os.path.join(SAVED_MODELS_DIR, "spoilage_model_metadata.json")

CATEGORICAL_FEATURES = ["category", "storage_condition"]
NUMERICAL_FEATURES = [
    "storage_temperature_c",
    "is_opened",
    "requires_refrigeration",
    "has_cooking_temp",
    "cooking_temperature_f",
    "is_perishable_category"
]
TARGET_COLUMN = "spoilage_risk"

def load_data():
    """
    Loads the processed USDA FoodKeeper dataset.
    If not yet generated, invokes dataset preparation pipeline automatically.
    """
    if not os.path.exists(PROCESSED_CSV_PATH):
        logger.info(f"{PROCESSED_CSV_PATH} not found. Running prepare_spoilage_dataset...")
        from training.prepare_spoilage_dataset import prepare_spoilage_dataset
        prepare_spoilage_dataset()

    df = pd.read_csv(PROCESSED_CSV_PATH)
    logger.info(f"Loaded dataset with {len(df)} records from {PROCESSED_CSV_PATH}")
    return df

def build_pipeline():
    """
    Constructs a robust, production-ready scikit-learn Pipeline with:
    - Numerical Imputer (median) + StandardScaler
    - Categorical Imputer (constant) + OneHotEncoder (handling unseen categories)
    - RandomForestClassifier model with balanced class weights
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )

    classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])

    return pipeline

def train_and_evaluate():
    """
    Trains the spoilage risk classification model, computes real evaluation metrics,
    and serializes the pipeline and metadata artifacts.
    """
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    df = load_data()

    all_features = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
    X = df[all_features].copy()
    y = df[TARGET_COLUMN].copy()

    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    logger.info(f"Training split: {len(X_train)} samples | Test split: {len(X_test)} samples")
    logger.info(f"Training class distribution: Low (0): {(y_train == 0).sum()}, High (1): {(y_train == 1).sum()}")

    # Build and fit pipeline
    pipeline = build_pipeline()
    logger.info("Fitting preprocessing & classifier pipeline on training split...")
    pipeline.fit(X_train, y_train)

    # Predictions & probabilities on unseen test set
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    # Calculate real evaluation metrics (NOT hardcoded)
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))

    logger.info("=== Model Evaluation on Test Set ===")
    logger.info(f"  Accuracy:  {accuracy:.4f}")
    logger.info(f"  Precision: {precision:.4f}")
    logger.info(f"  Recall:    {recall:.4f}")
    logger.info(f"  F1-Score:  {f1:.4f}")
    logger.info(f"  ROC-AUC:   {roc_auc:.4f}")

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low Risk (0)", "High Risk (1)"]))

    # Save trained model pipeline with joblib
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    logger.info(f"Model pipeline successfully saved to {MODEL_OUTPUT_PATH}")

    # Prepare actual metadata
    metadata = {
        "model_name": "FoodBridge AI - Food Spoilage Risk Classifier",
        "model_version": "1.0.0",
        "dataset_source": "Official USDA Food Safety and Inspection Service (FoodKeeper Dataset)",
        "total_dataset_records": int(len(df)),
        "training_records": int(len(X_train)),
        "test_records": int(len(X_test)),
        "target_variable": TARGET_COLUMN,
        "target_classes": {
            "0": "Low Spoilage Risk (Shelf life > 7 days under storage condition)",
            "1": "High Spoilage Risk (Shelf life <= 7 days or unsafe storage condition)"
        },
        "features": {
            "categorical": CATEGORICAL_FEATURES,
            "numerical": NUMERICAL_FEATURES
        },
        "model_architecture": {
            "algorithm": "RandomForestClassifier",
            "parameters": {
                "n_estimators": 150,
                "max_depth": 8,
                "min_samples_split": 4,
                "min_samples_leaf": 2,
                "class_weight": "balanced",
                "random_state": 42
            }
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4)
        },
        "model_artifact": os.path.basename(MODEL_OUTPUT_PATH)
    }

    with open(METADATA_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Model metadata successfully saved to {METADATA_OUTPUT_PATH}")

    return pipeline, metadata

def verify_saved_model():
    """
    Verifies that the serialized .joblib model loads cleanly from disk
    and executes valid test inference.
    """
    logger.info(f"Verifying saved model artifact from {MODEL_OUTPUT_PATH}...")
    if not os.path.exists(MODEL_OUTPUT_PATH):
        raise FileNotFoundError(f"Model artifact not found at {MODEL_OUTPUT_PATH}")

    loaded_pipeline = joblib.load(MODEL_OUTPUT_PATH)

    test_samples = pd.DataFrame([
        {
            "category": "Dairy Products & Eggs",
            "storage_condition": "pantry",
            "storage_temperature_c": 22.0,
            "is_opened": 1,
            "requires_refrigeration": 1,
            "has_cooking_temp": 0,
            "cooking_temperature_f": np.nan,
            "is_perishable_category": 1
        },
        {
            "category": "Shelf Stable Foods",
            "storage_condition": "pantry",
            "storage_temperature_c": 22.0,
            "is_opened": 0,
            "requires_refrigeration": 0,
            "has_cooking_temp": 0,
            "cooking_temperature_f": np.nan,
            "is_perishable_category": 0
        },
        {
            "category": "Meat",
            "storage_condition": "frozen",
            "storage_temperature_c": -18.0,
            "is_opened": 0,
            "requires_refrigeration": 1,
            "has_cooking_temp": 1,
            "cooking_temperature_f": 160.0,
            "is_perishable_category": 1
        },
        {
            "category": "Deli & Prepared Foods",
            "storage_condition": "refrigerated",
            "storage_temperature_c": 4.0,
            "is_opened": 1,
            "requires_refrigeration": 1,
            "has_cooking_temp": 0,
            "cooking_temperature_f": np.nan,
            "is_perishable_category": 1
        }
    ])

    predictions = loaded_pipeline.predict(test_samples)
    probabilities = loaded_pipeline.predict_proba(test_samples)

    print("\n" + "=" * 60)
    print("VERIFICATION: Test Inference using Loaded .joblib Pipeline")
    print("=" * 60)
    for i, row in test_samples.iterrows():
        pred_label = "HIGH RISK (1)" if predictions[i] == 1 else "LOW RISK (0)"
        high_risk_prob = probabilities[i][1]
        print(f"Sample {i+1}: {row['category']} [{row['storage_condition']}, opened={row['is_opened']}, temp={row['storage_temperature_c']}°C]")
        print(f"  -> Predicted: {pred_label}")
        print(f"  -> High Spoilage Probability: {high_risk_prob * 100:.2f}%\n")

    return predictions, probabilities

if __name__ == "__main__":
    train_and_evaluate()
    verify_saved_model()
