import os
from typing import List, Dict, Any
from app.models.schema import (
    StudentProfile,
    ScholarshipMatchResult,
    MatchStatus,
    DocumentGuidanceItem,
)


class ScholarshipCopilotAgent:
    """
    AI Copilot Agent for Scholarship Buddy.
    Generates natural language explanations, action strategies, document procurement guides,
    and missing document advice for Indian students.
    """

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")

    def generate_overall_summary(
        self, student: StudentProfile, matches: List[ScholarshipMatchResult]
    ) -> str:
        """
        Generate a high-level AI Copilot executive summary for the student.
        """
        eligible = [m for m in matches if m.match_status == MatchStatus.ELIGIBLE]
        partially = [m for m in matches if m.match_status == MatchStatus.PARTIALLY_ELIGIBLE]
        total_grant = sum(m.scholarship.amount_per_year for m in eligible)

        # Try Gemini API if key is configured
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-3.8-flash")
                prompt = f"""
                You are Scholarship Buddy, an expert AI copilot for Indian students.
                Provide a warm, encouraging 3-bullet-point summary for student {student.name}:
                - Category: {student.category.value}, State: {student.state}, Course: {student.course} ({student.education_level.value})
                - Annual Income: ₹{student.annual_family_income:,.0f}, Marks: {student.cgpa_or_percentage}%
                - Found {len(eligible)} Fully Eligible scholarships worth up to ₹{total_grant:,.0f}/year.
                - Found {len(partially)} Partially Eligible scholarships requiring minor document/criteria updates.

                Keep it actionable, encouraging, and focused on Indian scholarship portals (NSP, CSR schemes).
                """
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"Gemini API call failed, falling back: {e}")

        # Deterministic rich fallback summary
        summary_lines = [
            f"🎯 **Scholarship Strategy for {student.name}**",
            f"Great news! Based on your profile ({student.category.value} category from {student.state}, pursuing {student.course} with {student.cgpa_or_percentage}% marks), we identified **{len(eligible)} Fully Eligible** and **{len(partially)} Partially Eligible** scholarships.",
        ]

        if eligible:
            top_sch = eligible[0].scholarship
            summary_lines.append(
                f"✨ **Top Recommendation:** **{top_sch.name}** offering up to ₹{top_sch.amount_per_year:,.0f}/year. Deadline: {top_sch.deadline}."
            )

        if total_grant > 0:
            summary_lines.append(
                f"💰 **Total Potential Aid:** Up to **₹{total_grant:,.0f} per year** in total grant funding."
            )

        if partially:
            summary_lines.append(
                f"⚠️ **Action Needed:** {len(partially)} scholarship(s) are partially matched. Review income certificates or grade verification to unlock these opportunities."
            )

        return "\n\n".join(summary_lines)

    def generate_document_guidance(
        self, student: StudentProfile, required_documents: List[str]
    ) -> List[DocumentGuidanceItem]:
        """
        Generate detailed instructions on where & how to obtain required Indian documents.
        """
        guidance_database: Dict[str, Dict[str, Any]] = {
            "Income Certificate": {
                "issuing_authority": "Revenue Department / Tehsildar / Sub-Divisional Magistrate (SDM)",
                "where_to_obtain": f"Apply online via {student.state} e-District portal or visit nearest Citizen Service Centre (CSC) / MeeSeva / E-Seva office.",
                "documents_needed_to_apply": ["Aadhaar Card", "Ration Card", "Salary Slip / Form 16 / Income Affidavit", "Land Details / Bank Statement"],
                "estimated_days": "7 to 15 Working Days",
            },
            "Caste Certificate (issued by competent authority)": {
                "issuing_authority": "District Magistrate / Executive Magistrate / Tehsildar",
                "where_to_obtain": f"Apply online at {student.state} State e-District portal.",
                "documents_needed_to_apply": ["Aadhaar Card", "Paternal Caste Certificate / School Transfer Certificate", "Affidavit", "Address Proof"],
                "estimated_days": "15 to 30 Working Days",
            },
            "Aadhaar Card": {
                "issuing_authority": "UIDAI (Unique Identification Authority of India)",
                "where_to_obtain": "Visit nearest UIDAI Aadhaar Seva Kendra or post office.",
                "documents_needed_to_apply": ["Proof of Identity (Voter ID/PAN)", "Proof of Address (Utility bill/Ration Card)", "Birth Certificate"],
                "estimated_days": "Instant (e-Aadhaar download) or 10 days for print",
            },
            "Domicile Certificate": {
                "issuing_authority": "Tehsildar / Sub-Divisional Magistrate",
                "where_to_obtain": f"Online application on {student.state} e-District Portal.",
                "documents_needed_to_apply": ["Continuous residency proof (Ration card / Electricity bill for 10+ years)", "School Leaving Certificate", "Aadhaar Card"],
                "estimated_days": "10 to 20 Working Days",
            },
            "Bank Passbook linked with Aadhaar (NPCI mapped)": {
                "issuing_authority": "Any Nationalized or Scheduled Bank Branch",
                "where_to_obtain": "Visit your bank branch and request 'Aadhaar NPCI Seeding Form' for Direct Benefit Transfer (DBT).",
                "documents_needed_to_apply": ["Bank Account Passbook", "Aadhaar Card copy", "Consent form for NPCI mapping"],
                "estimated_days": "2 to 3 Working Days",
            },
            "Bonafide Certificate from Current Institution": {
                "issuing_authority": "College Principal / Head of Department / Registrar Office",
                "where_to_obtain": "Request in writing to your college administration or academic section.",
                "documents_needed_to_apply": ["College ID Card", "Current Semester Fee Receipt", "Application form"],
                "estimated_days": "1 to 3 Working Days",
            },
        }

        results: List[DocumentGuidanceItem] = []

        for doc in set(required_documents):
            info = guidance_database.get(
                doc,
                {
                    "issuing_authority": "Respective Govt Department / Institute Authority",
                    "where_to_obtain": f"Apply through official government portals in {student.state} or your college administrative counter.",
                    "documents_needed_to_apply": ["Student ID", "Aadhaar Card", "Previous Academic Records"],
                    "estimated_days": "5 to 10 Working Days",
                },
            )

            results.append(
                DocumentGuidanceItem(
                    document_name=doc,
                    required_for_scholarships=[],
                    issuing_authority=info["issuing_authority"],
                    where_to_obtain=info["where_to_obtain"],
                    documents_needed_to_apply=info["documents_needed_to_apply"],
                    estimated_days=info["estimated_days"],
                )
            )

        return results
