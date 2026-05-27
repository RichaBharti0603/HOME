from fastapi import APIRouter, Depends, HTTPException, Request, status
from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.user import RegisterRequest, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

from app.utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

from fastapi.concurrency import run_in_threadpool
import time
from datetime import datetime

@router.post("/register", response_model=UserResponse)
async def register(user_in: RegisterRequest, db: Session = Depends(get_db)):
    try:
        if not user_in.email or not user_in.password:
            raise HTTPException(status_code=400, detail="Email and password required")

        email = user_in.email.strip().lower()
        print("REGISTER HIT:", {"email": email})
        start_time = time.time()
        
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Phase 1: Non-blocking password hashing
        hashed_password = await run_in_threadpool(get_password_hash, user_in.password)
        
        # Create new user
        db_user = User(
            email=email,
            password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Phase 1: Keep tenant creation simple and fast
        tenant = Tenant(
            owner_user_id=db_user.id,
            company_name=email.split("@")[0],
            subscription_plan="starter",
            payment_status="trial",
            onboarding_complete=False,
            trial_ends_at=datetime.utcnow() + timedelta(days=7)
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

        db_user.tenant_id = tenant.id
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"REGISTER CREATED user_id={db_user.id} email={db_user.email} tenant_id={db_user.tenant_id}")
        logger.info(f"/register took {time.time() - start_time:.4f}s")
        return db_user
    except HTTPException:
        # Avoid rolling back here, the DB layer will rollback via get_db if needed
        # Or rollback if we caught it inside the transaction logic
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"REGISTER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    try:
        start_time = time.time()
        content_type = request.headers.get("content-type", "")

        if "application/json" in content_type:
            payload = await request.json()
            raw_email = payload.get("email") or payload.get("username")
            raw_password = payload.get("password")
        else:
            form_data = await request.form()
            raw_email = form_data.get("username") or form_data.get("email")
            raw_password = form_data.get("password")

        if not raw_email or not raw_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login requires email and password.",
            )

        email = str(raw_email).strip().lower()
        password = str(raw_password)
        logger.info(f"LOGIN HIT email={email}")

        user = db.query(User).filter(User.email == email).first()
        logger.info(f"LOGIN LOOKUP email={email} found={bool(user)}")
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Phase 1: Non-blocking password verification
        try:
            is_valid = await run_in_threadpool(verify_password, password, user.password)
        except Exception as e:
            logger.error(f"Password verification exception: {e}")
            is_valid = False

        # Compatibility for any old rows accidentally saved as plain text.
        if not is_valid and user.password == password:
            user.password = await run_in_threadpool(get_password_hash, password)
            db.commit()
            is_valid = True

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logger.info(f"/login took {time.time() - start_time:.4f}s")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"LOGIN ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant = current_user.tenant
    return {
        "id": current_user.id,
        "email": current_user.email,
        "tenant_id": current_user.tenant_id,
        "onboarding_complete": tenant.onboarding_complete if tenant else False,
        "subscription_plan": tenant.subscription_plan if tenant else "none",
        "payment_status": tenant.payment_status if tenant else "none"
    }
