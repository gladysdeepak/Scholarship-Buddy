"use client";

import { useState } from "react";
import { StudentProfileData } from "@/lib/api";
import {
  User,
  Building,
  GraduationCap,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";

interface ProfileFormProps {
  initialProfile: StudentProfileData;
  onSave: (profile: StudentProfileData) => void;
}

const PRESET_PROFILES: { label: string; data: Partial<StudentProfileData> }[] = [
  {
    label: "Rahul Sharma (OBC B.Tech Student, Maharashtra)",
    data: {
      name: "Rahul Sharma",
      state: "Maharashtra",
      district: "Pune",
      category: "OBC",
      annual_family_income: 250000,
      gender: "Male",
      education_level: "Undergraduate",
      course: "B.Tech Computer Science",
      year_of_study: 1,
      cgpa_or_percentage: 82.5,
      domicile: "Maharashtra",
      first_generation_learner: true,
      single_girl_child: false,
    },
  },
  {
    label: "Priya Patel (Girl Engineering Student - Pragati Eligible)",
    data: {
      name: "Priya Patel",
      state: "Gujarat",
      district: "Ahmedabad",
      category: "General",
      annual_family_income: 450000,
      gender: "Female",
      education_level: "Undergraduate",
      course: "B.E Electronics Engineering",
      year_of_study: 1,
      cgpa_or_percentage: 88.0,
      domicile: "Gujarat",
      single_girl_child: true,
      first_generation_learner: false,
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
      education_level: "Undergraduate",
      course: "B.Sc Agriculture",
      year_of_study: 1,
      cgpa_or_percentage: 76.0,
      domicile: "Uttar Pradesh",
      first_generation_learner: true,
    },
  },
];

export default function ProfileForm({ initialProfile, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState<StudentProfileData>(initialProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof StudentProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadPreset = (presetData: Partial<StudentProfileData>) => {
    setFormData((prev) => ({ ...prev, ...presetData }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      {/* Preset Quick Load Bar */}
      <div className="mb-8 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Preset Profiles for Testing:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROFILES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset.data)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-gray-700 text-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div>
          <h3 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> 1. Personal & Demographics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category / Reservation Group</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Minority Community</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">State of Domicile</label>
              <input
                type="text"
                required
                value={formData.domicile}
                onChange={(e) => handleChange("domicile", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Maharashtra, Karnataka, J&K"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">District</label>
              <input
                type="text"
                value={formData.district || ""}
                onChange={(e) => handleChange("district", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Pune"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Religion (Optional)</label>
              <input
                type="text"
                value={formData.religion || ""}
                onChange={(e) => handleChange("religion", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial Information */}
        <div>
          <h3 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" /> 2. Financial & Family Background
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Annual Family Income (in INR ₹)
              </label>
              <input
                type="number"
                required
                min={0}
                max={5000000}
                value={formData.annual_family_income}
                onChange={(e) => handleChange("annual_family_income", parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                ₹{formData.annual_family_income.toLocaleString()} per annum
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Parent Occupation</label>
              <input
                type="text"
                value={formData.parent_occupation || ""}
                onChange={(e) => handleChange("parent_occupation", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Farmer, Salaried, Daily Wager"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="first_gen"
                checked={formData.first_generation_learner}
                onChange={(e) => handleChange("first_generation_learner", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
              />
              <label htmlFor="first_gen" className="text-sm font-medium text-gray-300">
                First Generation Learner in Family
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Academic Details */}
        <div>
          <h3 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" /> 3. Academic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Education Level</label>
              <select
                value={formData.education_level}
                onChange={(e) => handleChange("education_level", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / B.Com / MBBS)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MBA)</option>
                <option value="Doctoral / PhD">Doctoral / PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Course / Specialization</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => handleChange("course", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Academic Score (% or CGPA scaled to 100)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                required
                value={formData.cgpa_or_percentage}
                onChange={(e) => handleChange("cgpa_or_percentage", parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Special Quotas & Attributes */}
        <div>
          <h3 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> 4. Special Quotas & Reservations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
              <input
                type="checkbox"
                id="single_girl"
                checked={formData.single_girl_child}
                onChange={(e) => handleChange("single_girl_child", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700"
              />
              <label htmlFor="single_girl" className="text-xs font-medium text-gray-300">
                Single Girl Child Quota
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
              <input
                type="checkbox"
                id="pwd"
                checked={formData.disability_status}
                onChange={(e) => handleChange("disability_status", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700"
              />
              <label htmlFor="pwd" className="text-xs font-medium text-gray-300">
                Person with Disability (PwD)
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
              <input
                type="checkbox"
                id="sports"
                checked={formData.sports_quota}
                onChange={(e) => handleChange("sports_quota", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700"
              />
              <label htmlFor="sports" className="text-xs font-medium text-gray-300">
                Sports / NCC Representation
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
              <input
                type="checkbox"
                id="defence"
                checked={formData.defence_quota}
                onChange={(e) => handleChange("defence_quota", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700"
              />
              <label htmlFor="defence" className="text-xs font-medium text-gray-300">
                Defence / Ex-Servicemen Quota
              </label>
            </div>
          </div>
        </div>

        {/* Submit & Save */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          {savedSuccess ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="w-5 h-5" /> Profile Saved & Eligibility Updated!
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Updating your profile re-runs the rule engine automatically.
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save & Evaluate Eligibility</span>
          </button>
        </div>
      </form>
    </div>
  );
}
