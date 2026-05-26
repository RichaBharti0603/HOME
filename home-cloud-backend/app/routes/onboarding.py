from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.onboarding import UserOnboarding
from app.schemas.onboarding import OnboardingSetupRequest, OnboardingSetupResponse, OnboardingStatusResponse
from app.services.onboarding import complete_onboarding
from app.utils.security import get_current_user

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("/setup", response_model=OnboardingSetupResponse)
def setup_onboarding(
    data: OnboardingSetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return complete_onboarding(db, current_user, data)


@router.put("/complete", response_model=OnboardingSetupResponse)
def mark_onboarding_complete(
    data: OnboardingSetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return complete_onboarding(db, current_user, data)

@router.get("/status", response_model=OnboardingStatusResponse)
def get_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tenant = current_user.tenant
    if not tenant:
        raise HTTPException(status_code=400, detail="User has no tenant associated.")

    onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == current_user.id).first()
    notifications = onboarding.notification_settings if onboarding else None

    return OnboardingStatusResponse(
        onboarding_complete=tenant.onboarding_complete,
        trial_ends_at=tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None,
        website_url=onboarding.website_url if onboarding else None,
        website_name=onboarding.website_name if onboarding else None,
        website_type=onboarding.website_type if onboarding else None,
        current_step=onboarding.current_step if onboarding else 1,
        notify_email=notifications.notify_email if notifications else True,
        notify_dashboard=notifications.notify_dashboard if notifications else True,
        alert_email=notifications.alert_email if notifications else current_user.email,
        weekly_reports=notifications.weekly_reports if notifications else False,
        created_monitor_ids=onboarding.created_monitor_ids if onboarding and onboarding.created_monitor_ids else [],
        whatsapp_number=getattr(notifications, "whatsapp_number", None) if notifications else None,
    )
