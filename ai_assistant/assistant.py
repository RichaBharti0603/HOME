from olama_client import OlamaClient
from summarizer import summarize_monitors

class HomeAI:
    def __init__(self, olama_api_key: str):
        self.client = OlamaClient(api_key=olama_api_key)

    def process_monitors(self, monitors: list) -> str:
        """
        Summarize monitor data and get suggestions from Olama.
        """
        summary = summarize_monitors(monitors)
        prompt = f"You are an assistant for a monitoring system.\n{summary}\nSuggest actions for the user."
        response = self.client.ask(prompt)
        return response