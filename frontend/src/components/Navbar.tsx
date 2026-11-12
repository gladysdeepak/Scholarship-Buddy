"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import {
  GraduationCap,
  User,
  Award,
  Search,
  FileText,
  Sparkles,
  LogOut,
  UserPlus,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { profile, hasProfile, clearProfile } = useProfile();

  const navLinks = [
    { name: "Home", href: "/", icon: Sparkles },
    { name: "My Profile", href: "/profile", icon: User },
    {
      name: "Matched Schemes",
      href: "/matches",
      icon: Award,
      badge: hasProfile ? "Active" : undefined,
    },
    { name: "All Scholarships", href: "/scholarships", icon: Search },
    { name: "Document Guide", href: "/documents", icon: FileText },
    { name: "AI Chat", href: "/chat", icon: MessageCircle },
    { name: "SOP Builder", href: "/sop", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Vision Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-outfit gradient-text tracking-wide">
                Scholarship Buddy
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                India AI Copilot
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profile Status & Action Button */}
          <div className="flex items-center gap-3">
            {hasProfile && profile ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-indigo-500/30 hover:border-indigo-400 text-xs font-semibold text-gray-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{profile.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {profile.category}
                  </span>
                </Link>

                <button
                  onClick={clearProfile}
                  title="Reset profile and return to default guest portal"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-800/40 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Reset Profile</span>
                </button>
              </div>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
