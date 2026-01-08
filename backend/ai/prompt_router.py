from backend.services.ollama_service import generate_response


def route_prompt(message: str, provider: str = "local"):
    if provider == "local":
        return generate_response(message)
    else:
        return "Provider not supported yet"
