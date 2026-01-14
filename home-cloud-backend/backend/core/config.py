import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")

    AZURE_LANGUAGE_KEY = os.getenv("AZURE_LANGUAGE_KEY")
    AZURE_LANGUAGE_ENDPOINT = os.getenv("AZURE_LANGUAGE_ENDPOINT")

    AZURE_ANOMALY_KEY = os.getenv("AZURE_ANOMALY_KEY")
    AZURE_ANOMALY_ENDPOINT = os.getenv("AZURE_ANOMALY_ENDPOINT")

settings = Settings()
