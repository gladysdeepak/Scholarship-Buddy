from typing import List, Optional, Any, Dict
from enum import Enum
from pydantic import BaseModel, Field


class CategoryEnum(str, Enum):
    SC = "SC"
    ST = "ST"
    OBC = "OBC"
    EWS = "EWS"
    GENERAL = "General"
    MINORITY = "Minority"


class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"
    ANY = "Any"


class EducationLevelEnum(str, Enum):
    CLASS_10 = "Class 10"
    CLASS_11 = "Class 11"
    CLASS_12 = "Class 12"
    DIPLOMA = "Diploma"
    UNDERGRADUATE = "Undergraduate"
    POSTGRADUATE = "Postgraduate"
    DOCTORAL = "Doctoral / PhD"


class MatchStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    PARTIALLY_ELIGIBLE = "PARTIALLY_ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"


class StudentProfile(BaseModel):
    id: Optional[str] = "profile_1"
    name: str = Field(..., example="Rahul Sharma")
    state: str = Field(..., example="Maharashtra")
    district: Optional[str] = Field("Pune", example="Pune")
    category: CategoryEnum = Field(..., example=CategoryEnum.OBC)
    annual_family_income: float = Field(..., example=250000.0, description="Annual family income in INR")
    religion: Optional[str] = Field("Hindu", example="Hindu")
    gender: GenderEnum = Field(..., example=GenderEnum.MALE)
    disability_status: bool = Field(False, example=False)
    disability_percentage: Optional[float] = Field(0.0, example=0.0)
    first_generation_learner: bool = Field(True, example=True)
    parent_occupation: Optional[str] = Field("Farmer", example="Farmer")
    education_level: EducationLevelEnum = Field(..., example=EducationLevelEnum.UNDERGRADUATE)
    institution_type: Optional[str] = Field("Government", example="Government")
    course: str = Field(..., example="B.Tech Computer Science")
    year_of_study: int = Field(1, example=1)
    cgpa_or_percentage: float = Field(..., example=82.5, description="Percentage (0-100) or CGPA scaled to 100")
    hostel_status: bool = Field(False, example=False, description="True if hosteller, False if day scholar")
    domicile: str = Field(..., example="Maharashtra")
    sports_quota: bool = Field(False, example=False)
    ncc_quota: bool = Field(False, example=False)
    defence_quota: bool = Field(False, example=False)
    single_girl_child: bool = Field(False, example=False)


class EligibilityRules(BaseModel):
    max_annual_income: Optional[float] = None
    allowed_categories: Optional[List[CategoryEnum]] = None
    allowed_genders: Optional[List[GenderEnum]] = None
    min_marks_percentage: Optional[float] = None
    allowed_education_levels: Optional[List[EducationLevelEnum]] = None
    allowed_states: Optional[List[str]] = None  # None or empty list means All India
    disability_required: Optional[bool] = None
    min_disability_percentage: Optional[float] = None
    single_girl_child_only: Optional[bool] = None
    first_generation_only: Optional[bool] = None
    sports_quota_required: Optional[bool] = None
    defence_quota_required: Optional[bool] = None


class Scholarship(BaseModel):
    id: str
    name: str
    provider: str
    provider_type: str  # Government, Corporate, NGO/Trust, University
    amount_per_year: float
    amount_description: str
    deadline: str
    official_website: str
    application_process: str
    contact_details: str
    eligibility_rules: EligibilityRules
    required_documents: List[str]
    renewal_rules: Optional[str] = None
    description: str
    tags: List[str] = []


class EligibilityCriterionResult(BaseModel):
    criterion_name: str
    passed: bool
    student_value: Any
    required_value: Any
    message: str


class ScholarshipMatchResult(BaseModel):
    scholarship_id: str
    scholarship: Scholarship
    match_status: MatchStatus
    confidence_score: float  # 0.0 to 100.0
    criteria_breakdown: List[EligibilityCriterionResult]
    missing_documents: List[str]
    ai_explanation: Optional[str] = None
    action_items: List[str] = []


class DocumentGuidanceItem(BaseModel):
    document_name: str
    required_for_scholarships: List[str]
    issuing_authority: str
    where_to_obtain: str
    documents_needed_to_apply: List[str]
    estimated_days: str


class OverallEligibilityResponse(BaseModel):
    student_profile: StudentProfile
    total_matches: int
    eligible_count: int
    partially_eligible_count: int
    total_potential_grant_inr: float
    matches: List[ScholarshipMatchResult]
    ai_summary: Optional[str] = None
