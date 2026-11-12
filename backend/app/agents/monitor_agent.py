"""Opt-in daily checker for configured scholarship URLs; records observable page changes."""
import hashlib
import os
import re
from html.parser import HTMLParser
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}: self.hidden += 1
    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self.hidden: self.hidden -= 1
    def handle_data(self, data):
        if not self.hidden and data.strip(): self.parts.append(data.strip())

from app.models.database import SessionLocal, ScholarshipDB, ScholarshipChangeDB, StudentProfileDB, StudentAlertDB

_DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d %B %Y", "%d %b %Y",
                 "%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y")


def _extract_deadline(text: str) -> str | None:
    """Extract a date only when it appears near explicit deadline language."""
    pattern = re.compile(r"(?:deadline|last\s+date(?:\s+to\s+apply)?|closing\s+date|apply\s+before)[^\n.]{0,100}?"
                         r"(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4}|"
                         r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
                         r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
                         r"Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})", re.IGNORECASE)
    match = pattern.search(text)
    if not match:
        return None
    value = re.sub(r"\s+", " ", match.group(1))
    formats = _DATE_FORMATS if "/" not in value and "-" not in value else _DATE_FORMATS[:3]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def _fetch(url: str) -> str:
    host = urlparse(url).hostname or ""
    default_hosts = "scholarships.gov.in,reliancefoundation.org,tatacapital.com,hdfcbank.com,aicte-jk-scholarship-gov.in,santoorscholarships.com,ffe.org,adityabirlacapital.com"
    allowed = {x.strip().lower().removeprefix("www.") for x in os.getenv("MONITOR_ALLOWED_HOSTS", default_hosts).split(",") if x.strip()}
    normalized_host = host.lower().removeprefix("www.")
    if not any(normalized_host == domain or normalized_host.endswith("." + domain) for domain in allowed):
        raise ValueError(f"Host {host} is not in MONITOR_ALLOWED_HOSTS")
    response = requests.get(url, timeout=15, headers={"User-Agent": "ScholarshipBuddyMonitor/1.0"})
    response.raise_for_status()
    if BeautifulSoup:
        soup = BeautifulSoup(response.text, "html.parser")
        for element in soup(["script", "style", "noscript"]):
            element.decompose()
        return " ".join(soup.stripped_strings)[:30000]
    parser = _TextExtractor()
    parser.feed(response.text)
    return " ".join(parser.parts)[:30000]


def scan_portals() -> dict:
    """Checks scholarship official URLs only; exact changes are logged and matching profiles alerted."""
    db = SessionLocal()
    changed = 0
    try:
        for scheme in db.query(ScholarshipDB).all():
            url = scheme.official_website
            try:
                content = _fetch(url)
            except Exception as exc:
                print(f"[Monitor] Skipping {scheme.id}: {exc}")
                continue
            digest = hashlib.sha256(content.encode()).hexdigest()
            extracted_deadline = _extract_deadline(content)
            old_deadline = scheme.deadline
            deadline_changed = bool(extracted_deadline and extracted_deadline != old_deadline)
            previous = db.query(ScholarshipChangeDB).filter_by(scholarship_id=scheme.id, field_name="page_hash").order_by(ScholarshipChangeDB.id.desc()).first()
            old_digest = previous.new_value if previous else None
            if old_digest == digest and not deadline_changed:
                continue
            change = ScholarshipChangeDB(scholarship_id=scheme.id, field_name="page_hash", old_value=old_digest,
                                         new_value=digest, source_url=url, detected_at=datetime.now(timezone.utc))
            db.add(change)
            if deadline_changed:
                db.add(ScholarshipChangeDB(scholarship_id=scheme.id, field_name="deadline", old_value=old_deadline,
                    new_value=extracted_deadline, source_url=url, detected_at=datetime.now(timezone.utc)))
                scheme.deadline = extracted_deadline
            db.flush()
            from app.models.schema import StudentProfile, MatchStatus
            from app.engine.eligibility_engine import EligibilityEngine
            from app.routers.scholarships import scholarship_db_to_pydantic
            scheme_data = scholarship_db_to_pydantic(scheme)
            for profile in db.query(StudentProfileDB).all():
                values = {column.name: getattr(profile, column.name) for column in StudentProfileDB.__table__.columns}
                try:
                    student = StudentProfile.model_validate(values)
                    match = EligibilityEngine.evaluate_scholarship(student, scheme_data)
                except Exception as exc:
                    print(f"[Monitor] Skipping profile {profile.id}: {exc}")
                    continue
                if match.match_status == MatchStatus.INELIGIBLE:
                    continue
                message = (f"The deadline for {scheme.name} changed from {old_deadline} to {extracted_deadline}. Verify the details: {url}"
                           if deadline_changed else f"The official page for {scheme.name} changed. Review its current deadline and requirements: {url}")
                db.add(StudentAlertDB(student_id=profile.id, scholarship_id=scheme.id,
                    message=message,
                    created_at=datetime.now(timezone.utc)))
            changed += 1
        db.commit()
        return {"changed_pages": changed}
    finally:
        db.close()


def start_scheduler():
    if os.getenv("ENABLE_DEADLINE_MONITOR", "false").lower() != "true":
        return None
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
    except ImportError:
        print("[Monitor] APScheduler is unavailable; monitor not started")
        return None
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(scan_portals, "interval", days=1, id="scholarship-page-monitor", replace_existing=True)
    scheduler.start()
    return scheduler
