import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.database import SessionLocal, ScholarshipDB, StudentProfileDB, init_db
from app.models.schema import (
    Scholarship,
    StudentProfile,
    OverallEligibilityResponse,
    MatchStatus,
    DocumentGuidanceItem,
    CategoryEnum,
    EducationLevelEnum,
)
from app.engine.eligibility_engine import EligibilityEngine
from app.agent.llm_agent import ScholarshipCopilotAgent
from app.data.scholarship_seed import SAMPLE_SCHOLARSHIPS

router = APIRouter(prefix="/api", tags=["Scholarships & Eligibility"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def scholarship_db_to_pydantic(db_obj: ScholarshipDB) -> Scholarship:
    return Scholarship(
        id=db_obj.id,
        name=db_obj.name,
        provider=db_obj.provider,
        provider_type=db_obj.provider_type,
        amount_per_year=db_obj.amount_per_year,
        amount_description=db_obj.amount_description,
        deadline=db_obj.deadline,
        official_website=db_obj.official_website,
        application_process=db_obj.application_process,
        contact_details=db_obj.contact_details,
        eligibility_rules=json.loads(db_obj.eligibility_rules_json),
        required_documents=json.loads(db_obj.required_documents_json),
        renewal_rules=db_obj.renewal_rules,
        description=db_obj.description,
        tags=json.loads(db_obj.tags_json) if db_obj.tags_json else [],
    )


@router.get("/scholarships", response_model=List[Scholarship])
def list_scholarships(
    query: Optional[str] = None,
    category: Optional[str] = None,
    education_level: Optional[str] = None,
    provider_type: Optional[str] = None,
    state: Optional[str] = None,
    max_income: Optional[float] = None,
    db: Session = Depends(get_db),
):
    db_items = db.query(ScholarshipDB).all()
    scholarships = [scholarship_db_to_pydantic(item) for item in db_items]

    # Filter logic
    filtered = scholarships

    if query:
        q = query.lower()
        filtered = [
            s for s in filtered
            if q in s.name.lower() or q in s.provider.lower() or q in s.description.lower() or any(q in t.lower() for t in s.tags)
        ]

    if category:
        filtered = [
            s for s in filtered
            if not s.eligibility_rules.allowed_categories
            or any(c.value.lower() == category.lower() for c in s.eligibility_rules.allowed_categories)
        ]

    if education_level:
        filtered = [
            s for s in filtered
            if not s.eligibility_rules.allowed_education_levels
            or any(e.value.lower() == education_level.lower() for e in s.eligibility_rules.allowed_education_levels)
        ]

    if provider_type:
        filtered = [s for s in filtered if s.provider_type.lower() == provider_type.lower()]

    if state:
        filtered = [
            s for s in filtered
            if not s.eligibility_rules.allowed_states
            or any(st.lower() == state.lower() for st in s.eligibility_rules.allowed_states)
        ]

    if max_income is not None:
        filtered = [
            s for s in filtered
            if s.eligibility_rules.max_annual_income is None
            or s.eligibility_rules.max_annual_income >= max_income
        ]

    return filtered


@router.get("/scholarships/{scholarship_id}", response_model=Scholarship)
def get_scholarship_by_id(scholarship_id: str, db: Session = Depends(get_db)):
    item = db.query(ScholarshipDB).filter(ScholarshipDB.id == scholarship_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return scholarship_db_to_pydantic(item)


@router.post("/eligibility/evaluate", response_model=OverallEligibilityResponse)
def evaluate_eligibility(student: StudentProfile, db: Session = Depends(get_db)):
    # Save student profile to DB
    profile_db = db.query(StudentProfileDB).filter(StudentProfileDB.id == student.id).first()
    if not profile_db:
        profile_db = StudentProfileDB(id=student.id or "profile_1")

    profile_dict = student.dict()
    # Convert enums to string for DB persistence
    profile_dict["category"] = student.category.value
    profile_dict["gender"] = student.gender.value
    profile_dict["education_level"] = student.education_level.value

    for key, val in profile_dict.items():
        if hasattr(profile_db, key):
            setattr(profile_db, key, val)

    db.add(profile_db)
    db.commit()

    # Load all scholarships
    db_items = db.query(ScholarshipDB).all()
    scholarships = [scholarship_db_to_pydantic(item) for item in db_items]

    # Evaluate deterministically
    matches = EligibilityEngine.evaluate_all(student, scholarships)

    eligible_count = len([m for m in matches if m.match_status == MatchStatus.ELIGIBLE])
    partially_count = len([m for m in matches if m.match_status == MatchStatus.PARTIALLY_ELIGIBLE])
    total_grant = sum(m.scholarship.amount_per_year for m in matches if m.match_status == MatchStatus.ELIGIBLE)

    # Agent guidance summary
    copilot = ScholarshipCopilotAgent()
    ai_summary = copilot.generate_overall_summary(student, matches)

    return OverallEligibilityResponse(
        student_profile=student,
        total_matches=len(matches),
        eligible_count=eligible_count,
        partially_eligible_count=partially_count,
        total_potential_grant_inr=total_grant,
        matches=matches,
        ai_summary=ai_summary,
    )


@router.post("/documents/guidance", response_model=List[DocumentGuidanceItem])
def get_document_guidance(student: StudentProfile, db: Session = Depends(get_db)):
    # Fetch all scholarships to gather documents
    db_items = db.query(ScholarshipDB).all()
    scholarships = [scholarship_db_to_pydantic(item) for item in db_items]

    matches = EligibilityEngine.evaluate_all(student, scholarships)

    # Collect documents needed for eligible & partially eligible scholarships
    relevant_matches = [m for m in matches if m.match_status != MatchStatus.INELIGIBLE]

    all_docs = []
    doc_to_scholarships = {}
    for m in relevant_matches:
        for doc in m.scholarship.required_documents:
            all_docs.append(doc)
            if doc not in doc_to_scholarships:
                doc_to_scholarships[doc] = []
            doc_to_scholarships[doc].append(m.scholarship.name)

    copilot = ScholarshipCopilotAgent()
    guidance = copilot.generate_document_guidance(student, all_docs)

    for item in guidance:
        item.required_for_scholarships = doc_to_scholarships.get(item.document_name, [])

    return guidance
