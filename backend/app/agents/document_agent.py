from app.rag.pipeline import search
from app.agent.llm_agent import ScholarshipCopilotAgent


def advise_documents(profile, scholarship_id: str | None = None) -> dict:
    from app.routers.scholarships import get_db, scholarship_db_to_pydantic
    from app.models.database import SessionLocal, ScholarshipDB
    db = SessionLocal()
    try:
        rows = db.query(ScholarshipDB)
        if scholarship_id:
            rows = rows.filter(ScholarshipDB.id == scholarship_id)
        scholarships = [scholarship_db_to_pydantic(row) for row in rows.all()]
    finally:
        db.close()
    from app.engine.eligibility_engine import EligibilityEngine
    matches = [m for m in EligibilityEngine.evaluate_all(profile, scholarships) if m.match_status.value != "INELIGIBLE"]
    required = list(dict.fromkeys(doc for m in matches for doc in m.scholarship.required_documents))
    guidance = ScholarshipCopilotAgent().generate_document_guidance(profile, required)
    sources = search(f"{profile.state} document procurement " + " ".join(required), 5,
                     filter_doc_type="documents_and_process")
    answer = "Document checklist for your matched scholarships:\n" + "\n".join(
        f"• {item.document_name}: {item.where_to_obtain} (estimated {item.estimated_days})"
        for item in guidance
    )
    return {"guidance": [g.model_dump(mode="json") for g in guidance],
            "answer": answer if guidance else "No required documents were found for the matching scholarships.",
            "sources": [{"title": x["metadata"].get("scholarship_name"), "excerpt": x["text"][:360]} for x in sources]}
