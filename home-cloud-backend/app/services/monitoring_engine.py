from sqlalchemy.orm import Session
from app.models.check_result import CheckResult
from app.models.incident import Incident
from app.database import SessionLocal

from app.services.monitoring.http_checker import check_website
from app.services.monitoring.ssl_checker import check_ssl
from app.services.compliance.header_scanner import scan_security_headers


async def run_full_scan(website):
    db: Session = SessionLocal()

    try:
        # 1️⃣ HTTP CHECK
        http_data = await check_website(website.domain)

        # 2️⃣ SSL CHECK
        clean_domain = website.domain.replace("https://", "").replace("http://", "")
        ssl_data = check_ssl(clean_domain)

        # 3️⃣ HEADER COMPLIANCE
        compliance_score = None

        if http_data["status"] == "UP":
            compliance_result = scan_security_headers(http_data.get("headers", {}))
            compliance_score = compliance_result["score"]

        # 4️⃣ SAVE RESULT
        result = CheckResult(
            website_id=website.id,
            status=http_data["status"],
            status_code=http_data.get("status_code"),
            response_time=http_data.get("response_time"),
            ssl_valid=ssl_data.get("ssl_valid"),
            ssl_expiry=ssl_data.get("ssl_expiry"),
            content_hash=http_data.get("content_hash"),
            compliance_score=compliance_score
        )

        db.add(result)
        db.commit()

        # 5️⃣ EVALUATE INCIDENTS
        evaluate_incidents(db, website, http_data, ssl_data, compliance_score)
        db.commit()

    finally:
        db.close()


def evaluate_incidents(db, website, http_data, ssl_data, compliance_score):

    # 1️⃣ Downtime
    if http_data["status"] == "DOWN":
        incident = Incident(
            website_id=website.id,
            type="downtime",
            severity="critical"
        )
        db.add(incident)

    # 2️⃣ SSL expired
    if ssl_data.get("ssl_valid") is False:
        incident = Incident(
            website_id=website.id,
            type="ssl",
            severity="high"
        )
        db.add(incident)

    # 3️⃣ Compliance failure
    if compliance_score is not None and compliance_score < 50:
        incident = Incident(
            website_id=website.id,
            type="compliance",
            severity="medium"
        )
        db.add(incident)
