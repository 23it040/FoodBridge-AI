# FoodBridge AI Microservice

FastAPI microservice providing recommendation and prediction APIs for FoodBridge.

Quick start

1. Create a Python 3.12+ virtual env and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Train models (optional - service ships with training scripts):

```bash
python -m ai_service.training.train_models
```

3. Run the app:

```bash
uvicorn ai_service.app.main:app --host 0.0.0.0 --port 8001
```

Integration

See `integration_examples/node_integration.js` for example calls from the Node backend.
