import os
import glob

search_terms = [
    'temperature = 25',
    'temperature = 30',
    'temperature_c = 25',
    'remaining_hours = 5',
    'risk = "MEDIUM"',
    'confidence: 0.7',
    'confidence: 0.8',
    'fake',
    'mock'
]

matches = []
for root_dir in ['backend', 'ai-service', 'frontend/src']:
    for path in glob.glob(f'{root_dir}/**/*', recursive=True):
        if os.path.isfile(path) and not path.endswith('.joblib') and not '.venv' in path and not 'node_modules' in path and not 'dist' in path:
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            matches.append((path, term))
            except Exception:
                pass

print(f"Audit completed. Found {len(matches)} potential occurrences:")
for path, term in matches[:20]:
    print(f"  [{term}] in {path}")
