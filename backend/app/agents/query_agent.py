from app.tools.tool_registry import vector_search
from app.agents.shared import answer_from_context


def answer_question(question: str) -> dict:
    chunks = vector_search(question, k=5)
    answer = answer_from_context(question, chunks, "Answer scholarship questions using only the supplied evidence. If it is insufficient, say what is unknown.")
    return {"answer": answer, "sources": _sources(chunks), "steps": ["Searched scholarship knowledge base", "Prepared an evidence-grounded answer"]}


def _sources(chunks):
    return [{"scholarship_id": c["metadata"].get("scholarship_id"), "title": c["metadata"].get("scholarship_name"),
             "source": c["metadata"].get("source", "Scholarship Buddy knowledge base"), "excerpt": c["text"][:360]}
            for c in chunks]
