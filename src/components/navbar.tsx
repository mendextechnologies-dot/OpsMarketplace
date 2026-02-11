
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  LayoutDashboard, 
  LogOut, 
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

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
    <nav className="border-b bg-white sticky top-0 z-50 py-2">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl text-primary">
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
            <>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="h-8 w-[1px] bg-border mx-2" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold leading-none">{profile?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                      {profile?.role}
                    </p>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
