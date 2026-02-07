
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, User, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-headline font-bold text-xl text-primary">
          <Briefcase className="h-6 w-6" />
          <span>OpsMarketplace</span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {profile?.name} ({profile?.role})
                </span>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
