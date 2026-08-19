from pathlib import Path
from joblib import load

MODEL_DIR = Path('saved_models')
print('MODEL_DIR exists:', MODEL_DIR.exists())
files = list(MODEL_DIR.glob('*.joblib'))
print('found files:', [f.name for f in files])
results = []
for f in files:
    try:
        m = load(f)
        results.append((f.name, type(m).__name__))
    except Exception as e:
        results.append((f.name, 'ERROR:'+str(e)))

print('load results:')
for r in results:
    print(r)
