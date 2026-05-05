from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

from fastapi.concurrency import run_in_threadpool
import time

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    start_time = time.time()
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    
    # Phase 1: Non-blocking password hashing
    hashed_password = await run_in_threadpool(get_password_hash, user_in.password)
    
    # Create new user
    db_user = User(
        email=user_in.email,
        password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Phase 1: Keep tenant creation simple and fast
    tenant = Tenant(
        owner_user_id=db_user.id,
        company_name=user_in.email.split("@")[0],
        subscription_plan="starter",
        payment_status="pending",
        onboarding_complete=False,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    db_user.tenant_id = tenant.id
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"/register took {time.time() - start_time:.4f}s")
    return db_user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: Session = Depends(get_db)):
    start_time = time.time()
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Phase 1: Non-blocking password verification
    is_valid = await run_in_threadpool(verify_password, user_in.password, user.password)
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

@router.get("/users/me")
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