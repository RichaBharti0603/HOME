from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate
from app.core.auth_dependency import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/")
def create_project(
    project: ProjectCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_project = Project(
        name=project.name,
        type=project.type,
        user_id=user_id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project