export interface StudentProfileData {
  id?: string;
  name: string;
  state: string;
  district?: string;
  category: "SC" | "ST" | "OBC" | "EWS" | "General" | "Minority";
  annual_family_income: number;
  religion?: string;
  gender: "Male" | "Female" | "Other" | "Any";
  disability_status: boolean;
  disability_percentage?: number;
  first_generation_learner: boolean;
  parent_occupation?: string;
  education_level: "Class 10" | "Class 11" | "Class 12" | "Diploma" | "Undergraduate" | "Postgraduate" | "Doctoral / PhD";
  institution_type?: string;
  course: string;
  year_of_study: number;
  cgpa_or_percentage: number;
  hostel_status: boolean;
  domicile: string;
  sports_quota: boolean;
  ncc_quota: boolean;
  defence_quota: boolean;
  single_girl_child: boolean;
}

export interface EligibilityCriterionResult {
  criterion_name: string;
  passed: boolean;
  student_value: any;
  required_value: any;
  message: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  provider_type: string;
  amount_per_year: number;
  amount_description: string;
  deadline: string;
  official_website: string;
  application_process: string;
  contact_details: string;
  eligibility_rules: any;
  required_documents: string[];
  renewal_rules?: string;
  description: string;
  tags: string[];
}

export interface ScholarshipMatchResult {
  scholarship_id: string;
  scholarship: Scholarship;
  match_status: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "INELIGIBLE";
  confidence_score: number;
  criteria_breakdown: EligibilityCriterionResult[];
  missing_documents: string[];
  ai_explanation?: string;
  action_items: string[];
}

export interface OverallEligibilityResponse {
  student_profile: StudentProfileData;
  total_matches: number;
  eligible_count: number;
  partially_eligible_count: number;
  total_potential_grant_inr: number;
  matches: ScholarshipMatchResult[];
  ai_summary?: string;
}

export interface DocumentGuidanceItem {
  document_name: string;
  required_for_scholarships: string[];
  issuing_authority: str;
  where_to_obtain: string;
  documents_needed_to_apply: string[];
  estimated_days: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchScholarships(params?: {
  query?: string;
  category?: string;
  education_level?: string;
  provider_type?: string;
  state?: string;
}): Promise<Scholarship[]> {
  try {
    const url = new URL(`${API_BASE_URL}/scholarships`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.append(k, v);
      });
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch scholarships");
    return await res.json();
  } catch (error) {
    console.warn("Backend API unavailable, using client-side fallback data", error);
    return MOCK_SCHOLARSHIPS;
  }
}

export async function evaluateEligibility(
  profile: StudentProfileData
): Promise<OverallEligibilityResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/eligibility/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error("Failed to evaluate eligibility");
    return await res.json();
  } catch (error) {
    console.warn("Backend API unavailable, performing local rule evaluation fallback", error);
    return performLocalEvaluation(profile);
  }
}

export async function fetchDocumentGuidance(
  profile: StudentProfileData
): Promise<DocumentGuidanceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/guidance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error("Failed to fetch document guidance");
    return await res.json();
  } catch (error) {
    console.warn("Backend API unavailable, generating local document guidance", error);
    return MOCK_DOCUMENT_GUIDANCE;
  }
}

