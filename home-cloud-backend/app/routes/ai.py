from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.monitor import Monitor
from app.models.log import MonitorLog
from app.models.incident import Incident
from app.zkml.anomaly_detector import detector as zkml_detector
from app.config import get_settings
import httpx
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/ai", tags=["AI & ZKML"])

def call_external_ai(prompt: str) -> dict:
    """
    Calls the local Ollama service.
    """
    # Default to localhost if not specified
    base_url = settings.ai_service_url or "http://localhost:11434"
    url = f"{base_url}/api/generate"
    
    # Give Ollama a bit more time to respond
    timeout = httpx.Timeout(15.0, connect=3.0)
    
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    
    for attempt in range(2):
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return {"response": data.get("response")}
        except Exception as e:
            logger.warning(f"Ollama attempt {attempt + 1} failed: {e}")
            if attempt == 1:
                logger.error(f"Ollama unreachable at {url}")
    
    return {"message": "AI service unavailable", "fallback": True}

class AIQuery(BaseModel):
    query: str

class AIResponse(BaseModel):
    response: str

class ZKMLProofRequest(BaseModel):
    monitor_id: int

class ZKMLProofResponse(BaseModel):
    monitor_id: int
    is_anomaly: bool
    proof: dict
    verified: bool

@router.post("/zkml/detect", response_model=ZKMLProofResponse)
def detect_anomaly(data: ZKMLProofRequest, db: Session = Depends(get_db)):
    # Fetch last 10 logs for context
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == data.monitor_id).order_by(MonitorLog.timestamp.desc()).limit(10).all()
    if not logs:
        raise HTTPException(status_code=404, detail="No data for this monitor yet")
    
    latencies = [l.response_time for l in logs if l.response_time is not None]
    
    # Generate Mock ZK Proof
    proof_obj = zkml_detector.generate_proof(latencies)
    
    # Verify the proof (privacy-preserving layer)
    verified = zkml_detector.verify_proof(proof_obj)
    
    return {
        "monitor_id": data.monitor_id,
        "is_anomaly": proof_obj["is_anomaly"],
        "proof": proof_obj,
        "verified": verified
    }

# ... existing ai_query and ai_explain code ...

def analyze_logs(logs: List[MonitorLog], monitor_name: str) -> str:
    if not logs:
        return f"I don't have enough data for {monitor_name} yet."
    
    latest = logs[0]
    if latest.status == "UP":
        latency_info = f"Response time was healthy ({latest.response_time}ms)."
        if latest.dns_ms:
            latency_info += f" (DNS: {latest.dns_ms}ms, TCP: {latest.tcp_ms}ms, HTTP: {latest.http_ms}ms)."
        return f"Everything looks good with {monitor_name}. {latency_info}"
    
    # Analysis logic
    recent_failures = [l for l in logs[:5] if l.status == "DOWN"]
    
    if len(recent_failures) >= 1:
        error_context = latest.error_message or "Unknown Connection Error"
        analysis = f"H.O.M.E Analysis for {monitor_name}: We've detected a failure. "
        
        # Root Cause Detection
        if latest.dns_ms is None and "DNS" in error_context:
            analysis += "ROOT CAUSE: DNS Resolution Failure. The domain name could not be resolved to an IP address. Check your nameserver settings."
        elif latest.tcp_ms is None and "TCP" in error_context:
            analysis += "ROOT CAUSE: Network reachability issue (TCP). The server is not accepting connections on the specified port. This often indicates a firewall blocking the request or the service being completely stopped."
        elif latest.http_ms is None and "HTTP" in error_context:
            analysis += "ROOT CAUSE: Application Protocol Error. The server is reachable but failed to provide a valid HTTP response. This might be due to an SSL certificate mismatch or an immediate server-side reset."
        elif "500" in error_context or "Internal Server Error" in error_context:
            analysis += "ROOT CAUSE: Server-side Crash (500). Your application code likely encountered an unhandled exception. Check your server-side performance logs."
        elif "404" in error_context:
            analysis += "ROOT CAUSE: Missing Resource (404). The endpoint path is incorrect or the resource has been moved."
        elif "timeout" in error_context.lower():
            analysis += f"ROOT CAUSE: Request Timeout. The server took too long to respond (> {latest.response_time}ms). This suggests high load or database deadlocks."
        else:
            analysis += f"Detailed Error: '{error_context}'."
            
        return analysis
    
    return f"{monitor_name} is currently unstable. I'll continue to monitor for a pattern."

