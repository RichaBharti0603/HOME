# backend/models/local_llm.py
from typing import Generator, Optional


def generate_response(
    prompt: str,
    context: Optional[str] = None
) -> str:
    """
    Phase 1 local LLM stub.
    Canonical interface: prompt + optional context.
    """

    if context:
        return (
            "HOME AI Response\n"
            "----------------\n"
            f"Prompt: {prompt}\n\n"
            f"Context:\n{context}"
        )

    return f"HOME AI Response: {prompt}"


def run_llm(prompt: str, context: Optional[str] = None) -> str:
    return generate_response(prompt=prompt, context=context)


def run_llm_stream(
    prompt: str,
    context: Optional[str] = None
) -> Generator[str, None, None]:
    response = generate_response(prompt=prompt, context=context)
    for token in response.split():
        yield token + " "

# ---- Compatibility alias ----
def generate_streaming_answer(
    prompt: str,
    context: Optional[str] = None
) -> Generator[str, None, None]:
    """
    Backward-compatible streaming API expected by server layer.
    """
    return run_llm_stream(prompt=prompt, context=context)
