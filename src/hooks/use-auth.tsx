
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";

interface OrganisationProfile {
  companyName: string;
  industry: string;
  employeeCount: number;
  state: string;
  city: string;
  contactPerson: string;
  phone: string;
}

interface PartnerProfile {
  partnerName: string;
  phone: string;
  city: string;
  servicesFocus: string[];
  status: "active" | "inactive";
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "sme" | "consultant" | "admin" | "partner";
  onboarded?: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  orgProfile: OrganisationProfile | null;
  partnerProfile: PartnerProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  orgProfile: null,
  partnerProfile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orgProfile, setOrgProfile] = useState<OrganisationProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const p = { id: docSnap.id, ...docSnap.data() } as UserProfile;
      setProfile(p);

      if (p.role === 'sme') {
        const orgRef = doc(db, "organisationProfiles", uid);
        const orgSnap = await getDoc(orgRef);
        if (orgSnap.exists()) {
          setOrgProfile(orgSnap.data() as OrganisationProfile);
        }
      } else if (p.role === 'partner') {
        const partnerRef = doc(db, "partnerProfiles", uid);
        const partnerSnap = await getDoc(partnerRef);
        if (partnerSnap.exists()) {
          setPartnerProfile(partnerSnap.data() as PartnerProfile);
        }
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setOrgProfile(null);
        setPartnerProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, orgProfile, partnerProfile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