@router.post("/query", response_model=AIResponse)
def ai_query(data: AIQuery, db: Session = Depends(get_db)):
    # If external AI is configured, try it first
    if settings.ai_service_url:
        external_res = call_external_ai(data.query)
        if not external_res.get("fallback"):
            return {"response": external_res.get("response") or external_res.get("message")}

    # Simple semantic routing (Local Fallback)
    if "why" in data.query and "down" in data.query:
        # Find all down monitors
        down_monitors = db.query(Monitor).filter(Monitor.status == "DOWN").all()
        if not down_monitors:
            return {"response": "Actually, all your monitored websites are currently UP. Is there something else you're noticing?"}
        
        explanations = []
        for m in down_monitors:
            logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == m.id).order_by(MonitorLog.timestamp.desc()).limit(5).all()
            explanations.append(analyze_logs(logs, m.project_name))
        
        return {"response": "\n\n".join(explanations)}

    if "status" in data.query or "overview" in data.query:
        monitors = db.query(Monitor).all()
        up = len([m for m in monitors if m.status == "UP"])
        down = len([m for m in monitors if m.status == "DOWN"])
        return {"response": f"You currently have {len(monitors)} monitors configured. {up} are currently healthy (🟢 UP) and {down} are experiencing issues (🔴 DOWN)."}

    # Final fallback message if AI service failed and no local match
    if settings.ai_service_url:
        return {"response": "The Intelligence Core is currently recalibrating (Service Unavailable). Using local analytical engines.", "fallback": True}

    return {"response": "I'm your H.O.M.E Assistant. I can help you understand monitoring failures, analyze latency trends, or explain why a site is down. Try asking: 'Why is my website down?'"}

@router.get("/explain/{monitor_id}", response_model=AIResponse)
def ai_explain(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).order_by(MonitorLog.timestamp.desc()).limit(10).all()
    incidents = db.query(Incident).filter(Incident.monitor_id == monitor_id).order_by(Incident.started_at.desc()).limit(1).all()
    
    incident_context = ""
    if incidents:
        latest_incident = incidents[0]
        incident_context = f"Latest Incident: Status {latest_incident.status}, Severity: {latest_incident.severity}, Summary: {latest_incident.summary}, Root Cause: {latest_incident.root_cause}"
        
    # If external AI is configured, try it first
    if settings.ai_service_url:
        prompt = f"You are a DevOps AI. Explain why monitor {monitor.project_name} (URL: {monitor.url}) might be experiencing issues based on this data. Make it human readable and friendly. {incident_context}. Recent logs: {[l.error_message for l in logs]}"
        external_res = call_external_ai(prompt)
        if not external_res.get("fallback"):
            return {"response": external_res.get("response") or external_res.get("message")}

    # Local fallback logic utilizing classification engine
    if incidents and incidents[0].status == "OPEN":
        explanation = f"H.O.M.E Analysis for {monitor.project_name}: We've detected an ongoing failure.\n\n"
        explanation += f"System Classification: {incidents[0].summary}\n"
        explanation += f"Severity: {incidents[0].severity}\n"
        explanation += f"Detailed AI Insight: {incidents[0].root_cause}\n\n"
        explanation += "This is generated from our local privacy-first diagnostic engine."
        return {"response": explanation}

    explanation = analyze_logs(logs, monitor.project_name)
    return {"response": explanation}
