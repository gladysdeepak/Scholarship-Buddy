"use client";

import { useEffect, useState } from "react";
import { generateSOP, fetchScholarships, Scholarship } from "@/lib/api";
import { useProfile } from "@/context/ProfileContext";

const questions = ["What are you studying, and what do you hope to do after graduation?", "What experiences or achievements show your commitment to this field?", "What financial or personal challenges have affected your education?", "Who or what inspired your goals?", "How would this scholarship help you reach those goals?"];

export default function SOPPage() {
  const { profile } = useProfile();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [scheme, setScheme] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetchScholarships().then((items) => { setScholarships(items); if (items[0]) setScheme(items[0].id); }); }, []);
  async function submit() {
    setBusy(true); setError(""); setDraft("");
    try { const result = await generateSOP({ student_id: profile?.id || "guest", scholarship_id: scheme, answers, tone: "formal" });
      if (!result.draft) setError("Please answer all five questions before generating your statement."); else setDraft(result.draft);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="max-w-4xl mx-auto px-4 py-12"><p className="text-indigo-300 text-sm">Application writing assistant</p><h1 className="text-4xl font-bold mt-2">Statement of purpose builder</h1><p className="text-gray-400 mt-2 mb-8">Share your own experiences. The draft will not invent achievements; review it before submitting.</p>
    <section className="glass-panel rounded-2xl p-6 space-y-5"><label className="block text-sm text-gray-300">Scholarship<select value={scheme} onChange={(e) => setScheme(e.target.value)} className="block w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700">{scholarships.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {questions.map((question, i) => <label key={question} className="block text-sm text-gray-300">{i + 1}. {question}<textarea value={answers[i]} onChange={(e) => setAnswers((all) => all.map((v, j) => i === j ? e.target.value : v))} rows={3} className="block w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700" /></label>)}
      <button onClick={submit} disabled={busy || !scheme} className="rounded-lg bg-indigo-600 px-5 py-3 disabled:opacity-50">{busy ? "Preparing draft…" : "Generate and save draft"}</button>{error && <p className="text-amber-300">{error}</p>}
    </section>
    {draft && <section className="glass-panel rounded-2xl p-6 mt-6"><h2 className="font-bold text-xl mb-3">Your saved draft</h2><textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={22} className="w-full rounded-lg bg-gray-950 border border-gray-700 p-4 leading-7"/><p className="text-xs text-gray-500 mt-2">The generated version is saved. Edits made here are not saved automatically.</p></section>}
  </main>;
}
