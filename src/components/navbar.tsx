
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, LogOut, Bell, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Sidebar from "@/components/Sidebar";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (user) {
      document.body.classList.add('has-sidebar');
    } else {
      document.body.classList.remove('has-sidebar');
    }
    return () => document.body.classList.remove('has-sidebar');
  }, [user]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {user && <Sidebar profile={profile} pathname={pathname} />}

      <nav className="border-b bg-white sticky top-0 z-50 py-2">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className={cn("flex items-center gap-2 font-black text-2xl text-primary", user ? 'hidden lg:flex' : 'flex')}>
            <div className="bg-primary p-1.5 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span>OpsMarket</span>
          </Link>

          {!user && (
            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => scrollToSection('sme-details')} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">For Businesses</button>
              <button onClick={() => scrollToSection('expert-details')} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">For Experts</button>
              <button onClick={() => scrollToSection('partner-details')} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">For Partners</button>
            </div>
          )}

          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" asChild className="font-bold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-xl font-bold shadow-lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1 pl-2 pr-2 rounded-xl hover:bg-muted transition-colors outline-none">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold leading-none text-slate-900">{profile?.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                        {profile?.role}
                      </p>
                    </div>
                    <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} />
                      <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none">
                  <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground p-3">Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer">
                    <Link href="/settings/profile" className="flex items-center gap-3 font-bold">
                      <Settings className="h-4 w-4 text-primary" /> Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-3 font-bold">
                      <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="rounded-xl p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 font-bold">
                    <LogOut className="h-4 w-4 mr-3" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
