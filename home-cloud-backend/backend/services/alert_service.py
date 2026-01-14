from models.alert import Alert
from services.email_service import send_email

def dispatch_alerts(db, website, message):
    alerts = (
        db.query(Alert)
        .filter(
            Alert.website_id == website.id,
            Alert.enabled == True
        )
        .all()
    )

    for alert in alerts:
        if alert.channel == "email":
            send_email(
                alert.target,
                f"Website Alert: {website.url}",
                message
            )
