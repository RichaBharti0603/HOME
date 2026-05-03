import stripe
import json
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import get_settings
from app.models.tenant import Tenant
from app.models.billing import Billing
from app.utils.security import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["Billing"])
settings = get_settings()

stripe.api_key = settings.stripe_secret_key

class SubscriptionRequest(BaseModel):
    plan_id: str

@router.get("/plans")
def get_plans():
    return [
        {"id": "starter", "name": "Starter", "price": 1000, "interval": "month", "features": ["Basic Monitoring", "Email Alerts"]},
        {"id": "pro", "name": "Pro", "price": 2900, "interval": "month", "features": ["Advanced Analytics", "Webhook Alerts", "SLA Reports"]},
        {"id": "enterprise", "name": "Enterprise", "price": 9900, "interval": "month", "features": ["Dedicated Support", "Custom Intervals", "API Access"]}
    ]

@router.post("/subscription/create")
def create_subscription(req: SubscriptionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.tenant:
        raise HTTPException(status_code=400, detail="User does not belong to a tenant yet.")
    
    tenant = current_user.tenant
    
    plan_mapping = {
        "starter": {"name": "Starter Plan", "amount": 1000},
        "pro": {"name": "Pro Plan", "amount": 2900},
        "enterprise": {"name": "Enterprise Plan", "amount": 9900}
    }
    
    selected_plan = plan_mapping.get(req.plan_id)
    if not selected_plan:
        raise HTTPException(status_code=400, detail="Invalid plan ID.")
        
    # Update tenant plan
    tenant.subscription_plan = req.plan_id
    db.commit()
        
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': selected_plan['name'],
                    },
                    'unit_amount': selected_plan['amount'],
                    'recurring': {'interval': 'month'},
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.frontend_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/setup",
            client_reference_id=str(tenant.id),
            customer_email=current_user.email
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    payload = await request.body()
    try:
        if settings.stripe_webhook_secret == "whsec_dummy":
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        else:
            event = stripe.Webhook.construct_event(payload, stripe_signature, settings.stripe_webhook_secret)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        tenant_id_str = session.get('client_reference_id')
        if tenant_id_str:
            tenant_id = int(tenant_id_str)
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            if tenant:
                tenant.payment_status = "active"
                tenant.onboarding_complete = True
                tenant.stripe_customer_id = session.get('customer')
                
                billing = Billing(
                    tenant_id=tenant.id,
                    subscription_id=session.get('subscription'),
                    amount=session.get('amount_total', 0) / 100.0,
                    status="active"
                )
                db.add(billing)
                db.commit()

    return {"status": "success"}
