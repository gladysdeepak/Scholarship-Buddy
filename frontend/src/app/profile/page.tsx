"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { StudentProfileData, evaluateEligibility } from "@/lib/api";
import { UserCheck, Sparkles, ArrowRight } from "lucide-react";

const INITIAL_PROFILE: StudentProfileData = {
  name: "Rahul Sharma",
  state: "Maharashtra",
  district: "Pune",
  category: "OBC",
  annual_family_income: 250000,
  gender: "Male",
  disability_status: false,
  first_generation_learner: true,
  education_level: "Undergraduate",
  course: "B.Tech Computer Science",
  year_of_study: 1,
  cgpa_or_percentage: 82.5,
  hostel_status: false,
  domicile: "Maharashtra",
  sports_quota: false,
  ncc_quota: false,
  defence_quota: false,
  single_girl_child: false,
};

export default function ProfilePage() {
  const router = Router();
  const [profile, setProfile] = useState<StudentProfileData>(INITIAL_PROFILE);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("scholarship_student_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  const handleSaveProfile = async (updatedProfile: StudentProfileData) => {
    setProfile(updatedProfile);
    localStorage.setItem("scholarship_student_profile", JSON.stringify(updatedProfile));
    setEvaluating(true);
    await evaluateEligibility(updatedProfile);
    setEvaluating(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-indigo-400" />
            <span>Student Profile Manager</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Update your academic, financial, and demographic parameters to recalculate rule-based scholarship eligibility.
          </p>
        </div>

        <button
          onClick={() => router.push("/matches")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>View Matched Scholarships</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {evaluating && (
        <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center gap-3 text-indigo-300 text-sm animate-pulse">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Evaluating student profile against scholarship database...</span>
        </div>
      )}

      {/* Profile Form Component */}
      <ProfileForm initialProfile={profile} onSave={handleSaveProfile} />
    </div>
  );
}
