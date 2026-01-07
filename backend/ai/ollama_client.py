import subprocess

MODEL_NAME = "phi"  # lightweight & reliable

def generate_response(prompt: str) -> str:
    try:
        result = subprocess.run(
            ["ollama", "run", MODEL_NAME],
            input=prompt,
            text=True,
            capture_output=True,
            timeout=60
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Ollama error: {str(e)}"
