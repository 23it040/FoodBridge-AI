import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

def evaluate_matching_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, 'models')
    csv_path = os.path.join(base_dir, 'data', 'external', 'foodgo', 'food_redistribution_dataset.csv')
    
    model_path = os.path.join(models_dir, 'matching_model.pkl')
    preprocessor_path = os.path.join(models_dir, 'preprocessing.pkl')
    metadata_path = os.path.join(models_dir, 'metadata.json')
    
    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        print("Error: Trained model or preprocessor artifact not found. Please run train_matching_model.py first.")
        return
        
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    
    df = pd.read_csv(csv_path)
    df['capacity_ratio'] = (df['ngo_capacity_meals'] / df['quantity_meals']).clip(upper=3.0)
    
    X = df[['food_category', 'quantity_meals', 'perishability_score', 'distance_km', 'time_urgency_hours', 'capacity_ratio']]
    y = df['matched']
    
    X_processed = preprocessor.transform(X)
    y_pred = model.predict(X_processed)
    y_proba = model.predict_proba(X_processed)[:, 1]
    
    report = classification_report(y, y_pred, output_dict=True)
    cm = confusion_matrix(y, y_pred).tolist()
    
    print("=== MODEL EVALUATION REPORT ===")
    print(classification_report(y, y_pred))
    print("Confusion Matrix:")
    print(cm)
    
    with open(metadata_path, 'r') as f:
        meta = json.load(f)
        
    meta['evaluation_details'] = {
        "classification_report": report,
        "confusion_matrix": cm
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(meta, f, indent=2)
        
    print(f"Evaluation report updated in {metadata_path}")

if __name__ == '__main__':
    evaluate_matching_model()
