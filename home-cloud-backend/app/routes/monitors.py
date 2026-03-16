from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.monitor import Monitor
from app.schemas.monitor import MonitorCreate
from app.core.auth_dependency import get_current_user

router = APIRouter(prefix="/monitors", tags=["monitors"])


@router.post("/")
def create_monitor(
    monitor: MonitorCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_monitor = Monitor(
        url=monitor.url,
        check_interval=monitor.check_interval,
        project_id=monitor.project_id
    )

    db.add(new_monitor)
    db.commit()
    db.refresh(new_monitor)

    return new_monitor