def check_content(prompt: str) -> bool:
    banned_words = ["password", "credit card", "ssn"]
    return not any(word in prompt.lower() for word in banned_words)
