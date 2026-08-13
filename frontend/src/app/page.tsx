"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  evaluateEligibility,
  OverallEligibilityResponse,
  StudentProfileData,
} from "@/lib/api";
import ScholarshipCard from "@/components/ScholarshipCard";
import {
  Sparkles,
  Award,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  FileText,
  Clock,
} from "lucide-react";

const DEFAULT_PROFILE: StudentProfileData = {
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

export default function HomePage() {
  const [data, setData] = useState<OverallEligibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await evaluateEligibility(DEFAULT_PROFILE);
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-panel border border-indigo-500/20 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agentic AI + Deterministic Rule Engine for Indian Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white leading-tight">
            Never miss a scholarship you qualify for. <br />
            <span className="gradient-text">Personalized AI Guidance</span> for India.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Eliminate portal confusion. Scholarship Buddy accurately evaluates your category, annual family income, state domicile, and academic score against official government and corporate scheme criteria.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-5 h-5" />
              <span>Evaluate My Profile</span>
            </Link>
            <Link
              href="/scholarships"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-200 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition-all"
            >
              <span>Explore All Scholarships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metric Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Total Eligible Aid</span>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            ₹{data?.total_potential_grant_inr ? data.total_potential_grant_inr.toLocaleString("en-IN") : "95,000"} / yr
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Based on active profile</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Fully Match Schemes</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            {data?.eligible_count ?? 2} Scholarships
          </div>
          <span className="text-[11px] text-indigo-300 mt-1 block">100% criteria satisfied</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Partially Eligible</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            {data?.partially_eligible_count ?? 3} Schemes
          </div>
          <span className="text-[11px] text-amber-300 mt-1 block">Minor updates needed</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Rule Engine Guarantee</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">Zero Hallucination</div>
          <span className="text-[11px] text-cyan-300 mt-1 block">Strict Python logic verification</span>
        </div>
      </section>

      {/* AI Copilot Strategic Summary Card */}
      {data?.ai_summary && (
        <section className="glass-card rounded-2xl p-6 sm:p-8 border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-950/40 via-gray-900 to-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-outfit text-white">AI Copilot Match Strategy</h2>
              <span className="text-xs text-indigo-300">Generated for {data.student_profile.name}</span>
            </div>
          </div>

          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-gray-950/50 p-4 rounded-xl border border-gray-800 font-sans">
            {data.ai_summary}
          </div>
        </section>
      )}

      {/* Top Matching Scholarships Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-white">Top Eligible Opportunities</h2>
            <p className="text-sm text-gray-400">
              Scholarships matched specifically against your current profile details
            </p>
          </div>
          <Link
            href="/matches"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Matches ({data?.total_matches || 0})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl glass-card animate-pulse bg-gray-900/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.matches.slice(0, 4).map((match) => (
              <ScholarshipCard key={match.scholarship_id} matchResult={match} />
            ))}
          </div>
        )}
      </section>

      {/* Why Scholarship Buddy Section */}
      <section className="glass-panel rounded-3xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold font-outfit text-white mb-6 text-center">
          How Scholarship Buddy Solves Student Pain Points
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit">Deterministic Rules</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No fake recommendations. Rules for NSP, Tata, Reliance, and HDFC are strictly code-evaluated against your exact family income, category, and state domicile.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit">Document Readiness</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Know exactly what certificates (Income, Caste, Bonafide, NPCI bank mapping) you need and where to apply in your state (e-District / Tehsildar / CSC).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit">AI Natural Explanations</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Understand why you are eligible or partially eligible in simple language, with concrete action steps to unlock missing grants.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
