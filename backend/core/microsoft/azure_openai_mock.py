def generate_response(prompt: str) -> str:
    return (
        "Microsoft Azure OpenAI (Mock)\n\n"
        "This response simulates enterprise-grade Azure OpenAI integration.\n"
        "Prompt received securely.\n\n"
        f"Prompt summary: {prompt[:200]}..."
    )
