import json
from typing import Optional, Literal
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents.orchestrator import run_chat
from app.models.schema import StudentProfile

router = APIRouter(prefix="/api", tags=["Agentic AI"])


@router.get("/search")
def semantic_search(q: str, k: int = 10):
    from app.rag.pipeline import search
    chunks = search(q, k=max(1, min(k, 30)))
    ids = list(dict.fromkeys(c["metadata"].get("scholarship_id") for c in chunks if c["metadata"].get("scholarship_id")))
    from app.models.database import SessionLocal, ScholarshipDB
    from app.routers.scholarships import scholarship_db_to_pydantic
    db = SessionLocal()
    try:
        by_id = {x.id: scholarship_db_to_pydantic(x) for x in db.query(ScholarshipDB).filter(ScholarshipDB.id.in_(ids)).all()} if ids else {}
        return {"scholarships": [by_id[i].model_dump(mode="json") for i in ids if i in by_id],
                "sources": [{"scholarship_id": c["metadata"].get("scholarship_id"), "title": c["metadata"].get("scholarship_name"),
                             "excerpt": c["text"][:360]} for c in chunks]}
    finally:
        db.close()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    profile: Optional[StudentProfile] = None


class SOPRequest(BaseModel):
    student_id: str = "guest"
    scholarship_id: str
    answers: list[str] = Field(default_factory=list, max_length=7)
    tone: Literal["formal", "warm", "concise"] = "formal"


@router.post("/chat")
def chat(payload: ChatRequest):
    message = payload.message.strip()
    def events():
        yield "data: " + json.dumps({"type": "step", "message": "Classifying your request"}) + "\n\n"
        try:
            yield "data: " + json.dumps({"type": "step", "message": "Selecting the scholarship workflow"}) + "\n\n"
            result = run_chat(message, payload.profile)
        except Exception as exc:
            result = {"answer": f"I couldn't complete that request: {exc}", "sources": [], "steps": []}
        for step in result.get("steps", []):
            yield "data: " + json.dumps({"type": "step", "message": step}) + "\n\n"
        yield "data: " + json.dumps({"type": "result", "result": result}, ensure_ascii=False) + "\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.post("/sop/generate")
def generate_sop(payload: SOPRequest):
    from app.agents.sop_agent import generate_sop as create_sop
    try:
        return create_sop(payload.student_id, payload.scholarship_id, payload.answers, payload.tone)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/alerts/{student_id}")
def alerts(student_id: str):
    from app.models.database import SessionLocal, StudentAlertDB
    db = SessionLocal()
    try:
        return [{"id": a.id, "scholarship_id": a.scholarship_id, "message": a.message,
                 "created_at": a.created_at.isoformat()} for a in db.query(StudentAlertDB).filter_by(student_id=student_id).order_by(StudentAlertDB.created_at.desc()).limit(50).all()]
    finally:
        db.close()
