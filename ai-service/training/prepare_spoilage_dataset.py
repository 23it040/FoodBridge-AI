import os
import json
import logging
import httpx
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

USDA_FOODKEEPER_URL = "https://www.fsis.usda.gov/shared/data/EN/foodkeeper.json"
HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
RAW_JSON_PATH = os.path.join(DATA_RAW_DIR, "usda_foodkeeper.json")
PROCESSED_CSV_PATH = os.path.join(DATA_PROCESSED_DIR, "spoilage_dataset.csv")

def ensure_directories():
    os.makedirs(DATA_RAW_DIR, exist_ok=True)
    os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

def fetch_foodkeeper_data():
    """
    Fetches official USDA FoodKeeper dataset from FSIS portal,
    caching to raw directory. Falls back to cached JSON if offline.
    """
    ensure_directories()
    
    if os.path.exists(RAW_JSON_PATH) and os.path.getsize(RAW_JSON_PATH) > 1000:
        logger.info(f"Checking cached FoodKeeper dataset at {RAW_JSON_PATH}...")
        try:
            with open(RAW_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "sheets" in data:
                    logger.info("Using cached USDA FoodKeeper dataset.")
                    return data
        except Exception as e:
            logger.warning(f"Error reading cache, will re-download: {e}")

    logger.info(f"Downloading official USDA FoodKeeper dataset from {USDA_FOODKEEPER_URL}...")
    try:
        with httpx.Client(timeout=45.0, follow_redirects=True, headers=HTTP_HEADERS) as client:
            response = client.get(USDA_FOODKEEPER_URL)
            response.raise_for_status()
            data = response.json()
            
        with open(RAW_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f)
        logger.info(f"Saved raw USDA FoodKeeper dataset to {RAW_JSON_PATH}")
        return data
    except Exception as e:
        logger.error(f"Failed to download USDA FoodKeeper data: {e}")
        if os.path.exists(RAW_JSON_PATH):
            logger.info("Falling back to local cached copy...")
            with open(RAW_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        raise RuntimeError(f"Could not retrieve USDA FoodKeeper data: {e}")

def metric_to_days(val, metric):
    """
    Converts FoodKeeper duration and metric string into numeric shelf life days.
    """
    if pd.isna(val) or pd.isna(metric):
        return None
    try:
        val = float(val)
    except (ValueError, TypeError):
        return None
        
    metric_str = str(metric).lower().strip()
    if "hour" in metric_str:
        return val / 24.0
    elif "day" in metric_str:
        return val
    elif "week" in metric_str:
        return val * 7.0
    elif "month" in metric_str:
        return val * 30.0
    elif "year" in metric_str:
        return val * 365.0
    elif "indefinite" in metric_str:
        return 3650.0
    return None

def process_foodkeeper_data(raw_data):
    """
    Processes USDA FoodKeeper sheets into structured food spoilage risk records.
    """
    sheets = {s["name"]: s["data"] for s in raw_data.get("sheets", []) if "name" in s}
    
    # 1. Parse Categories
    category_map = {}
    if "Category" in sheets:
        for row in sheets["Category"]:
            row_dict = {k: v for item in row for k, v in item.items()}
            cid = row_dict.get("ID")
            if cid is not None:
                category_map[cid] = row_dict.get("Category_Name", "Unknown")

    # 2. Parse CookingTips
    cooking_tips = {}
    if "CookingTips" in sheets:
        for row in sheets["CookingTips"]:
            row_dict = {k: v for item in row for k, v in item.items()}
            pid = row_dict.get("Product_ID")
            if pid is not None:
                cooking_tips[pid] = row_dict

    # 3. Parse Products
    products = []
    if "Product" in sheets:
        for row in sheets["Product"]:
            row_dict = {k: v for item in row for k, v in item.items()}
            products.append(row_dict)

    df_products = pd.DataFrame(products)
    logger.info(f"Loaded {len(df_products)} raw food products across {len(category_map)} USDA categories.")

    perishable_categories = {
        "Meat", "Poultry", "Seafood", "Dairy Products & Eggs",
        "Produce", "Deli & Prepared Foods", "Vegetarian Proteins"
    }

    records = []
    for _, row in df_products.iterrows():
        pid = row.get("ID")
        cid = row.get("Category_ID")
        category = category_map.get(cid, "Unknown")
        name = str(row.get("Name", "")).strip()
        subtitle = row.get("Name_subtitle")
        full_name = f"{name} - {subtitle}".strip() if pd.notna(subtitle) and str(subtitle).strip() else name

        p_metric = str(row.get("Pantry_Metric", "")).lower()
        dop_p_metric = str(row.get("DOP_Pantry_Metric", "")).lower()
        has_pantry_guidance = pd.notna(row.get("Pantry_Max")) or pd.notna(row.get("DOP_Pantry_Max"))
        requires_refrigeration = int(
            "not recommended" in p_metric or
            "not recommended" in dop_p_metric or
            (not has_pantry_guidance and (pd.notna(row.get("Refrigerate_Max")) or pd.notna(row.get("DOP_Refrigerate_Max"))))
        )

        is_perishable = int(category in perishable_categories)

        # Cooking tips / temperatures
        cook_info = cooking_tips.get(pid, {})
        safe_cook_temp = cook_info.get("Safe_Minimum_Temperature")
        has_cooking_temp = int(pd.notna(safe_cook_temp) and float(safe_cook_temp) > 0)
        cook_temp_val = float(safe_cook_temp) if has_cooking_temp else np.nan

        # If item strictly requires cold chain / refrigeration and has no safe pantry storage,
        # storing it at ambient pantry temperature is an immediate spoilage hazard per USDA safety guidelines (hours / 0.5 days).
        if requires_refrigeration and not has_pantry_guidance:
            records.append({
                "product_id": pid,
                "product_name": full_name,
                "category": category,
                "storage_condition": "pantry",
                "storage_temperature_c": 22.0,
                "is_opened": 0,
                "requires_refrigeration": 1,
                "has_cooking_temp": has_cooking_temp,
                "cooking_temperature_f": cook_temp_val,
                "is_perishable_category": is_perishable,
                "shelf_life_days": 0.5,
                "risk_level": "High",
                "spoilage_risk": 1
            })

        # Storage configurations from FoodKeeper
        storage_configs = [
            ("Pantry", "pantry", 22.0, 0, "Pantry_Min", "Pantry_Max", "Pantry_Metric"),
            ("DOP_Pantry", "pantry", 22.0, 0, "DOP_Pantry_Min", "DOP_Pantry_Max", "DOP_Pantry_Metric"),
            ("Pantry_After_Opening", "pantry", 22.0, 1, "Pantry_After_Opening_Min", "Pantry_After_Opening_Max", "Pantry_After_Opening_Metric"),
            ("Refrigerate", "refrigerated", 4.0, 0, "Refrigerate_Min", "Refrigerate_Max", "Refrigerate_Metric"),
            ("DOP_Refrigerate", "refrigerated", 4.0, 0, "DOP_Refrigerate_Min", "DOP_Refrigerate_Max", "DOP_Refrigerate_Metric"),
            ("Refrigerate_After_Opening", "refrigerated", 4.0, 1, "Refrigerate_After_Opening_Min", "Refrigerate_After_Opening_Max", "Refrigerate_After_Opening_Metric"),
            ("Freeze", "frozen", -18.0, 0, "Freeze_Min", "Freeze_Max", "Freeze_Metric"),
            ("DOP_Freeze", "frozen", -18.0, 0, "DOP_Freeze_Min", "DOP_Freeze_Max", "DOP_Freeze_Metric"),
        ]

        for prefix, condition, temp_c, is_opened, min_col, max_col, metric_col in storage_configs:
            metric_val = row.get(metric_col)
            max_val = row.get(max_col)
            min_val = row.get(min_col)

            not_recommended = (str(metric_val).lower() == "not recommended")
            if not_recommended:
                shelf_days = 0.5
            else:
                shelf_days = metric_to_days(max_val, metric_val)

            if shelf_days is not None:
                # USDA Food Safety Spoilage Threshold:
                # Food with shelf life <= 7 days or marked not recommended in storage condition has HIGH spoilage risk.
                # Food with shelf life > 7 days has LOW spoilage risk.
                is_high_risk = 1 if (shelf_days <= 7.0 or not_recommended) else 0

                records.append({
                    "product_id": pid,
                    "product_name": full_name,
                    "category": category,
                    "storage_condition": condition,
                    "storage_temperature_c": temp_c,
                    "is_opened": is_opened,
                    "requires_refrigeration": requires_refrigeration,
                    "has_cooking_temp": has_cooking_temp,
                    "cooking_temperature_f": cook_temp_val,
                    "is_perishable_category": is_perishable,
                    "shelf_life_days": round(float(shelf_days), 2),
                    "risk_level": "High" if is_high_risk == 1 else "Low",
                    "spoilage_risk": is_high_risk
                })

    df_out = pd.DataFrame(records)
    logger.info(f"Extracted {len(df_out)} real storage records from USDA FoodKeeper dataset.")
    logger.info(f"Target distribution:\n{df_out['spoilage_risk'].value_counts(normalize=True).round(4) * 100}%")
    return df_out

def prepare_spoilage_dataset():
    """
    Main entry point: downloads raw dataset, processes into feature table,
    and saves to data/processed/spoilage_dataset.csv.
    """
    ensure_directories()
    raw_data = fetch_foodkeeper_data()
    dataset = process_foodkeeper_data(raw_data)
    
    dataset.to_csv(PROCESSED_CSV_PATH, index=False)
    logger.info(f"Processed dataset successfully written to {PROCESSED_CSV_PATH}")
    return dataset

if __name__ == "__main__":
    prepare_spoilage_dataset()
