import requests

class OlamaClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.olama.com/v1"

    def ask(self, prompt: str) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"prompt": prompt, "model": "olama-default"}
        response = requests.post(f"{self.base_url}/chat", json=payload, headers=headers)
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            return f"Error {response.status_code}: {response.text}"