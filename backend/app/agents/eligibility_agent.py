from app.tools.tool_registry import vector_search
from app.models.schema import StudentProfile
from app.engine.eligibility_engine import EligibilityEngine
from app.agents.shared import answer_from_context
import os


def explain_eligibility(profile: StudentProfile, scholarship_id: str | None = None) -> dict:
    from app.tools.tool_registry import SessionLocal, ScholarshipDB, scholarship_db_to_pydantic
    db = SessionLocal()
    try:
        q = db.query(ScholarshipDB)
        if scholarship_id:
            q = q.filter(ScholarshipDB.id == scholarship_id)
        matches = EligibilityEngine.evaluate_all(profile, [scholarship_db_to_pydantic(x) for x in q.all()])
    finally:
        db.close()
    summarized = []
    sources = []
    for match in matches:
        if match.match_status.value == "INELIGIBLE":
            continue
        chunks = vector_search(f"{match.scholarship.name} eligibility rules {profile.category.value} {profile.state}", 2,
                               {"scholarship_id": match.scholarship_id, "document_type": "eligibility_rules"})
        summarized.append({"scholarship_id": match.scholarship_id, "name": match.scholarship.name,
                           "status": match.match_status.value,
                           "criteria": [c.model_dump(mode="json") for c in match.criteria_breakdown]})
        sources.extend(chunks)
    if os.getenv("GEMINI_API_KEY"):
        explanation = answer_from_context("Explain these deterministic eligibility results for " + profile.name,
            sources, "Explain the provided rule results. The deterministic statuses and numeric results are authoritative; never change them.")
    else:
        explanation = "Deterministic eligibility results for " + profile.name + ":\n" + "\n".join(
            f"• {item['name']}: {item['status']}. " + " ".join(c["message"] for c in item["criteria"])
            for item in summarized
        )
        if not summarized:
            explanation += "No eligible or partially eligible schemes were found in the current catalogue."
    return {"matches": summarized, "answer": explanation,
            "sources": [{"title": c["metadata"].get("scholarship_name"), "excerpt": c["text"][:360]} for c in sources]}
