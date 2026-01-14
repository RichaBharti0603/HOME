from datetime import datetime
from sqlalchemy.orm import Session
from models.incident import Incident

def calculate_uptime(db: Session, website_id: int, start: datetime, end: datetime):
    total_seconds = (end - start).total_seconds()
    downtime = 0

    incidents = (
        db.query(Incident)
        .filter(
            Incident.website_id == website_id,
            Incident.started_at < end,
        )
        .all()
    )

    for inc in incidents:
        inc_start = max(inc.started_at, start)
        inc_end = min(inc.resolved_at or end, end)

        if inc_start < inc_end:
            downtime += (inc_end - inc_start).total_seconds()

    uptime_percentage = round(
        ((total_seconds - downtime) / total_seconds) * 100, 4
    )

    return {
        "uptime_percentage": uptime_percentage,
        "downtime_seconds": int(downtime),
        "total_seconds": int(total_seconds)
    }
