"""
Document Loader — Loads scholarship content from PDF files, web pages, and
the internal structured seed data for RAG indexing into ChromaDB.
"""

import requests
from datetime import date
from typing import List, Dict, Any
from html.parser import HTMLParser


class _HTMLTextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript", "svg"}: self.hidden += 1
    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "svg"} and self.hidden: self.hidden -= 1
    def handle_data(self, data):
        if not self.hidden and data.strip(): self.parts.append(data.strip())

def load_from_seed_data(seed_scholarships: List[Any]) -> List[Dict[str, Any]]:
    """
    Converts the structured scholarship seed objects into raw text documents
    with metadata for downstream chunking and embedding.

    Each scholarship becomes 3 separate documents to enable fine-grained retrieval:
    1. Overview document (name, provider, amounts, deadline, description, tags)
    2. Eligibility rules document (all criteria in natural language)
    3. Document & process document (required documents, application process, contact)
    """
    raw_docs = []

    for sch in seed_scholarships:
        sch_dict = sch.model_dump(mode="json") if hasattr(sch, "model_dump") else (sch.dict() if hasattr(sch, "dict") else sch)
        rules = sch_dict.get("eligibility_rules", {})

        # --- Document 1: Overview ---
        overview_text = f"""
Scholarship Name: {sch_dict['name']}
Provider: {sch_dict['provider']} ({sch_dict['provider_type']})
Financial Award: {sch_dict['amount_description']}
Grant Amount per Year: Rs {sch_dict['amount_per_year']:,.0f}
Application Deadline: {sch_dict['deadline']}
Official Website: {sch_dict['official_website']}
Tags: {', '.join(sch_dict.get('tags', []))}
Description: {sch_dict['description']}
Renewal Policy: {sch_dict.get('renewal_rules', 'Not specified')}
        """.strip()

        raw_docs.append({
            "text": overview_text,
            "metadata": {
                "scholarship_id": sch_dict["id"],
                "scholarship_name": sch_dict["name"],
                "provider": sch_dict["provider"],
                "provider_type": sch_dict["provider_type"],
                "document_type": "overview",
                "amount_per_year": str(sch_dict["amount_per_year"]),
                "deadline": sch_dict["deadline"],
                "last_updated": "2026-11-12",
            }
        })

        # --- Document 2: Eligibility Rules ---
        eligibility_parts = [f"Eligibility Criteria for {sch_dict['name']}:"]

        if rules.get("max_annual_income"):
            eligibility_parts.append(
                f"Annual Family Income: Maximum Rs {rules['max_annual_income']:,.0f} per annum. "
                f"Students with family income above this limit are not eligible."
            )

        if rules.get("allowed_categories"):
            cats = rules["allowed_categories"]
            if isinstance(cats, list):
                cat_values = [c if isinstance(c, str) else c.get("value", str(c)) for c in cats]
                eligibility_parts.append(
                    f"Category/Caste Eligibility: This scholarship is open to students from the following categories: {', '.join(cat_values)}."
                )

        if rules.get("allowed_genders"):
            genders = rules["allowed_genders"]
            if isinstance(genders, list):
                gender_values = [g if isinstance(g, str) else g.get("value", str(g)) for g in genders]
                if "Any" in gender_values or "ANY" in gender_values:
                    eligibility_parts.append("Gender: Open to students of all genders (Male, Female, and Others).")
                elif "Female" in gender_values or "FEMALE" in gender_values:
                    eligibility_parts.append("Gender: This scholarship is exclusively for female students.")

        if rules.get("min_marks_percentage"):
            eligibility_parts.append(
                f"Academic Performance: Minimum {rules['min_marks_percentage']}% marks or equivalent CGPA in qualifying examination is required."
            )

        if rules.get("allowed_education_levels"):
            levels = rules["allowed_education_levels"]
            if isinstance(levels, list):
                level_values = [l if isinstance(l, str) else l.get("value", str(l)) for l in levels]
                eligibility_parts.append(
                    f"Education Level: Applicable for students studying at: {', '.join(level_values)}."
                )

        if rules.get("allowed_states"):
            eligibility_parts.append(
                f"Domicile/State Restriction: Only students domiciled in {', '.join(rules['allowed_states'])} are eligible."
            )
        else:
            eligibility_parts.append("Domicile: This is a pan-India scholarship — open to students from all states and union territories.")

        if rules.get("single_girl_child_only"):
            eligibility_parts.append("Single Girl Child: Exclusively for students who are the sole girl child in their family.")

        if rules.get("disability_required"):
            pct = rules.get("min_disability_percentage", 40)
            eligibility_parts.append(f"Disability: Reserved for Persons with Disabilities (PwD) with minimum {pct}% disability.")

        if rules.get("first_generation_only"):
            eligibility_parts.append("First-Generation Learner: Scholarship is specifically targeted at first-generation college students whose parents have not attended higher education.")

        raw_docs.append({
            "text": "\n".join(eligibility_parts),
            "metadata": {
                "scholarship_id": sch_dict["id"],
                "scholarship_name": sch_dict["name"],
                "provider": sch_dict["provider"],
                "provider_type": sch_dict["provider_type"],
                "document_type": "eligibility_rules",
                "amount_per_year": str(sch_dict["amount_per_year"]),
                "deadline": sch_dict["deadline"],
                "max_income": str(rules.get("max_annual_income", "")),
                "gender_restriction": "female_only" if (
                    rules.get("allowed_genders") and
                    any("female" in str(g).lower() for g in rules.get("allowed_genders", []))
                ) else "open",
                "state_restricted": "yes" if rules.get("allowed_states") else "no",
                "last_updated": "2026-11-12",
            }
        })

        # --- Document 3: Documents Required & Application Process ---
        docs_required = sch_dict.get("required_documents", [])
        docs_text = f"""
Required Documents for {sch_dict['name']}:
Applicants must submit the following documents:
{chr(10).join(f"- {doc}" for doc in docs_required)}

Application Process:
{sch_dict.get('application_process', 'Visit the official website for application instructions.')}

Contact Information:
{sch_dict.get('contact_details', 'Visit official website for contact details.')}

Official Application Portal:
{sch_dict.get('official_website', 'N/A')}
        """.strip()

        raw_docs.append({
            "text": docs_text,
            "metadata": {
                "scholarship_id": sch_dict["id"],
                "scholarship_name": sch_dict["name"],
                "provider": sch_dict["provider"],
                "document_type": "documents_and_process",
                "amount_per_year": str(sch_dict["amount_per_year"]),
                "deadline": sch_dict["deadline"],
                "last_updated": "2026-11-12",
            }
        })

    return raw_docs


