import os
import sys
import json
import joblib
import shutil
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "milknew.csv"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
ARCHIVE_DIR = SAVED_MODELS_DIR / "archive"
REPORTS_DIR = BASE_DIR / "model_reports"

os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
os.makedirs(ARCHIVE_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def train_and_evaluate_risk_model():
    print("=== STEP 5A: LOADING MILK QUALITY DATASET ===")
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"Raw rows: {len(df)}, columns: {len(df.columns)}")

    # Standardize column names
    df.columns = [c.strip() for c in df.columns]
    col_mapping = {
        'pH': 'pH',
        'Temprature': 'temperature',
        'Taste': 'taste',
        'Odor': 'odor',
        'Fat': 'fat',
        'Turbidity': 'turbidity',
        'Colour': 'color',
        'Grade': 'grade'
    }
    df = df.rename(columns=col_mapping)

    feature_cols = ['pH', 'temperature', 'taste', 'odor', 'fat', 'turbidity', 'color']
    X = df[feature_cols].copy()
    y_raw = df['grade'].str.lower().str.strip()

    # Verify zero missing values
    if X.isnull().sum().sum() > 0 or y_raw.isnull().sum() > 0:
        raise ValueError("DATASET_VALIDATION_FAILED: Missing values detected in milk dataset.")

    # Target mapping: low -> 0 (High Risk), medium -> 1 (Medium Risk), high -> 2 (Low Risk)
    target_mapping = {'low': 0, 'medium': 1, 'high': 2}
    y = y_raw.map(target_mapping)

    print("=== STEP 5B: STRATIFIED TRAIN / VALIDATION / TEST SPLIT (70/15/15) ===")
    # First split: 70% Train, 30% Temp (Val + Test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    # Second split: 15% Val, 15% Test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    print(f"Train rows: {len(X_train)}, Val rows: {len(X_val)}, Test rows: {len(X_test)}")

    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "gradient_boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
        "hist_gradient_boosting": HistGradientBoostingClassifier(max_iter=100, random_state=42)
    }

    metrics_results = {
        "modelScope": "Milk quality classification",
        "dataset": "Milk Quality Dataset (milknew.csv)",
        "synthetic": False,
        "foodBridgeTrained": False,
        "split": {"trainRows": len(X_train), "valRows": len(X_val), "testRows": len(X_test)},
        "models": {}
    }

    best_model_name = None
    best_val_f1 = -1.0
    best_pipeline = None

    print("=== STEP 5C: TRAINING CANDIDATE CLASSIFICATION MODELS ===")
    for name, clf in candidates.items():
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', clf)
        ])
        pipeline.fit(X_train, y_train)

        # Val evaluation
        val_preds = pipeline.predict(X_val)
        val_probs = pipeline.predict_proba(X_val) if hasattr(pipeline, "predict_proba") else None

        val_acc = float(accuracy_score(y_val, val_preds))
        val_prec = float(precision_score(y_val, val_preds, average='macro', zero_division=0))
        val_rec = float(recall_score(y_val, val_preds, average='macro', zero_division=0))
        val_f1 = float(f1_score(y_val, val_preds, average='macro', zero_division=0))
        val_f1_weighted = float(f1_score(y_val, val_preds, average='weighted', zero_division=0))
        val_auc = float(roc_auc_score(y_val, val_probs, multi_class='ovr', average='macro')) if val_probs is not None else None
        val_cm = confusion_matrix(y_val, val_preds).tolist()

        # Test evaluation
        test_preds = pipeline.predict(X_test)
        test_probs = pipeline.predict_proba(X_test) if hasattr(pipeline, "predict_proba") else None

        test_acc = float(accuracy_score(y_test, test_preds))
        test_prec = float(precision_score(y_test, test_preds, average='macro', zero_division=0))
        test_rec = float(recall_score(y_test, test_preds, average='macro', zero_division=0))
        test_f1 = float(f1_score(y_test, test_preds, average='macro', zero_division=0))
        test_f1_weighted = float(f1_score(y_test, test_preds, average='weighted', zero_division=0))
        test_auc = float(roc_auc_score(y_test, test_probs, multi_class='ovr', average='macro')) if test_probs is not None else None
        test_cm = confusion_matrix(y_test, test_preds).tolist()

        print(f"[{name}] Val Accuracy: {val_acc:.4f}, Val F1-Macro: {val_f1:.4f} | Test Accuracy: {test_acc:.4f}, Test F1-Macro: {test_f1:.4f}")

        metrics_results["models"][name] = {
            "validation": {
                "accuracy": round(val_acc, 4),
                "precision_macro": round(val_prec, 4),
                "recall_macro": round(val_rec, 4),
                "f1_macro": round(val_f1, 4),
                "f1_weighted": round(val_f1_weighted, 4),
                "roc_auc_macro": round(val_auc, 4) if val_auc else None,
                "confusion_matrix": val_cm
            },
            "test": {
                "accuracy": round(test_acc, 4),
                "precision_macro": round(test_prec, 4),
                "recall_macro": round(test_rec, 4),
                "f1_macro": round(test_f1, 4),
                "f1_weighted": round(test_f1_weighted, 4),
                "roc_auc_macro": round(test_auc, 4) if test_auc else None,
                "confusion_matrix": test_cm
            }
        }

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            best_model_name = name
            best_pipeline = pipeline

    print(f"\n=== SELECTED MODEL: {best_model_name} (Val F1 Macro: {best_val_f1:.4f}) ===")
    metrics_results["selectedModel"] = best_model_name
    metrics_results["selectedModelMetrics"] = metrics_results["models"][best_model_name]

    with open(REPORTS_DIR / "risk_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_results, f, indent=2)

    print("=== STEP 5D: FEATURE IMPORTANCE ANALYSIS ===")
    clf_model = best_pipeline.named_steps['model']
    importances_data = {
        "model": best_model_name,
        "dataset": "Milk Quality Dataset (milknew.csv)",
        "features": feature_cols,
        "featureImportance": []
    }

    if hasattr(clf_model, 'feature_importances_'):
        imp_vals = clf_model.feature_importances_
        sorted_indices = np.argsort(imp_vals)[::-1]
        for rank, idx in enumerate(sorted_indices, 1):
            importances_data["featureImportance"].append({
                "feature": feature_cols[idx],
                "importance": float(round(imp_vals[idx], 6)),
                "rank": rank
            })
    else:
        importances_data["message"] = "Feature importance unavailable for selected model."

    with open(REPORTS_DIR / "risk_feature_importance.json", "w", encoding="utf-8") as f:
        json.dump(importances_data, f, indent=2)

    print("=== STEP 5E: SERIALIZING PIPELINE & ARCHIVING PREVIOUS ===")
    model_save_path = SAVED_MODELS_DIR / "risk_model.joblib"
    if model_save_path.exists():
        archive_path = ARCHIVE_DIR / f"risk_model_legacy_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
        shutil.copy(model_save_path, archive_path)
        print(f"Archived existing risk model to {archive_path}")

    joblib.dump(best_pipeline, model_save_path)
    print(f"Saved pipeline model to {model_save_path}")

    print("=== STEP 5F: SAVING MODEL METADATA & REGISTRY ===")
    test_metrics = metrics_results["models"][best_model_name]["test"]
    metadata = {
        "modelName": "Milk Quality Risk Model",
        "version": "1.0.0",
        "status": "EXTERNAL_DATA_MODEL",
        "foodBridgeTrained": False,
        "dataset": "Milk Quality Dataset",
        "datasetSource": "Public Kaggle Milk Quality Dataset (GitHub abnr/ml-data)",
        "target": "Grade",
        "targetClasses": {"0": "low (High Risk)", "1": "medium (Medium Risk)", "2": "high (Low Risk)"},
        "features": feature_cols,
        "trainRows": len(X_train),
        "validationRows": len(X_val),
        "testRows": len(X_test),
        "algorithm": best_model_name,
        "metrics": test_metrics,
        "scope": "Milk quality classification",
        "limitations": [
            "Model is trained exclusively on milk quality sensor readings.",
            "Requires physical sensor inputs (pH, temperature, taste, odor, fat, turbidity, color).",
            "FoodBridge does not currently collect physical sensor readings.",
            "Must NOT be applied to non-milk food categories."
        ]
    }

    with open(REPORTS_DIR / "risk_model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Update central model_registry.json
    registry_path = REPORTS_DIR / "model_registry.json"
    registry = {}
    if registry_path.exists():
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception:
            registry = {}

    registry["risk"] = {
        "modelName": "Milk Quality Risk Model",
        "version": "1.0.0",
        "status": "EXTERNAL_DATA_MODEL",
        "foodBridgeTrained": False,
        "scope": "Milk quality classification",
        "algorithm": best_model_name,
        "testMetrics": test_metrics,
        "modelFile": "ai-service/saved_models/risk_model.joblib",
        "lastUpdated": datetime.now().isoformat()
    }

    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

    print("Risk model training and serialization completed successfully!")

if __name__ == "__main__":
    train_and_evaluate_risk_model()
