"use client";

import Link from "next/link";
import { LayoutDashboard, User as UserIcon, FileText, Users, Handshake, Activity, AlertTriangle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ profile, pathname }: { profile: any, pathname?: string }) {
  const isAdmin = profile?.role === 'admin';

  return (
    <aside className={cn("app-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 flex-col p-6 border-r bg-white z-50 transition-transform duration-300")}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="flex items-center gap-2 font-black text-lg text-primary">
          <div className="bg-primary p-2 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span>OpsMarket</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className={cn('nav-item', pathname?.startsWith('/dashboard') && !pathname?.startsWith('/dashboard/admin') ? 'active' : '')}>
          <LayoutDashboard className="h-4 w-4" /> <span>Dashboard</span>
        </Link>
        {isAdmin && (
          <Link href="/dashboard/admin" className={cn('nav-item', pathname?.startsWith('/dashboard/admin') ? 'active' : '')}>
            <UserIcon className="h-4 w-4" /> <span>Super Admin</span>
          </Link>
        )}
        <Link href="/request/new" className="nav-item">
          <FileText className="h-4 w-4" /> <span>Log Requirement</span>
        </Link>
        <Link href="/dashboard/consultant" className="nav-item">
          <Users className="h-4 w-4" /> <span>Consultants</span>
        </Link>
        <Link href="/dashboard/partner" className="nav-item">
          <Handshake className="h-4 w-4" /> <span>Partners</span>
        </Link>
        <Link href="/dashboard/sme" className="nav-item">
          <UserIcon className="h-4 w-4" /> <span>SMEs</span>
        </Link>
        <Link href="/dashboard/admin?view=pipeline" className="nav-item">
          <Activity className="h-4 w-4" /> <span>Live Pipeline</span>
        </Link>
        {isAdmin && (
          <>
            <Link href="/dashboard/admin?view=conflicts" className="nav-item">
              <AlertTriangle className="h-4 w-4" /> <span>Conflicts</span>
            </Link>
            <Link href="/dashboard/admin?view=users" className="nav-item">
              <Database className="h-4 w-4" /> <span>Users</span>
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6">
        <div className="p-3 bg-muted rounded-xl">
          <p className="text-xs font-black">Platform Control</p>
          <p className="text-[11px] text-muted-foreground">Manage users, access and system settings.</p>
          <div className="mt-3">
            <Link href="/settings" className="text-sm font-bold text-primary">Go to Settings →</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
