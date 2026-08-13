import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scholarship Buddy | AI Scholarship Copilot for India",
  description:
    "Agentic AI platform & deterministic rule engine helping Indian students discover, verify eligibility, and apply for government, corporate CSR, and trust scholarships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-gray-100 antialiased selection:bg-indigo-600 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-900 bg-[#060910] py-8 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-300">Scholarship Buddy India</span>
              <span>• Phase 1 AI Copilot</span>
            </div>
            <p>
              Rule-based eligibility matching powered by FastAPI & Next.js. Data verified for NSP, Reliance, Tata, HDFC & State Schemes.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
