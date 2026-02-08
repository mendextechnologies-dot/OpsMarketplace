
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Users, 
  Zap, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ClipboardCheck, 
  ArrowLeft,
  XCircle,
  Copy,
  TrendingUp,
  Globe,
  Linkedin
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function GrowthPlaybookPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  if (profile?.role !== "admin") {
    return (
      <div className="container mx-auto p-20 text-center">
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste the outreach message.",
    });
  };

  const outreachScript = "We help you monetize your network by bringing operational opportunities to our marketplace. You maintain the relationship, we provide the execution experts.";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Console
        </Link>
      </Button>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight">Growth Playbook</h1>
        </div>
        <p className="text-muted-foreground text-lg">Standard operating guide for onboarding partners, generating leads, and activating marketplace growth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: STRATEGY & MODEL */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: CORE GROWTH MODEL */}
          <Card className="border-2 shadow-sm bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Core Growth Model
              </CardTitle>
              <CardDescription>Our flywheel for scaling the ecosystem.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded-xl border border-primary/5">
                {[
                  { label: "Channel Partner", icon: Users },
                  { label: "Lead", icon: Target },
                  { label: "Expert Match", icon: Zap },
                  { label: "Work Done", icon: CheckCircle2 },
                  { label: "Incentive", icon: Zap }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{step.label}</span>
                    </div>
                    {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                Our growth is partner-driven. We don't focus on direct SME ads. Instead, we activate **Network Owners** who already hold the trust of SMEs. Focus on activating partners and completing real deals to fuel the loop.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 2: LEAD GEN PLAYBOOK */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Lead Generation Playbook
              </CardTitle>
              <CardDescription>Manual intelligence mining for early traction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Mining
                  </h4>
                  <ul className="text-xs space-y-3">
                    <li className="flex gap-2">
                      <Badge variant="outline" className="h-5">Target</Badge>
                      <span>Founders, HR Managers, Admin Heads</span>
                    </li>
                    <li className="flex gap-2">
                      <Badge variant="outline" className="h-5">Keywords</Badge>
                      <span className="italic">"Need compliance help", "Looking for HR consultant", "Payroll outsourcing"</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Globe className="h-4 w-4 text-green-600" /> Google Search Mining
                  </h4>
                  <ul className="text-xs space-y-3">
                    <li className="flex gap-2">
                      <Badge variant="outline" className="h-5">Query 1</Badge>
                      <span>"PF registration help Maharashtra"</span>
                    </li>
                    <li className="flex gap-2">
                      <Badge variant="outline" className="h-5">Query 2</Badge>
                      <span>"Shop act consultant Pune"</span>
                    </li>
                    <li className="flex gap-2">
                      <Badge variant="outline" className="h-5">Query 3</Badge>
                      <span>"HR outsourcing for SME India"</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-5 border-2 border-dashed rounded-xl">
                <h4 className="font-bold text-sm mb-3">Lead Handling Workflow</h4>
                <div className="space-y-2">
                  {[
                    "Create Lead in Admin Manual Panel",
                    "Assign verified Consultant based on location/skill",
                    "Notify Owner (Partner or Admin) to initiate coordination",
                    "Track weekly progress in Pipeline dashboard",
                    "Mark 'Completed' to trigger recognition/incentives"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <div className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: ACTIONS & KPI */}
        <div className="space-y-8">
          {/* PARTNER ONBOARDING */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Partner Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Target Profiles</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">HR Consultants</Badge>
                  <Badge variant="secondary">CA Firms</Badge>
                  <Badge variant="secondary">Payroll Agencies</Badge>
                  <Badge variant="secondary">Recruitment Firms</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Outreach Script</p>
                <div className="p-3 bg-slate-900 text-white rounded-lg text-[10px] relative group">
                  <p className="italic leading-relaxed">"{outreachScript}"</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1 h-6 w-6 text-white/50 hover:text-white"
                    onClick={() => copyToClipboard(outreachScript)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Onboarding Steps</p>
                {[
                  "Identify target partner via LinkedIn",
                  "Send personalized introduction script",
                  "Create Partner Account on platform",
                  "Review service focus and location",
                  "Request first lead submission to test flow"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <ClipboardCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPI TRACKING */}
          <Card className="border-2 shadow-sm border-slate-900">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" /> Operational KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">Primary Goal</p>
                <p className="text-xl font-extrabold text-primary">Completed Deals</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Partners</p>
                  <p className="font-bold">Growth Source</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Leads/Week</p>
                  <p className="font-bold">Pipeline Health</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ANTI-FOCUS */}
          <Card className="border-2 border-red-100 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-900 uppercase tracking-tighter">
                <XCircle className="h-4 w-4 text-red-600" /> What NOT To Focus On
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Paid Performance Ads (too early)",
                "Complex AI matching logic",
                "Automated payout systems",
                "Heavy SEO content strategies"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-red-800 opacity-80">
                  <XCircle className="h-3 w-3" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