// Local Fallback Data & Evaluator for Seamless UI Operation
const MOCK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch_nsp_post_matric_sc_st",
    name: "NSP Post-Matric Scholarship for SC/ST Students",
    provider: "Ministry of Social Justice & Empowerment, Govt. of India",
    provider_type: "Government",
    amount_per_year: 45000,
    amount_description: "Full tuition fee reimbursement + maintenance allowance up to ₹45,000/year",
    deadline: "2026-11-30",
    official_website: "https://scholarships.gov.in",
    application_process: "Apply online through National Scholarship Portal (NSP) with Aadhaar authentication and institute verification.",
    contact_details: "helpdesk@nsp.gov.in | 0120-6619540",
    eligibility_rules: { max_annual_income: 250000, allowed_categories: ["SC", "ST"], min_marks_percentage: 50 },
    required_documents: [
      "Aadhaar Card",
      "Caste Certificate (issued by competent authority)",
      "Income Certificate (valid for current financial year)",
      "Previous Class Marksheet",
      "Bank Passbook linked with Aadhaar (NPCI mapped)",
      "Bonafide Certificate from Current Institution"
    ],
    description: "A major government flagship scholarship ensuring financial support for SC and ST category students pursuing post-matriculation studies.",
    tags: ["Government", "NSP", "SC/ST", "Tuition Fee"]
  },
  {
    id: "sch_reliance_ug_2026",
    name: "Reliance Foundation Undergraduate Scholarship",
    provider: "Reliance Foundation",
    provider_type: "Corporate CSR",
    amount_per_year: 50000,
    amount_description: "Up to ₹2,00,000 over the duration of the degree course (₹50,000/year)",
    deadline: "2026-10-15",
    official_website: "https://www.reliancefoundation.org",
    application_process: "Online application form followed by an online aptitude test and background check.",
    contact_details: "rf.scholarships@reliancefoundation.org",
    eligibility_rules: { max_annual_income: 600000, min_marks_percentage: 60 },
    required_documents: [
      "Class 12 Marksheet",
      "Family Income Certificate",
      "Aadhaar Card",
      "Current College Admission Letter",
      "Fee Receipt of 1st Year"
    ],
    description: "Empowering undergraduate students pursuing any degree discipline across India with merit-cum-means financial grant.",
    tags: ["Reliance", "Undergraduate", "Merit-cum-Means"]
  },
  {
    id: "sch_tata_pankh_2026",
    name: "Tata Capital Pankh Scholarship",
    provider: "Tata Capital Limited",
    provider_type: "Corporate CSR",
    amount_per_year: 18000,
    amount_description: "Up to 80% of school/college course fee or up to ₹18,000/year",
    deadline: "2026-09-30",
    official_website: "https://www.tatacapital.com",
    application_process: "Online application submission on Buddy4Study / Tata Capital portal.",
    contact_details: "pankh@tatacapital.com",
    eligibility_rules: { max_annual_income: 400000, min_marks_percentage: 60 },
    required_documents: ["Aadhaar Card", "Income Certificate", "Previous Class Marksheet"],
    description: "Tata Capital Pankh aims to support education for students from economically weaker sections of society.",
    tags: ["Tata", "Merit-cum-Means", "School & College"]
  },
  {
    id: "sch_hdfc_parivartan_ecss",
    name: "HDFC Bank Parivartan's ECSS (Badhte Kadam)",
    provider: "HDFC Bank CSR",
    provider_type: "Corporate CSR",
    amount_per_year: 75000,
    amount_description: "Up to ₹75,000 for Higher Education students experiencing personal or financial crisis",
    deadline: "2026-12-15",
    official_website: "https://www.hdfcbank.com",
    application_process: "Submit online application with documentation verifying income level and crisis situation if applicable.",
    contact_details: "hdfcbankecss@buddy4study.com",
    eligibility_rules: { max_annual_income: 250000, min_marks_percentage: 55 },
    required_documents: ["Aadhaar Card", "Previous Year Marksheet", "Income Certificate", "Bank Passbook linked with Aadhaar (NPCI mapped)"],
    description: "HDFC Bank Parivartan ECSS assists students facing personal/financial hardships to prevent dropouts.",
    tags: ["HDFC", "Crisis Support", "Need-Based"]
  },
  {
    id: "sch_aicte_pragati_girls",
    name: "AICTE Pragati Scholarship Scheme for Girl Students",
    provider: "AICTE & Ministry of Education, Govt. of India",
    provider_type: "Government",
    amount_per_year: 50000,
    amount_description: "₹50,000 per annum towards college fee, computer purchase, books, & equipment",
    deadline: "2026-10-31",
    official_website: "https://scholarships.gov.in",
    application_process: "Apply through National Scholarship Portal (NSP) under AICTE schemes.",
    contact_details: "pragati@aicte-india.org",
    eligibility_rules: { max_annual_income: 800000, allowed_genders: ["Female"], min_marks_percentage: 60 },
    required_documents: ["Aadhaar Card", "Income Certificate", "Class 12 Marksheet", "Bonafide Certificate from Current Institution"],
    description: "Exclusively designed for female students admitted to 1st year of Technical Degree/Diploma courses in AICTE approved institutions.",
    tags: ["Government", "Girl Child", "AICTE", "Engineering"]
  }
];

