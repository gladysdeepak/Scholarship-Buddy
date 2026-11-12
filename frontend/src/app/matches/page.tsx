"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import {
  evaluateEligibility,
  OverallEligibilityResponse,
  StudentProfileData,
} from "@/lib/api";
import ScholarshipCard from "@/components/ScholarshipCard";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  FileText,
  Sparkles,
  User,
  UserPlus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const SAMPLE_PRESETS: { label: string; data: StudentProfileData }[] = [
  {
    label: "Rahul Sharma (OBC B.Tech Student, Maharashtra)",
    data: {
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
    },
  },
  {
    label: "Priya Patel (Girl Engineering Candidate - Pragati Eligible)",
    data: {
      name: "Priya Patel",
      state: "Gujarat",
      district: "Ahmedabad",
      category: "General",
      annual_family_income: 450000,
      gender: "Female",
      disability_status: false,
      first_generation_learner: false,
      education_level: "Undergraduate",
      course: "B.E Electronics Engineering",
      year_of_study: 1,
      cgpa_or_percentage: 88.0,
      hostel_status: false,
      domicile: "Gujarat",
      sports_quota: false,
      ncc_quota: false,
      defence_quota: false,
      single_girl_child: true,
    },
  },
  {
    label: "Ankit Kumar (SC Category Student, UP)",
    data: {
      name: "Ankit Kumar",
      state: "Uttar Pradesh",
      district: "Lucknow",
      category: "SC",
      annual_family_income: 180000,
      gender: "Male",
      disability_status: false,
      first_generation_learner: true,
      education_level: "Undergraduate",
      course: "B.Sc Agriculture",
      year_of_study: 1,
      cgpa_or_percentage: 76.0,
      hostel_status: false,
      domicile: "Uttar Pradesh",
      sports_quota: false,
      ncc_quota: false,
      defence_quota: false,
      single_girl_child: false,
    },
  },
];

export default function MatchesPage() {
  const { profile, hasProfile, saveProfile, loading: profileLoading } = useProfile();
  const [response, setResponse] = useState<OverallEligibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ELIGIBLE" | "PARTIAL">("ALL");

  useEffect(() => {
    async function loadMatches() {
      if (!hasProfile || !profile) {
        setResponse(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await evaluateEligibility(profile);
      setResponse(res);
      setLoading(false);
    }

    if (!profileLoading) {
      loadMatches();
    }
  }, [hasProfile, profile, profileLoading]);

  // ==========================================
  // STATE 1: GUEST VISITOR (No Profile Created)
  // ==========================================
  if (!profile) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-indigo-500/30 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40 shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-outfit text-white">
              No Student Profile Created Yet
            </h1>
            <p className="text-sm text-gray-300 max-w-lg mx-auto">
              Scholarship Buddy requires your student parameters (Category, Annual Family Income, Domicile State, Academic Score) to run deterministic rule matching and compute your confidence score.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Full Profile</span>
            </Link>

            <Link
              href="/scholarships"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
            >
              <span>Browse All Scholarships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Preset Sample Profiles */}
          <div className="pt-8 border-t border-gray-800 space-y-3">
            <span className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Or try a 1-click sample profile for immediate testing:
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => saveProfile(preset.data)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-900 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-gray-800 text-gray-300 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading indicator for personalized state
  if (profileLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-2xl glass-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl glass-card animate-pulse bg-gray-900/50" />
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 2: PROFILE ACTIVE (Personalized Matches)
  // ==========================================
  const student = profile;
  const allMatches = response?.matches || [];

  const filteredMatches = allMatches.filter((m) => {
    if (filter === "ELIGIBLE") return m.match_status === "ELIGIBLE";
    if (filter === "PARTIAL") return m.match_status === "PARTIALLY_ELIGIBLE";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-indigo-500">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-semibold text-indigo-300 mb-2">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Profile: {student.name} ({student.category}, {student.state})</span>
          </div>

          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-400" />
            <span>Personalized Eligibility Hub</span>
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Found {response?.eligible_count || 0} Fully Eligible and {response?.partially_eligible_count || 0} Partially Eligible scholarships.
          </p>
        </div>

        {/* Potential Aid Pill */}
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-right shrink-0">
          <span className="text-xs text-gray-400 block font-medium">Total Potential Grant Aid</span>
          <div className="flex items-center justify-end gap-1 text-2xl font-extrabold text-emerald-400 font-outfit mt-0.5">
            <IndianRupee className="w-6 h-6" />
            <span>{(response?.total_potential_grant_inr || 0).toLocaleString("en-IN")} / yr</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-gray-900 border border-gray-800 w-fit">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === "ALL"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All Matches ({allMatches.length})
          </button>
          <button
            onClick={() => setFilter("ELIGIBLE")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === "ELIGIBLE"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Eligible ({response?.eligible_count || 0})
          </button>
          <button
            onClick={() => setFilter("PARTIAL")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === "PARTIAL"
                ? "bg-amber-600 text-white shadow-md"
                : "text-gray-400 hover:text-amber-400"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" /> Partially Eligible ({response?.partially_eligible_count || 0})
          </button>
        </div>

        <Link
          href="/documents"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors w-fit"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Generate Document Procurement Guide</span>
        </Link>
      </div>

      {/* Scholarship Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 space-y-3">
          <Sparkles className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No scholarships match this filter.</h3>
          <p className="text-xs">Try switching filters or adjusting your profile parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <ScholarshipCard key={match.scholarship_id} matchResult={match} />
          ))}
        </div>
      )}
    </div>
  );
}
