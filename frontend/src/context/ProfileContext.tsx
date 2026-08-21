"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StudentProfileData } from "@/lib/api";

interface ProfileContextType {
  profile: StudentProfileData | null;
  hasProfile: boolean;
  loading: boolean;
  saveProfile: (data: StudentProfileData) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  hasProfile: false,
  loading: true,
  saveProfile: () => {},
  clearProfile: () => {},
});

const LOCAL_STORAGE_KEY = "scholarship_student_profile";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = (data: StudentProfileData) => {
    setProfile(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear profile from localStorage", e);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: profile !== null,
        loading,
        saveProfile,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
