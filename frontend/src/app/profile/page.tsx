"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import ProfileForm from "@/components/ProfileForm";
import { StudentProfileData } from "@/lib/api";
import { UserCheck, Sparkles, ArrowRight, CheckCircle2, UserPlus, LogOut } from "lucide-react";

const INITIAL_FORM_STATE: StudentProfileData = {
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
  const router = useRouter();
  const { profile, hasProfile, saveProfile, clearProfile } = useProfile();
  const [evaluating, setEvaluating] = useState(false);

  const initialValues = profile || INITIAL_FORM_STATE;

  const handleSaveProfile = (updatedProfile: StudentProfileData) => {
    setEvaluating(true);
    saveProfile(updatedProfile);
    setTimeout(() => {
      setEvaluating(false);
      router.push("/matches");
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border-l-4 border-l-indigo-500">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-semibold text-indigo-300 mb-2">
            {hasProfile ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Profile Created • Active</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Guest Visitor • Create Your Profile</span>
              </>
            )}
          </div>

          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-indigo-400" />
            <span>{hasProfile ? "Manage Student Profile" : "Create Student Profile"}</span>
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            {hasProfile
              ? "Update your profile details below to recalculate rule-based scholarship matches."
              : "Fill in your academic and financial parameters to unlock personalized scholarship recommendations."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasProfile && (
            <button
              onClick={clearProfile}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-red-950/40 text-gray-300 hover:text-red-300 border border-gray-700 hover:border-red-800/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Reset Profile</span>
            </button>
          )}

          {hasProfile && (
            <button
              onClick={() => router.push("/matches")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Matched Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {evaluating && (
        <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center gap-3 text-indigo-300 text-sm animate-pulse">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Saving profile & evaluating deterministic rule engine...</span>
        </div>
      )}

      {/* Profile Form Component */}
      <ProfileForm initialProfile={initialValues} onSave={handleSaveProfile} />
    </div>
  );
}
