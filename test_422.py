import requests
import uuid

email = f"test_{uuid.uuid4().hex[:8]}@example.com"
password = "testpassword123"

print(f"Registering {email}...")
r1 = requests.post("http://127.0.0.1:8000/register", json={"email": email, "password": password})
print("Register response:", r1.status_code, r1.text)

print(f"Logging in {email}...")
r2 = requests.post("http://127.0.0.1:8000/login", json={"email": email, "password": password})
print("Login response:", r2.status_code, r2.text)

token = r2.json().get("access_token")
if not token:
    print("Failed to get token!")
    exit(1)

print(f"Got token: {token[:10]}...")

payload = {
    "project_name": "My test monitor",
    "url": "https://example.com",
    "frequency": "1m",
    "monitor_type": "HTTP",
    "expected_status": 200,
    "expected_keyword": None,
    "alert_policy": {
        "channels": ["dashboard", "email"],
        "emails": [],
        "cooldown_minutes": 15
    },
    "retry_policy": {
        "max_retries": 3
    }
}

print("Creating monitor...")
r3 = requests.post(
    "http://127.0.0.1:8000/monitors",
    headers={"Authorization": f"Bearer {token}"},
    json=payload
)
print("Monitor response:", r3.status_code, r3.text)
