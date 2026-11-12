"""Small, framework-independent tools shared by the agent workflows."""
import json
from typing import Any, Optional

from app.engine.eligibility_engine import EligibilityEngine
from app.models.database import SessionLocal, ScholarshipDB
from app.routers.scholarships import scholarship_db_to_pydantic
from app.rag.pipeline import search


def vector_search(query: str, k: int = 5, filters: Optional[dict] = None) -> list[dict]:
    return search(query, k=k,
                  filter_scholarship_id=(filters or {}).get("scholarship_id"),
                  filter_doc_type=(filters or {}).get("document_type"))


def get_scholarship_by_id(scholarship_id: str):
    db = SessionLocal()
    try:
        item = db.query(ScholarshipDB).filter(ScholarshipDB.id == scholarship_id).first()
        return scholarship_db_to_pydantic(item) if item else None
    finally:
        db.close()


def run_rule_engine(profile, scholarship_id: Optional[str] = None) -> list[dict]:
    db = SessionLocal()
    try:
        rows = db.query(ScholarshipDB)
        if scholarship_id:
            rows = rows.filter(ScholarshipDB.id == scholarship_id)
        matches = EligibilityEngine.evaluate_all(profile, [scholarship_db_to_pydantic(x) for x in rows.all()])
        return [m.model_dump(mode="json") for m in matches]
    finally:
        db.close()


def save_sop_draft(student_id: str, scholarship_id: str, content: str) -> int:
    from datetime import datetime, timezone
    from app.models.database import SOPDraftDB
    db = SessionLocal()
    try:
        draft = SOPDraftDB(student_id=student_id, scholarship_id=scholarship_id,
                           content=content, created_at=datetime.now(timezone.utc))
        db.add(draft); db.commit(); db.refresh(draft)
        return draft.id
    finally:
        db.close()


def flag_students_for_notification(criteria: dict) -> int:
    """Persist alerts for selected profile IDs, optionally limited by scholarship ID."""
    from datetime import datetime, timezone
    from app.models.database import StudentAlertDB
    db = SessionLocal()
    try:
        query = db.query(ScholarshipDB)
        scholarship_id = criteria.get("scholarship_id")
        if scholarship_id:
            query = query.filter(ScholarshipDB.id == scholarship_id)
        scholarship_ids = [item.id for item in query.all()]
        profile_ids = criteria.get("student_ids") or []
        if not profile_ids or not scholarship_ids:
            return 0
        for student_id in profile_ids:
            for target_id in scholarship_ids:
                db.add(StudentAlertDB(student_id=student_id, scholarship_id=target_id,
                    message=criteria.get("message", "A scholarship update may need your attention."),
                    created_at=datetime.now(timezone.utc)))
        db.commit()
        return len(profile_ids) * len(scholarship_ids)
    finally:
        db.close()
