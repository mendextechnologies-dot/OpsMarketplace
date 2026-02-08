
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile) {
        if (profile.role === "sme") {
          if (!profile.onboarded) {
            router.push("/onboarding/sme");
          } else {
            router.push("/dashboard/sme");
          }
        } else if (profile.role === "consultant") {
          if (!profile.onboarded) {
            router.push("/profile/setup");
          } else {
            router.push("/dashboard/consultant");
          }
        } else if (profile.role === "partner") {
          if (!profile.onboarded) {
            router.push("/onboarding/partner");
          } else {
            router.push("/dashboard/partner");
          }
        } else if (profile.role === "admin") {
          router.push("/dashboard/admin");
        }
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground animate-pulse font-medium">Preparing your workspace...</p>
      </div>
    </div>
  );
}
