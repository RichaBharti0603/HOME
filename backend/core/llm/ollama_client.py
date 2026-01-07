import requests

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
MODEL_NAME = "mistral"

def generate_response(prompt: str) -> str:
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()

    return response.json()["response"]
