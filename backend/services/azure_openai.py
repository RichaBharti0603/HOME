from openai import AzureOpenAI
from core.config import settings

client = AzureOpenAI(
    api_key=settings.AZURE_OPENAI_KEY,
    api_version="2024-02-01",
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
)

def ask_private_ai(prompt: str) -> str:
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": "You are a private enterprise AI assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
