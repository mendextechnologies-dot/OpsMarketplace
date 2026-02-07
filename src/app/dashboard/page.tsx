
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
          // Check if onboarding is needed
          if (!profile.onboarded) {
            router.push("/onboarding/sme");
          } else {
            router.push("/dashboard/sme");
          }
        } else if (profile.role === "consultant") {
          // For consultants, we have /profile/setup logic usually
          router.push("/dashboard/consultant");
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
