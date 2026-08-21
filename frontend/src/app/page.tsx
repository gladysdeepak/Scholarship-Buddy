"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import {
  evaluateEligibility,
  fetchScholarships,
  OverallEligibilityResponse,
  Scholarship,
} from "@/lib/api";
import ScholarshipCard from "@/components/ScholarshipCard";
import {
  Sparkles,
  Award,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  FileText,
  Clock,
  Search,
  Building,
  Calendar,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { profile, hasProfile, loading: profileLoading } = useProfile();
  const [eligibilityData, setEligibilityData] = useState<OverallEligibilityResponse | null>(null);
  const [publicScholarships, setPublicScholarships] = useState<Scholarship[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      setDataLoading(true);
      if (hasProfile && profile) {
        // Fetch personalized evaluation for active profile
        const res = await evaluateEligibility(profile);
        setEligibilityData(res);
      } else {
        // Fetch public list for guest view
        const items = await fetchScholarships();
        setPublicScholarships(items);
      }
      setDataLoading(false);
    }

    if (!profileLoading) {
      loadContent();
    }
  }, [hasProfile, profile, profileLoading]);

  if (profileLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-3xl glass-card animate-pulse bg-gray-900/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl glass-card animate-pulse bg-gray-900/50" />
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 1: GUEST VISITOR (No Profile Created)
  // ==========================================
  if (!hasProfile) {
    return (
      <div className="space-y-12">
        {/* Guest Hero Section */}
        <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-panel border border-indigo-500/20 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scholarship Buddy • India AI Copilot</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white leading-tight">
              Discover & Verify Indian Scholarships with <span className="gradient-text">Zero Guesswork</span>.
            </h1>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Scholarship information is often scattered and confusing. Scholarship Buddy standardizes official government, corporate CSR, and trust schemes to eliminate missed deadlines and unclear eligibility rules.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Profile & Check Eligibility</span>
              </Link>
              <Link
                href="/scholarships"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-200 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition-all"
              >
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Explore All Scholarships</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Guest Public Platform Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Verified Schemes</span>
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white font-outfit">10+ Active Schemes</div>
            <span className="text-[11px] text-indigo-300 mt-1 block">NSP, Reliance, Tata, HDFC, AICTE</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Annual Grant Pool</span>
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-outfit">₹50,00,000+</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Total scholarship aid available</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Rule Engine Guarantee</span>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-outfit">100% Deterministic</div>
            <span className="text-[11px] text-cyan-300 mt-1 block">Zero AI hallucination in rules</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Document Guide</span>
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-outfit">Step-by-Step</div>
            <span className="text-[11px] text-amber-300 mt-1 block">e-District & Tehsildar guidance</span>
          </div>
        </section>

        {/* How Scholarship Buddy Works */}
        <section className="glass-panel rounded-3xl p-8 border border-gray-800 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white">How Scholarship Buddy Works</h2>
            <p className="text-sm text-gray-400">
              A clear 4-step workflow to help Indian students secure academic funding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold font-outfit">
                1
              </div>
              <h3 className="text-base font-bold text-white font-outfit">Create Profile</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter your category, family income, education level, state domicile, and academic marks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold font-outfit">
                2
              </div>
              <h3 className="text-base font-bold text-white font-outfit">Rule-Based Evaluation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our strict Python engine matches your profile against structured income, gender, and category thresholds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold font-outfit">
                3
              </div>
              <h3 className="text-base font-bold text-white font-outfit">AI Guidance Strategy</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive natural language advice explaining why you qualify and how to fulfill missing criteria.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold font-outfit">
                4
              </div>
              <h3 className="text-base font-bold text-white font-outfit">Document & Apply</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Get instructions on acquiring income/caste certificates and direct links to official scheme portals.
              </p>
            </div>
          </div>
        </section>

        {/* Public Scholarship Directory Highlights */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-outfit text-white">Explore Verified Scholarship Schemes</h2>
              <p className="text-sm text-gray-400">
                Browse Indian government, corporate CSR, and trust scholarships in our knowledge base.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View Full Directory ({publicScholarships.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicScholarships.slice(0, 4).map((sch) => (
              <div key={sch.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> {sch.provider}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                      {sch.provider_type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-outfit text-white mb-2 leading-snug">{sch.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{sch.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                    <div>
                      <span className="text-xs text-gray-500 block">Grant Amount</span>
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                        <IndianRupee className="w-4 h-4" /> ₹{sch.amount_per_year.toLocaleString("en-IN")}/yr
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Deadline</span>
                      <span className="text-amber-300 font-semibold text-xs flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> {sch.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/profile"
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                  >
                    Check My Eligibility
                  </Link>
                  <a
                    href={sch.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  >
                    Official Portal
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner to Create Profile */}
        <section className="glass-panel rounded-3xl p-8 sm:p-10 border border-indigo-500/30 text-center space-y-4 bg-gradient-to-r from-indigo-950/60 via-gray-900 to-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
            Ready to find scholarships tailored for you?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Create your student profile in under 2 minutes. Get instant rule-based match scores, missing document alerts, and AI copilot recommendations.
          </p>
          <div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-5 h-5" />
              <span>Build Profile Now</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // STATE 2: PROFILE ACTIVE (Personalized Dashboard)
  // ==========================================
  return (
    <div className="space-y-10">
      {/* Personalized Welcome Banner */}
      <section className="relative rounded-3xl p-8 sm:p-10 overflow-hidden glass-panel border border-indigo-500/30 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Student Profile ({profile.category}, {profile.state})</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">
              Welcome back, <span className="gradient-text">{profile.name}</span>!
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl">
              Pursuing {profile.course} ({profile.education_level}) with {profile.cgpa_or_percentage}% academic score and annual family income of ₹{profile.annual_family_income.toLocaleString()}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
            >
              Edit Profile
            </Link>
            <Link
              href="/matches"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>View Matches</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Personalized Metric Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Total Potential Aid</span>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            ₹{eligibilityData?.total_potential_grant_inr ? eligibilityData.total_potential_grant_inr.toLocaleString("en-IN") : "0"} / yr
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">From 100% eligible schemes</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">100% Eligible</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            {eligibilityData?.eligible_count || 0} Scholarships
          </div>
          <span className="text-[11px] text-indigo-300 mt-1 block">All criteria satisfied</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Partially Eligible</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">
            {eligibilityData?.partially_eligible_count || 0} Schemes
          </div>
          <span className="text-[11px] text-amber-300 mt-1 block">Minor updates required</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Rule Engine Guarantee</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-outfit">Verified Logic</div>
          <span className="text-[11px] text-cyan-300 mt-1 block">Code-checked rules</span>
        </div>
      </section>

      {/* AI Copilot Strategic Summary Card */}
      {eligibilityData?.ai_summary && (
        <section className="glass-card rounded-2xl p-6 sm:p-8 border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-950/40 via-gray-900 to-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-outfit text-white">AI Copilot Match Strategy</h2>
              <span className="text-xs text-indigo-300">Generated for {profile.name}</span>
            </div>
          </div>

          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-gray-950/50 p-4 rounded-xl border border-gray-800 font-sans">
            {eligibilityData.ai_summary}
          </div>
        </section>
      )}

      {/* Top Matching Scholarships Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-white">Top Matched Scholarships</h2>
            <p className="text-sm text-gray-400">
              Scholarships matched specifically against {profile.name}'s profile parameters
            </p>
          </div>
          <Link
            href="/matches"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Matches ({eligibilityData?.total_matches || 0})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eligibilityData?.matches.slice(0, 4).map((match) => (
            <ScholarshipCard key={match.scholarship_id} matchResult={match} />
          ))}
        </div>
      </section>
    </div>
  );
}
