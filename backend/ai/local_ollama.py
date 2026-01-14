import requests
OLLAMA_URL = "http://localhost:11434/api/generate"
def generate_local(prompt: str):
    payload = {
        "model": "phi",
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()

    return response.json()["response"]
