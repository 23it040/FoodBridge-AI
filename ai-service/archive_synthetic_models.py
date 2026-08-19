import shutil
from pathlib import Path

MODEL_DIR = Path(r"d:\FoodBridge-AI\ai-service\saved_models")
ARCHIVE_DIR = MODEL_DIR / "archive"
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

files_to_archive = {
    "demand_model.joblib": "demand_model_synthetic_unvalidated.joblib",
    "risk_model.joblib": "risk_model_synthetic_unvalidated.joblib",
    "priority_model.joblib": "priority_model_synthetic_unvalidated.joblib"
}

for src_name, dst_name in files_to_archive.items():
    src = MODEL_DIR / src_name
    dst = ARCHIVE_DIR / dst_name
    if src.exists():
        shutil.move(str(src), str(dst))
        print(f"Moved {src_name} -> archive/{dst_name}")
    else:
        print(f"File {src_name} already moved or not found.")
