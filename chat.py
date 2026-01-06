# chat.py
import requests
import json

API_URL = "http://127.0.0.1:8000/ask"
CONSENT_URL = "http://127.0.0.1:8000/consent/grant"
USER_ID = "user_1"  # Change this for different users

def ensure_consent():
    """
    Ensure user has consent granted for AI usage.
    TR-CON-01: Consent required for AI usage
    """
    try:
        # Check if consent exists
        check_url = f"http://127.0.0.1:8000/consent/check?user_id={USER_ID}&purpose=ai_assistance"
        check_response = requests.get(check_url)
        
        if check_response.status_code == 200:
            data = check_response.json()
            if data.get("status") == "granted":
                return True
        
        # Grant consent if not granted
        grant_payload = {
            "user_id": USER_ID,
            "purpose": "ai_assistance",
            "expires_days": None  # Never expires for demo
        }
        grant_response = requests.post(CONSENT_URL, json=grant_payload)
        grant_response.raise_for_status()
        return True
    except requests.exceptions.RequestException:
        return False

def ask_question(question, top_k=3, stream=False):
    """
    Ask a question with security flow:
    Consent Check → Privacy Sanitizer → LLM → Response
    """
    # Ensure consent is granted
    if not ensure_consent():
        return "Error: Could not grant consent for AI usage."
    
    payload = {
        "question": question,
        "user_id": USER_ID,
        "top_k": top_k,
        "stream": stream
    }
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        
        answer = data.get("answer", "No answer received.")
        sanitization_applied = data.get("sanitization_applied", False)
        
        if sanitization_applied:
            # Note: Sensitive data was sanitized (for user awareness)
            pass  # Could add a note here if desired
        
        return answer
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            return f"Error: Consent required. Please grant consent first."
        return f"Error: {e}"
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"

def main():
    print("Welcome to Home AI Assistant!")
    print("Type 'exit' to quit.\n")
    
    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        
        answer = ask_question(question)
        print(f"Home: {answer}\n")

if __name__ == "__main__":
    main()
