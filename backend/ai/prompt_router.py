from backend.microsoft.azure_openai_mock import generate_response as azure_ai
from backend.ai.ollama_client import generate_response as local_ai

def route_prompt(prompt: str, mode: str = "local"):
    if mode == "azure":
        return azure_ai(prompt)
    return local_ai(prompt)
