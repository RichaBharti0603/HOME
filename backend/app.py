from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
from azure.ai.openai import OpenAIClient
from azure.core.credentials import AzureKeyCredential
import asyncio

# Security and Compliance imports
from backend.compliance.consent import ConsentManager, ConsentStatus
from backend.compliance.policy import PolicyManager, PolicyViolation
from backend.privacy.sanitizer import sanitize_prompt
from backend.audit.logger import AuditLogger, EventType, Severity

# Initialize Azure OpenAI
client = OpenAIClient(
    endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureKeyCredential(os.environ["AZURE_OPENAI_KEY"])
)

# Initialize Security and Compliance modules
consent_manager = ConsentManager()
policy_manager = PolicyManager()
audit_logger = AuditLogger()

app = FastAPI(title="HOME AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    user_id: str = None
    stream: bool = False

# ------------------------------
# Security Helper Functions
# ------------------------------
async def process_ai_request(prompt: str, user_id: str = None) -> tuple[str, dict]:
    """
    Process AI request with security checks.
    Flow: Consent Check → Privacy Sanitizer → LLM → Audit Log
    """
    purpose = "ai_assistance"
    
    # TR-CON-04: Consent check must occur before sanitizer
    # TR-CON-01: Consent required for AI usage
    # TR-CON-03: Missing consent must block AI request
    if user_id:
        consent_status = consent_manager.check_consent(user_id, purpose)
        if consent_status != ConsentStatus.GRANTED:
            # Log consent denial
            audit_logger.log_event(
                EventType.CONSENT_DENIED,
                Severity.MEDIUM,
                f"AI request denied due to missing/invalid consent",
                {'user_id': user_id, 'purpose': purpose},
                user_id
            )
            raise HTTPException(
                status_code=403,
                detail=f"Consent required for AI usage. Status: {consent_status.value}"
            )
    
    # Check policy compliance
    try:
        policy_manager.check_policy('privacy', {'has_consent': True})
    except PolicyViolation as e:
        audit_logger.log_event(
            EventType.POLICY_VIOLATION,
            Severity.HIGH,
            f"Policy violation: {e.policy_name} - {e.violation_type}",
            {'details': e.details},
            user_id
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # TR-AI-01: Prompt must pass sanitizer before LLM
    # TR-AI-03: Raw prompt must never be logged
    sanitization_result = sanitize_prompt(prompt)
    sanitized_prompt = sanitization_result.sanitized_text
    
    # Log AI request (with sanitization info, not raw prompt)
    audit_logger.log_event(
        EventType.AI_REQUEST,
        Severity.LOW,
        "AI request processed",
        sanitization_result.to_dict(),  # TR-AI-03: No raw prompt
        user_id
    )
    
    return sanitized_prompt, sanitization_result.to_dict()

# ------------------------------
# Helper: Stream Azure AI response
# ------------------------------
async def generate_streaming_answer(sanitized_prompt: str):
    """
    Generate streaming answer using sanitized prompt.
    TR-AI-04: Sanitized prompt only used for inference
    """
    # Use async generator for streaming
    chat = client.chat_completions.begin_create(
        model="gpt-4",
        messages=[{"role": "user", "content": sanitized_prompt}],
        streaming=True
    )
    async for chunk in chat:
        # chunk is partial content
        if chunk.delta and "content" in chunk.delta:
            yield chunk.delta["content"]
            await asyncio.sleep(0.01)  # smooth streaming

# ------------------------------
# AI endpoint: Streaming
# ------------------------------
@app.post("/ask_stream")
async def ask_stream(payload: Query):
    """
    Streaming AI endpoint with security checks.
    Flow: Consent → Sanitize → LLM → Response
    """
    try:
        # Process request with security checks
        sanitized_prompt, sanitization_info = await process_ai_request(
            payload.question,
            payload.user_id
        )
        
        # Generate streaming response
        return StreamingResponse(
            generate_streaming_answer(sanitized_prompt),
            media_type="text/plain"
        )
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(
            EventType.SYSTEM_EVENT,
            Severity.HIGH,
            f"Error processing AI request: {str(e)}",
            {},
            payload.user_id
        )
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------------
# AI endpoint: Synchronous
# ------------------------------
@app.post("/ask")
async def ask(payload: Query):
    """
    Synchronous AI endpoint with security checks.
    Flow: Consent → Sanitize → LLM → Audit Log → Response
    """
    try:
        # Process request with security checks
        sanitized_prompt, sanitization_info = await process_ai_request(
            payload.question,
            payload.user_id
        )
        
        # TR-AI-04: Sanitized prompt only used for inference
        response = client.chat_completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": sanitized_prompt}]
        )
        answer = response.choices[0].message.content
        
        return {
            "answer": answer,
            "sanitization_applied": sanitization_info.get("was_sanitized", False)
        }
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(
            EventType.SYSTEM_EVENT,
            Severity.HIGH,
            f"Error processing AI request: {str(e)}",
            {},
            payload.user_id
        )
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------------
# Consent Management Endpoints
# ------------------------------
class ConsentRequest(BaseModel):
    user_id: str
    purpose: str = "ai_assistance"
    expires_days: Optional[int] = None

@app.post("/consent/grant")
async def grant_consent(request: ConsentRequest):
    """Grant consent for AI usage."""
    success = consent_manager.grant_consent(
        request.user_id,
        request.purpose,
        request.expires_days
    )
    
    audit_logger.log_event(
        EventType.CONSENT_GRANTED,
        Severity.LOW,
        f"Consent granted for {request.purpose}",
        {'purpose': request.purpose, 'expires_days': request.expires_days},
        request.user_id
    )
    
    return {
        "success": success,
        "user_id": request.user_id,
        "purpose": request.purpose
    }

@app.get("/consent/check")
async def check_consent(user_id: str, purpose: str = "ai_assistance"):
    """Check consent status."""
    status = consent_manager.check_consent(user_id, purpose)
    return {"user_id": user_id, "purpose": purpose, "status": status.value}
