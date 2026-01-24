from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.website import Website
from backend.auth.deps import get_current_user
router = APIRouter(tags=["Websites"])
@router.post("/")
def register_website(
    url: str,
    interval: int = 60,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    website = Website(
        url=url,
        interval=interval,
        tenant_id=current_user.tenant_id,
    )

    db.add(website)
    db.commit()
    db.refresh(website)

    return {
        "id": website.id,
        "url": website.url,
        "interval": website.interval,
        "status": "registered",
    }
@router.get("/")
def list_websites(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    websites = (
        db.query(Website)
        .filter(
            Website.tenant_id == current_user.tenant_id,
            Website.is_active == True,
        )
        .all()
    )

    return websites
@router.delete("/{website_id}")
def deactivate_website(
    website_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    website = (
        db.query(Website)
        .filter(
            Website.id == website_id,
            Website.tenant_id == current_user.tenant_id,
        )
        .first()
    )

    if not website:
        raise HTTPException(status_code=404, detail="Website not found")

    website.is_active = False
    db.commit()

    return {"message": "Website monitoring disabled"}
