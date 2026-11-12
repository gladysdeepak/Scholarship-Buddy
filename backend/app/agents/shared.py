import os


def answer_from_context(question: str, chunks: list[dict], instruction: str) -> str:
    context = "\n\n".join(c["text"] for c in chunks)
    key = os.getenv("GEMINI_API_KEY")
    if key and context:
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            response = genai.GenerativeModel("gemini-3.8-flash").generate_content(
                f"{instruction}\nQuestion: {question}\nEvidence:\n{context}\nCite source titles when possible.")
            if response and response.text:
                return response.text.strip()
        except Exception:
            pass
    if not context:
        return "I couldn't find supporting scholarship information in the current knowledge base. Please check the scheme's official portal for the latest details."
    return "Here is what the indexed scholarship information says:\n\n" + context[:2400] + "\n\nPlease verify deadlines and final requirements on the official scholarship portal."