function performLocalEvaluation(student: StudentProfileData): OverallEligibilityResponse {
  const matches: ScholarshipMatchResult[] = MOCK_SCHOLARSHIPS.map((sch) => {
    const breakdown: EligibilityCriterionResult[] = [];
    let passedCount = 0;
    let totalRules = 0;

    // Income
    if (sch.eligibility_rules.max_annual_income) {
      totalRules++;
      const passed = student.annual_family_income <= sch.eligibility_rules.max_annual_income;
      if (passed) passedCount++;
      breakdown.push({
        criterion_name: "Annual Family Income",
        passed,
        student_value: `₹${student.annual_family_income.toLocaleString()}`,
        required_value: `Max ₹${sch.eligibility_rules.max_annual_income.toLocaleString()}`,
        message: passed
          ? `Income ₹${student.annual_family_income.toLocaleString()} is within limit.`
          : `Income ₹${student.annual_family_income.toLocaleString()} exceeds max ₹${sch.eligibility_rules.max_annual_income.toLocaleString()}.`
      });
    }

    // Category
    if (sch.eligibility_rules.allowed_categories && sch.eligibility_rules.allowed_categories.length > 0) {
      totalRules++;
      const passed = sch.eligibility_rules.allowed_categories.includes(student.category);
      if (passed) passedCount++;
      breakdown.push({
        criterion_name: "Category",
        passed,
        student_value: student.category,
        required_value: sch.eligibility_rules.allowed_categories.join(", "),
        message: passed
          ? `Category '${student.category}' matches criteria.`
          : `Scholarship is reserved for ${sch.eligibility_rules.allowed_categories.join(", ")}.`
      });
    }

    // Gender
    if (sch.eligibility_rules.allowed_genders && sch.eligibility_rules.allowed_genders.length > 0) {
      totalRules++;
      const passed = sch.eligibility_rules.allowed_genders.includes(student.gender);
      if (passed) passedCount++;
      breakdown.push({
        criterion_name: "Gender",
        passed,
        student_value: student.gender,
        required_value: sch.eligibility_rules.allowed_genders.join(", "),
        message: passed
          ? `Gender '${student.gender}' matches requirement.`
          : `Reserved for ${sch.eligibility_rules.allowed_genders.join(", ")}.`
      });
    }

    // Marks
    if (sch.eligibility_rules.min_marks_percentage) {
      totalRules++;
      const passed = student.cgpa_or_percentage >= sch.eligibility_rules.min_marks_percentage;
      if (passed) passedCount++;
      breakdown.push({
        criterion_name: "Academic Score",
        passed,
        student_value: `${student.cgpa_or_percentage}%`,
        required_value: `Min ${sch.eligibility_rules.min_marks_percentage}%`,
        message: passed
          ? `Score ${student.cgpa_or_percentage}% satisfies minimum requirement.`
          : `Score ${student.cgpa_or_percentage}% is below required ${sch.eligibility_rules.min_marks_percentage}%.`
      });
    }

    const failed = breakdown.filter((b) => !b.passed);
    let status: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "INELIGIBLE" = "ELIGIBLE";
    if (failed.length === 1 && (failed[0].criterion_name.includes("Income") || failed[0].criterion_name.includes("Score"))) {
      status = "PARTIALLY_ELIGIBLE";
    } else if (failed.length > 0) {
      status = "INELIGIBLE";
    }

    const conf = Math.round((passedCount / Math.max(totalRules, 1)) * 100);

    return {
      scholarship_id: sch.id,
      scholarship: sch,
      match_status: status,
      confidence_score: conf,
      criteria_breakdown: breakdown,
      missing_documents: sch.required_documents,
      action_items: [
        status === "ELIGIBLE"
          ? "Complete application before deadline on official portal."
          : "Review criteria and update family income/marks documentation."
      ]
    };
  });

  const eligible = matches.filter((m) => m.match_status === "ELIGIBLE");
  const partial = matches.filter((m) => m.match_status === "PARTIALLY_ELIGIBLE");
  const totalGrant = eligible.reduce((acc, curr) => acc + curr.scholarship.amount_per_year, 0);

  return {
    student_profile: student,
    total_matches: matches.length,
    eligible_count: eligible.length,
    partially_eligible_count: partial.length,
    total_potential_grant_inr: totalGrant,
    matches,
    ai_summary: `🎯 **AI Copilot Analysis for ${student.name}**\n\n` +
      `We identified **${eligible.length} Fully Eligible** and **${partial.length} Partially Eligible** scholarships.\n\n` +
      `💰 Total potential grant aid: **₹${totalGrant.toLocaleString()}/year**.`
  };
}

const MOCK_DOCUMENT_GUIDANCE: DocumentGuidanceItem[] = [
  {
    document_name: "Income Certificate",
    required_for_scholarships: ["NSP Post-Matric", "Reliance Foundation", "HDFC Parivartan"],
    issuing_authority: "Revenue Dept / Tehsildar / Sub-Divisional Magistrate",
    where_to_obtain: "Apply online at state e-District portal or MeeSeva / CSC centre.",
    documents_needed_to_apply: ["Aadhaar Card", "Ration Card", "Salary Certificate / Form 16"],
    estimated_days: "7 - 15 Working Days"
  },
  {
    document_name: "Caste Certificate (issued by competent authority)",
    required_for_scholarships: ["NSP Post-Matric Scholarship"],
    issuing_authority: "District Magistrate / Tehsildar",
    where_to_obtain: "State e-District portal or Revenue Officer desk.",
    documents_needed_to_apply: ["Aadhaar Card", "Paternal Caste Certificate", "School Leaving Certificate"],
    estimated_days: "15 - 30 Working Days"
  },
  {
    document_name: "Bank Passbook linked with Aadhaar (NPCI mapped)",
    required_for_scholarships: ["NSP Post-Matric", "HDFC Parivartan"],
    issuing_authority: "Nationalized or Scheduled Commercial Bank Branch",
    where_to_obtain: "Visit your home bank branch and submit NPCI Aadhaar seeding consent form.",
    documents_needed_to_apply: ["Bank Account Passbook", "Aadhaar Card Copy"],
    estimated_days: "2 - 3 Working Days"
  }
];
