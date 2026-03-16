@router.get("/dashboard")
def dashboard(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    projects = db.query(Project).filter(
        Project.user_id == user_id
    ).all()

    return projects