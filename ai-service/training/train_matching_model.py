import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def load_and_preprocess_data(csv_path):
    print(f"Loading external dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Feature Engineering
    df['capacity_ratio'] = (df['ngo_capacity_meals'] / df['quantity_meals']).clip(upper=3.0)
    
    X = df[['food_category', 'quantity_meals', 'perishability_score', 'distance_km', 'time_urgency_hours', 'capacity_ratio']]
    y = df['matched']
    
    return X, y

def train_matching_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'data', 'external', 'foodgo', 'food_redistribution_dataset.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    X, y = load_and_preprocess_data(csv_path)
    
    categorical_features = ['food_category']
    numerical_features = ['quantity_meals', 'perishability_score', 'distance_km', 'time_urgency_hours', 'capacity_ratio']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    print("Training Random Forest Classifier model...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train_processed, y_train)
    
    y_pred = model.predict(X_test_processed)
    y_proba = model.predict_proba(X_test_processed)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_proba) if len(np.unique(y_test)) > 1 else 0.5
    
    print(f"Model Evaluation Metrics:")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {auc:.4f}")
    
    # Save artifacts
    model_path = os.path.join(models_dir, 'matching_model.pkl')
    preprocessor_path = os.path.join(models_dir, 'preprocessing.pkl')
    metadata_path = os.path.join(models_dir, 'metadata.json')
    
    joblib.dump(model, model_path)
    joblib.dump(preprocessor, preprocessor_path)
    
    metadata = {
        "model_name": "FoodBridge NGO Donation Matching Model",
        "model_version": "1.0.0",
        "algorithm": "RandomForestClassifier",
        "dataset_name": "FoodGo External Redistribution Dataset",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "features": {
            "numerical": numerical_features,
            "categorical": categorical_features
        },
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4)
        },
        "description": "Initial matching model trained on external public redistribution logistics data. Outputs non-probabilistic candidate compatibility match scores."
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Artifacts successfully saved to {models_dir}")
    return metadata

if __name__ == '__main__':
    train_matching_model()
