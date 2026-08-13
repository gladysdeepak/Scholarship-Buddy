import pytest
from app.models.schema import (
    StudentProfile,
    CategoryEnum,
    GenderEnum,
    EducationLevelEnum,
    MatchStatus,
)
from app.engine.eligibility_engine import EligibilityEngine
from app.data.scholarship_seed import SAMPLE_SCHOLARSHIPS


def test_nsp_post_matric_eligible():
    # SC student with income 2.0 Lakhs per annum
    student = StudentProfile(
        name="Ankit Kumar",
        state="Maharashtra",
        district="Nagpur",
        category=CategoryEnum.SC,
        annual_family_income=200000.0,
        gender=GenderEnum.MALE,
        education_level=EducationLevelEnum.UNDERGRADUATE,
        course="B.Sc Agriculture",
        year_of_study=1,
        cgpa_or_percentage=75.0,
        domicile="Maharashtra",
    )

    nsp_sch = next(s for s in SAMPLE_SCHOLARSHIPS if s.id == "sch_nsp_post_matric_sc_st")
    result = EligibilityEngine.evaluate_scholarship(student, nsp_sch)

    assert result.match_status == MatchStatus.ELIGIBLE
    assert result.confidence_score == 100.0


def test_gender_quota_rejection():
    # Male student attempting AICTE Pragati (Female only)
    student = StudentProfile(
        name="Vikram Singh",
        state="Karnataka",
        category=CategoryEnum.GENERAL,
        annual_family_income=300000.0,
        gender=GenderEnum.MALE,
        education_level=EducationLevelEnum.UNDERGRADUATE,
        course="B.E Computer Science",
        year_of_study=1,
        cgpa_or_percentage=88.0,
        domicile="Karnataka",
    )

    pragati_sch = next(s for s in SAMPLE_SCHOLARSHIPS if s.id == "sch_aicte_pragati_girls")
    result = EligibilityEngine.evaluate_scholarship(student, pragati_sch)

    assert result.match_status == MatchStatus.INELIGIBLE
    gender_rule = next(c for c in result.criteria_breakdown if "Gender" in c.criterion_name)
    assert gender_rule.passed is False


def test_income_limit_exceeded():
    # General student with income 8 Lakhs attempting Reliance (Max 6 Lakhs)
    student = StudentProfile(
        name="Rohan Verma",
        state="Delhi",
        category=CategoryEnum.GENERAL,
        annual_family_income=800000.0,
        gender=GenderEnum.MALE,
        education_level=EducationLevelEnum.UNDERGRADUATE,
        course="B.Com",
        year_of_study=1,
        cgpa_or_percentage=70.0,
        domicile="Delhi",
    )

    reliance_sch = next(s for s in SAMPLE_SCHOLARSHIPS if s.id == "sch_reliance_ug_2026")
    result = EligibilityEngine.evaluate_scholarship(student, reliance_sch)

    assert result.match_status == MatchStatus.INELIGIBLE
    income_rule = next(c for c in result.criteria_breakdown if "Income" in c.criterion_name)
    assert income_rule.passed is False
