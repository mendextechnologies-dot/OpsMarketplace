
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
          router.push("/dashboard/sme");
        } else if (profile.role === "consultant") {
          router.push("/dashboard/consultant");
        } else if (profile.role === "admin") {
          router.push("/dashboard/admin");
        }
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
