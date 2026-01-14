import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "phi"


def generate_response(prompt: str) -> str:
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=120)

    if response.status_code != 200:
        raise RuntimeError(response.text)

    return response.json().get("response", "").strip()