def load_from_pdf(pdf_path: str, scholarship_id: str, scholarship_name: str) -> List[Dict[str, Any]]:
    """Loads content from a PDF scholarship brochure."""
    try:
        from pypdf import PdfReader
    except ImportError:
        print(f"Skipping PDF load for {pdf_path}: install pypdf to read PDF brochures.")
        return []
    reader = PdfReader(pdf_path)

    return [
        {
            "text": page.extract_text(),
            "metadata": {
                "scholarship_id": scholarship_id,
                "scholarship_name": scholarship_name,
                "document_type": "pdf_brochure",
                "source": pdf_path,
                "page": index,
            }
        }
        for index, page in enumerate(reader.pages)
        if page.extract_text() and page.extract_text().strip()
    ]


def load_from_url(url: str, scholarship_id: str, scholarship_name: str, doc_type: str = "web_content") -> List[Dict[str, Any]]:
    """Loads content from a scholarship portal web page."""
    try:
        response = requests.get(url, timeout=15, headers={"User-Agent": "ScholarshipBuddyIndexer/1.0"})
        response.raise_for_status()
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, "html.parser")
            for item in soup(["script", "style", "noscript"]): item.decompose()
            text = " ".join(soup.stripped_strings)
        except ImportError:
            parser = _HTMLTextParser(); parser.feed(response.text)
            text = " ".join(parser.parts)
        if not text.strip(): return []
        return [
            {
                "text": text[:30000],
                "metadata": {
                    "scholarship_id": scholarship_id,
                    "scholarship_name": scholarship_name,
                    "document_type": doc_type,
                    "source": url,
                    "last_updated": date.today().isoformat(),
                }
            }
        ]
    except Exception as e:
        print(f"Warning: Failed to load {url}: {e}")
        return []
