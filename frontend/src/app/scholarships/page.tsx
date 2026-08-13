"use client";

import { useState, useEffect } from "react";
import { fetchScholarships, Scholarship } from "@/lib/api";
import { Search, Filter, ExternalLink, Calendar, IndianRupee, Building, FileCheck } from "lucide-react";

export default function ScholarshipsDirectoryPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [providerType, setProviderType] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await fetchScholarships({
        query: query || undefined,
        category: category || undefined,
        education_level: educationLevel || undefined,
        provider_type: providerType || undefined,
      });
      setScholarships(items);
      setLoading(false);
    }
    load();
  }, [query, category, educationLevel, providerType]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-indigo-400" />
          <span>Scholarship Knowledge Base</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Explore structured criteria, deadlines, award amounts, and document rules for Indian government and private scholarships.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by scholarship name, provider (e.g. NSP, Reliance, Tata, HDFC)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Category Filter
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Minority">Minority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Education Level
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Education Levels</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Provider Type
            </label>
            <select
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Providers</option>
              <option value="Government">Government Schemes</option>
              <option value="Corporate CSR">Corporate CSR</option>
              <option value="NGO/Trust">NGO / Trust</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl glass-card animate-pulse bg-gray-900/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch) => (
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
                <p className="text-sm text-gray-400 mb-4">{sch.description}</p>

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

                <div className="mb-4">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Required Documents:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sch.required_documents.map((doc, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] bg-gray-800 text-gray-300 border border-gray-700">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={sch.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-indigo-600 text-white border border-gray-700 transition-all hover:scale-[1.01]"
              >
                <span>View Official Scheme Details</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
