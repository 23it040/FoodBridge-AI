"""
DEPRECATED / BLOCKED: Synthetic model generation script.

Antigravity & FoodBridge strict data integrity rules forbid synthetic model training.
For real model training on real public datasets, use:
ai-service/training/train_demand_model.py
"""

def main():
    raise RuntimeError(
        "SYNTHETIC DATA DISABLED: Training models on synthetic data is blocked. "
        "Use real public datasets (e.g. ai-service/training/train_demand_model.py)."
    )

if __name__ == '__main__':
    main()
