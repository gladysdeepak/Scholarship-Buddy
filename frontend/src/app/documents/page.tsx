"use client";

import { useState, useEffect } from "react";
import { fetchDocumentGuidance, DocumentGuidanceItem, StudentProfileData } from "@/lib/api";
import { FileText, Building, Clock, CheckSquare, Sparkles, MapPin } from "lucide-react";

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

export default function DocumentGuidePage() {
  const [guidance, setGuidance] = useState<DocumentGuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let currentProfile = DEFAULT_PROFILE;
      const saved = localStorage.getItem("scholarship_student_profile");
      if (saved) {
        try {
          currentProfile = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      const data = await fetchDocumentGuidance(currentProfile);
      setGuidance(data);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-400" />
          <span>Document Procurement Guide</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Personalized checklist and official portal instructions on where to apply for essential Indian scholarship certificates.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl glass-card animate-pulse bg-gray-900/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {guidance.map((item, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-500 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-white">{item.document_name}</h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-indigo-400" /> Authority: {item.issuing_authority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-amber-300 border border-gray-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Est. Time: {item.estimated_days}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 space-y-1.5">
                  <span className="font-semibold text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Where & How to Apply:
                  </span>
                  <p className="text-gray-400 leading-relaxed">{item.where_to_obtain}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 space-y-1.5">
                  <span className="font-semibold text-gray-300 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Papers Required to Apply:
                  </span>
                  <ul className="list-disc pl-4 text-gray-400 space-y-0.5">
                    {item.documents_needed_to_apply.map((docReq, i) => (
                      <li key={i}>{docReq}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {item.required_for_scholarships.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Required for:</span>
                  {item.required_for_scholarships.map((schName, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                      {schName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
