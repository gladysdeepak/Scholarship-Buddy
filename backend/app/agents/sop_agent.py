import os
from app.tools.tool_registry import get_scholarship_by_id, vector_search, save_sop_draft
from app.agents.shared import answer_from_context

INTERVIEW_QUESTIONS = [
    "What are you studying, and what do you hope to do after graduation?",
    "What experiences or achievements show your commitment to this field?",
    "What financial or personal challenges have affected your education?",
    "Who or what inspired your goals?",
    "How would this scholarship help you reach those goals?",
]


def generate_sop(student_id: str, scholarship_id: str, answers: list[str], tone: str = "formal") -> dict:
    if len([a for a in answers if a.strip()]) < len(INTERVIEW_QUESTIONS):
        return {"questions": INTERVIEW_QUESTIONS, "draft": None, "saved_id": None}
    scholarship = get_scholarship_by_id(scholarship_id)
    if not scholarship:
        raise ValueError("Scholarship not found")
    evidence = vector_search(f"{scholarship.name} selection criteria", 3,
                             {"scholarship_id": scholarship_id})
    prompt = (f"Write a 500-800 word {tone} scholarship statement of purpose. Use only true details from these student answers; "
              f"do not invent achievements. Student answers:\n" + "\n".join(answers) +
              f"\nScheme: {scholarship.name}. Selection context: " + "\n".join(x["text"] for x in evidence))
    draft = answer_from_context(prompt, evidence, "Write a polished, personal statement based on the supplied interview answers. Never add facts not present in the answers. Include a clear opening, goals, need, fit, and close.")
    if not os.getenv("GEMINI_API_KEY") or "indexed scholarship information says" in draft or "couldn't find supporting" in draft:
        draft = (f"I am applying for the {scholarship.name}. {answers[0].strip()}\n\n"
                 f"The experiences I described have shaped my commitment to this path. {answers[1].strip()}\n\n"
                 f"The circumstances I described are part of my educational journey. {answers[2].strip()}\n\n"
                 f"{answers[3].strip()} The reflection I shared contributes to the goals I have set for myself.\n\n"
                 f"Receiving this scholarship would make a practical difference to my ability to pursue those goals. {answers[4].strip()}\n\n"
                 "I will approach my studies with care and make responsible use of the support provided. "
                 "I appreciate your consideration of my application.")
    saved_id = save_sop_draft(student_id, scholarship_id, draft)
    return {"questions": INTERVIEW_QUESTIONS, "draft": draft, "saved_id": saved_id,
            "sources": [{"title": x["metadata"].get("scholarship_name"), "excerpt": x["text"][:360]} for x in evidence]}
