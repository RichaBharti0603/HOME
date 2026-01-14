from fastapi import APIRouter
from services.compliance_ai import scan_compliance
from models.schemas import PromptRequest

router = APIRouter(prefix="/compliance", tags=["Compliance AI"])

@router.post("/scan")
def scan_text(request: PromptRequest):
    findings = scan_compliance(request.prompt)
    return {
        "risk_detected": len(findings) > 0,
        "findings": findings
    }
