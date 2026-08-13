"use client";

import { useState } from "react";
import { ScholarshipMatchResult } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Calendar,
  IndianRupee,
  Building,
  Sparkles,
} from "lucide-react";

interface ScholarshipCardProps {
  matchResult: ScholarshipMatchResult;
}

export default function ScholarshipCard({ matchResult }: ScholarshipCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { scholarship, match_status, confidence_score, criteria_breakdown, missing_documents, action_items } = matchResult;

  const isEligible = match_status === "ELIGIBLE";
  const isPartial = match_status === "PARTIALLY_ELIGIBLE";

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Accent Background Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-3xl pointer-events-none ${
          isEligible ? "bg-emerald-500/10" : isPartial ? "bg-amber-500/10" : "bg-red-500/10"
        }`}
      />

      <div>
        {/* Top Badges & Provider Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            {scholarship.provider}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isEligible ? "badge-eligible" : isPartial ? "badge-partial" : "badge-ineligible"
              }`}
            >
              {isEligible ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eligible
                </>
              ) : isPartial ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Partially Eligible ({confidence_score}%)
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Ineligible
                </>
              )}
            </span>
          </div>
        </div>

        {/* Scholarship Name */}
        <h3 className="text-xl font-bold font-outfit text-white mb-2 leading-snug hover:text-indigo-300 transition-colors">
          {scholarship.name}
        </h3>

        {/* Description snippet */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{scholarship.description}</p>

        {/* Financial & Deadline Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <div>
            <span className="text-xs text-gray-500 block mb-0.5">Max Financial Grant</span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-base">
              <IndianRupee className="w-4 h-4" />
              <span>{scholarship.amount_per_year.toLocaleString("en-IN")} / yr</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-0.5">Application Deadline</span>
            <div className="flex items-center gap-1 text-amber-300 font-semibold text-sm">
              <Calendar className="w-4 h-4" />
              <span>{scholarship.deadline}</span>
            </div>
          </div>
        </div>

        {/* Required Documents Tags */}
        <div className="mb-4">
          <span className="text-xs text-gray-400 flex items-center gap-1 mb-2 font-medium">
            <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Required Documents ({missing_documents.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missing_documents.slice(0, 3).map((doc, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-800/80 text-gray-300 border border-gray-700/60"
              >
                {doc}
              </span>
            ))}
            {missing_documents.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-gray-800 text-gray-400">
                +{missing_documents.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Accordion for Rule Breakdown */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/40 transition-colors mb-3"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> View Rule-Based Criteria Breakdown
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="space-y-2 mb-4 p-3 rounded-xl bg-gray-950/70 border border-gray-800 text-xs">
            <h4 className="font-semibold text-gray-300 mb-2">Eligibility Engine Inspection:</h4>
            {criteria_breakdown.map((criterion, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                  criterion.passed
                    ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                    : "bg-red-950/20 border-red-800/40 text-red-300"
                }`}
              >
                {criterion.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-gray-200">
                    {criterion.criterion_name}: <span className="font-mono text-xs">{criterion.student_value}</span> (Req: {criterion.required_value})
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">{criterion.message}</div>
                </div>
              </div>
            ))}

            {action_items.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-800">
                <span className="font-semibold text-gray-400 block mb-1">Suggested Next Action:</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {action_items.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Direct Action Link */}
        <a
          href={scholarship.official_website}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
        >
          <span>Apply on Portal</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
