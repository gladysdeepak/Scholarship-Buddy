"use client";

import { FormEvent, useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { streamChat } from "@/lib/api";
import { useProfile } from "@/context/ProfileContext";

type Message = { role: "user" | "assistant"; text: string; sources?: any[]; steps?: string[] };

export default function ChatPage() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  async function send(event: FormEvent) {
    event.preventDefault();
    const text = query.trim(); if (!text || busy) return;
    setMessages((all) => [...all, { role: "user", text }]); setQuery(""); setBusy(true); setSteps([]);
    try {
      const result = await streamChat(text, profile || undefined, (step) => setSteps((all) => [...all, step]));
      setMessages((all) => [...all, { role: "assistant", text: result?.answer || "No answer was returned.", sources: result?.sources, steps: result?.steps }]);
    } catch (error: any) {
      setMessages((all) => [...all, { role: "assistant", text: error.message || "Unable to reach the assistant." }]);
    } finally { setBusy(false); }
  }
  return <main className="max-w-4xl mx-auto px-4 py-12">
    <div className="mb-8"><p className="text-indigo-300 text-sm flex items-center gap-2"><Sparkles size={16}/> Scholarship assistant</p><h1 className="text-4xl font-bold mt-2">Ask about scholarships</h1><p className="text-gray-400 mt-2">Answers use the indexed scholarship information. Verify current dates on official portals.</p></div>
    <section className="glass-panel rounded-2xl p-5 min-h-[420px] space-y-5">
      {!messages.length && <div className="text-gray-400 py-16 text-center">Try “What documents does the NSP post-matric scholarship require?”</div>}
      {messages.map((message, i) => <article key={i} className={`rounded-xl p-4 ${message.role === "user" ? "bg-indigo-950/60 ml-12" : "bg-gray-900/70 mr-8"}`}>
        <p className="text-xs uppercase tracking-wide text-indigo-300 mb-2">{message.role === "user" ? "You" : "Scholarship Buddy"}</p><p className="whitespace-pre-wrap leading-7">{message.text}</p>
        {message.sources?.length ? <div className="mt-4 border-t border-gray-700 pt-3"><p className="text-xs text-gray-400 mb-2">Sources</p>{message.sources.map((s, j) => <p key={j} className="text-xs text-gray-300 mb-2"><b>{s.title || s.scholarship_id}</b> — {s.excerpt}</p>)}</div> : null}
      </article>)}
      {busy && <p className="text-sm text-indigo-300 flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> {steps.at(-1) || "Thinking…"}</p>}
    </section>
    <form onSubmit={send} className="flex gap-3 mt-4"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about eligibility, documents, or a scheme…" className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-indigo-500"/><button disabled={busy} className="rounded-xl bg-indigo-600 px-5 py-3 disabled:opacity-50"><Send size={18}/></button></form>
    {profile && <p className="text-xs text-gray-500 mt-2">Your saved profile is included for eligibility and document questions.</p>}
  </main>;
}
