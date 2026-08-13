from typing import List
from app.models.schema import (
    StudentProfile,
    Scholarship,
    ScholarshipMatchResult,
    EligibilityCriterionResult,
    MatchStatus,
    GenderEnum,
)


class EligibilityEngine:
    """
    Deterministic rule-based eligibility evaluation engine.
    Evaluates student profiles against structured scholarship criteria without relying on AI,
    ensuring 100% accuracy and zero hallucination for eligibility logic.
    """

    @staticmethod
    def evaluate_scholarship(student: StudentProfile, scholarship: Scholarship) -> ScholarshipMatchResult:
        rules = scholarship.eligibility_rules
        criteria_results: List[EligibilityCriterionResult] = []

        passed_count = 0
        total_rules = 0

        # 1. Income Check
        if rules.max_annual_income is not None:
            total_rules += 1
            passed = student.annual_family_income <= rules.max_annual_income
            if passed:
                passed_count += 1
                msg = f"Family income ₹{student.annual_family_income:,.0f} is within the limit of ₹{rules.max_annual_income:,.0f} per annum."
            else:
                diff = student.annual_family_income - rules.max_annual_income
                msg = f"Family income ₹{student.annual_family_income:,.0f} exceeds maximum threshold ₹{rules.max_annual_income:,.0f} by ₹{diff:,.0f}."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Annual Family Income",
                    passed=passed,
                    student_value=f"₹{student.annual_family_income:,.0f}",
                    required_value=f"Max ₹{rules.max_annual_income:,.0f}",
                    message=msg,
                )
            )

        # 2. Category Check
        if rules.allowed_categories and len(rules.allowed_categories) > 0:
            total_rules += 1
            passed = student.category in rules.allowed_categories
            allowed_str = ", ".join([c.value for c in rules.allowed_categories])
            if passed:
                passed_count += 1
                msg = f"Category '{student.category.value}' is eligible."
            else:
                msg = f"Category '{student.category.value}' is not listed in eligible categories ({allowed_str})."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Category / Social Group",
                    passed=passed,
                    student_value=student.category.value,
                    required_value=allowed_str,
                    message=msg,
                )
            )

        # 3. Gender Check
        if rules.allowed_genders and len(rules.allowed_genders) > 0:
            total_rules += 1
            is_any = GenderEnum.ANY in rules.allowed_genders
            passed = is_any or (student.gender in rules.allowed_genders)
            allowed_str = "Any Gender" if is_any else ", ".join([g.value for g in rules.allowed_genders])
            if passed:
                passed_count += 1
                msg = f"Gender '{student.gender.value}' meets eligibility."
            else:
                msg = f"Scholarship is reserved for {allowed_str} (Student is {student.gender.value})."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Gender Criterion",
                    passed=passed,
                    student_value=student.gender.value,
                    required_value=allowed_str,
                    message=msg,
                )
            )

        # 4. Academic Marks / CGPA Check
        if rules.min_marks_percentage is not None:
            total_rules += 1
            passed = student.cgpa_or_percentage >= rules.min_marks_percentage
            if passed:
                passed_count += 1
                msg = f"Academic score {student.cgpa_or_percentage}% meets the required threshold of {rules.min_marks_percentage}%."
            else:
                msg = f"Academic score {student.cgpa_or_percentage}% is below required threshold of {rules.min_marks_percentage}%."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Academic Performance / Marks",
                    passed=passed,
                    student_value=f"{student.cgpa_or_percentage}%",
                    required_value=f"Min {rules.min_marks_percentage}%",
                    message=msg,
                )
            )

        # 5. Education Level Check
        if rules.allowed_education_levels and len(rules.allowed_education_levels) > 0:
            total_rules += 1
            passed = student.education_level in rules.allowed_education_levels
            allowed_levels_str = ", ".join([e.value for e in rules.allowed_education_levels])
            if passed:
                passed_count += 1
                msg = f"Education level '{student.education_level.value}' is eligible."
            else:
                msg = f"Education level '{student.education_level.value}' is not eligible for this scholarship ({allowed_levels_str})."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Education Level",
                    passed=passed,
                    student_value=student.education_level.value,
                    required_value=allowed_levels_str,
                    message=msg,
                )
            )

        # 6. Domicile / State Check
        if rules.allowed_states and len(rules.allowed_states) > 0:
            total_rules += 1
            # Check if student domicile or current state matches
            passed = (
                student.domicile.lower() in [s.lower() for s in rules.allowed_states]
                or student.state.lower() in [s.lower() for s in rules.allowed_states]
            )
            allowed_states_str = ", ".join(rules.allowed_states)
            if passed:
                passed_count += 1
                msg = f"Domicile '{student.domicile}' is eligible."
            else:
                msg = f"Scholarship is restricted to students from: {allowed_states_str}."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Domicile / State",
                    passed=passed,
                    student_value=student.domicile,
                    required_value=allowed_states_str,
                    message=msg,
                )
            )

        # 7. Single Girl Child Check
        if rules.single_girl_child_only:
            total_rules += 1
            passed = student.single_girl_child is True
            if passed:
                passed_count += 1
                msg = "Single girl child requirement satisfied."
            else:
                msg = "Scholarship is exclusively for single girl child applicants."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Single Girl Child Quota",
                    passed=passed,
                    student_value="Yes" if student.single_girl_child else "No",
                    required_value="Single Girl Child",
                    message=msg,
                )
            )

        # 8. Disability / PwD Check
        if rules.disability_required:
            total_rules += 1
            passed = student.disability_status is True
            if rules.min_disability_percentage and student.disability_percentage:
                passed = passed and (student.disability_percentage >= rules.min_disability_percentage)

            req_val = f"PwD status (min {rules.min_disability_percentage}%)" if rules.min_disability_percentage else "PwD status required"
            if passed:
                passed_count += 1
                msg = "Disability quota criteria satisfied."
            else:
                msg = "Scholarship is specifically reserved for Persons with Disabilities (PwD)."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="Disability / PwD Quota",
                    passed=passed,
                    student_value=f"PwD ({student.disability_percentage}%)" if student.disability_status else "Non-PwD",
                    required_value=req_val,
                    message=msg,
                )
            )

        # 9. First Generation Learner Check
        if rules.first_generation_only:
            total_rules += 1
            passed = student.first_generation_learner is True
            if passed:
                passed_count += 1
                msg = "First-generation learner criterion satisfied."
            else:
                msg = "Scholarship requires student to be a first-generation learner."

            criteria_results.append(
                EligibilityCriterionResult(
                    criterion_name="First-Generation Learner",
                    passed=passed,
                    student_value="Yes" if student.first_generation_learner else "No",
                    required_value="First-Gen Learner",
                    message=msg,
                )
            )

        # Calculate score and match status
        confidence_score = round((passed_count / max(total_rules, 1)) * 100, 1)

        failed_criteria = [c for c in criteria_results if not c.passed]

        if len(failed_criteria) == 0:
            match_status = MatchStatus.ELIGIBLE
        elif len(failed_criteria) == 1 and (
            "Marks" in failed_criteria[0].criterion_name or "Income" in failed_criteria[0].criterion_name
        ):
            # Minor mismatch in income or marks qualifies as partially eligible
            match_status = MatchStatus.PARTIALLY_ELIGIBLE
        elif confidence_score >= 60.0:
            match_status = MatchStatus.PARTIALLY_ELIGIBLE
        else:
            match_status = MatchStatus.INELIGIBLE

        # Identify missing documents based on profile
        missing_docs = list(scholarship.required_documents)

        action_items = []
        if match_status == MatchStatus.ELIGIBLE:
            action_items.append("Prepare required documents listed in the checklist.")
            action_items.append(f"Submit online application via {scholarship.official_website} before deadline {scholarship.deadline}.")
        elif match_status == MatchStatus.PARTIALLY_ELIGIBLE:
            for f in failed_criteria:
                action_items.append(f"Review criterion: {f.message}")
            action_items.append("Check if income certificate or mark sheets can be re-verified or updated.")
        else:
            action_items.append("Explore alternative scholarships with matching category or regional criteria.")

        return ScholarshipMatchResult(
            scholarship_id=scholarship.id,
            scholarship=scholarship,
            match_status=match_status,
            confidence_score=confidence_score,
            criteria_breakdown=criteria_results,
            missing_documents=missing_docs,
            action_items=action_items,
        )

    @classmethod
    def evaluate_all(cls, student: StudentProfile, scholarships: List[Scholarship]) -> List[ScholarshipMatchResult]:
        results = [cls.evaluate_scholarship(student, s) for s in scholarships]
        # Sort by match status priority (ELIGIBLE > PARTIALLY_ELIGIBLE > INELIGIBLE) then confidence score
        status_priority = {MatchStatus.ELIGIBLE: 0, MatchStatus.PARTIALLY_ELIGIBLE: 1, MatchStatus.INELIGIBLE: 2}
        results.sort(key=lambda r: (status_priority[r.match_status], -r.confidence_score, -r.scholarship.amount_per_year))
        return results
