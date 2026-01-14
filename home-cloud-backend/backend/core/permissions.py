def require_role(user, allowed):
    if user.role not in allowed:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
