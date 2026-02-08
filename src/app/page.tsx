
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Search, 
  ArrowRight, 
  XCircle, 
  AlertCircle,
  LayoutGrid,
  FileText,
  Building2,
  Clock,
  Briefcase,
  Handshake,
  TrendingUp,
  ShieldEllipsis,
  BookOpen
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1 — HERO */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/10 border-b overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20">
            Now in Early Access • For SMEs, Consultants & Partners
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
            Get Operational Work Done Faster — <br /> 
            <span className="text-primary">Without Endless Searching.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            The multi-sided marketplace for compliance, HR, payroll, and business operations. 
            Connect with verified experts through a structured partner-driven ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl" asChild>
              <Link href="/request/new">
                Submit Request <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
              <Link href="/signup">Join the Network</Link>
            </Button>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Verified Experts</span></div>
            <div className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Partner-Driven Model</span></div>
            <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Smart Matching</span></div>
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Structured Workflow</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PROBLEM STATEMENT */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Finding and Delivering Services is Broken</h2>
              <p className="text-muted-foreground">Traditional platforms focus on "contacts," not "delivery." We fixed that.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "SMEs Struggle", desc: "Finding trusted experts for specific state-wise compliance is a manual nightmare.", icon: Search },
                { title: "Experts Struggle", desc: "Consultants waste 40% of their time chasing random, low-intent leads.", icon: Briefcase },
                { title: "Partners Struggle", desc: "Channel partners lack a structured way to monetize their vast business network.", icon: Handshake },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center"><item.icon className="h-6 w-6 text-primary" /></div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — MULTI-SIDED POSITIONING (TABS) */}
      <section className="py-24 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">A Platform Built for Everyone</h2>
            <p className="text-muted-foreground mt-2">Tailored experiences for every role in the ecosystem.</p>
          </div>

          <Tabs defaultValue="smes" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-16 bg-white p-1 rounded-xl shadow-sm border">
              <TabsTrigger value="smes" className="text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white">For SMEs</TabsTrigger>
              <TabsTrigger value="consultants" className="text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white">For Consultants</TabsTrigger>
              <TabsTrigger value="partners" className="text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white">For Partners</TabsTrigger>
            </TabsList>
            
            <TabsContent value="smes" className="mt-10">
              <Card className="border-none shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-10 space-y-6">
                    <h3 className="text-3xl font-extrabold">Get Your Operational Work Done Faster</h3>
                    <p className="text-muted-foreground">Stop searching through lists. Submit your requirement and get matched with verified experts who actually understand your local laws.</p>
                    <ul className="space-y-4">
                      {[
                        "Submit requirements without registration",
                        "Matched with verified state-wise experts",
                        "No vendor spam or cold calls",
                        "Structured tracking for every request"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/request/new">Submit Requirement Now</Link>
                    </Button>
                  </div>
                  <div className="bg-primary/5 p-10 flex items-center justify-center">
                    <div className="space-y-4 w-full">
                       <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
                         <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Building2 className="h-5 w-5" /></div>
                         <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Next Step</p>
                            <p className="font-bold">PF Registration (Pune)</p>
                         </div>
                       </div>
                       <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 opacity-60">
                         <div className="bg-green-100 p-2 rounded-lg text-green-600"><ShieldCheck className="h-5 w-5" /></div>
                         <p className="font-bold">Expert Assigned</p>
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="consultants" className="mt-10">
              <Card className="border-none shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-10 space-y-6">
                    <h3 className="text-3xl font-extrabold">Get High-Intent Leads, Not Spam</h3>
                    <p className="text-muted-foreground">Stop chasing random contacts. Receive curated opportunities through our trusted partner network and focus on delivery.</p>
                    <ul className="space-y-4">
                      {[
                        "Pre-qualified operational requirements",
                        "Partner-managed client coordination",
                        "Clear scope and location details",
                        "Zero commission during early access"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/signup?role=consultant">Join as Consultant</Link>
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-10 flex items-center justify-center text-white">
                    <div className="space-y-6 w-full">
                       <p className="text-xs uppercase font-bold text-slate-400">Expert Console</p>
                       <div className="space-y-2">
                          <div className="h-1 bg-primary w-2/3 rounded-full" />
                          <p className="text-2xl font-bold">New Lead: Factory License</p>
                          <p className="text-sm text-slate-400">Mumbai, Maharashtra • 50 Employees</p>
                       </div>
                       <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">Accept Lead</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="mt-10">
              <Card className="border-none shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-10 space-y-6">
                    <h3 className="text-3xl font-extrabold">Monetize Your Professional Network</h3>
                    <p className="text-muted-foreground">Help your clients get operational work done by experts. You log the lead; our platform handles the rest.</p>
                    <ul className="space-y-4">
                      {[
                        "Maintain client ownership",
                        "Submit leads via simple dashboard",
                        "Earn incentives on successful completion",
                        "No execution responsibility required"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/signup?role=partner">Become a Partner</Link>
                    </Button>
                  </div>
                  <div className="bg-primary p-10 flex items-center justify-center text-white">
                    <div className="text-center space-y-6">
                       <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="h-10 w-10 text-white" />
                       </div>
                       <h4 className="text-2xl font-bold">Secure Your Lead Ownership</h4>
                       <p className="text-sm text-white/80">First submission wins primary ownership and incentives.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS (MASTER FLOW) */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">The Modern Operational Workflow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Bring Opportunity", desc: "SME or Partner submits a structured request.", icon: FileText },
              { title: "Smart Matching", desc: "Our engine finds the best state-wise expert.", icon: Zap },
              { title: "Coordination", desc: "Consultant works directly with the owner.", icon: Users },
              { title: "Work Delivered", desc: "Structured completion and reporting.", icon: CheckCircle2 },
            ].map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && <ArrowRight className="hidden md:block absolute -right-6 top-8 text-muted-foreground/30 h-6 w-6" />}
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <step.icon className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h4 className="font-bold mb-2">{i + 1}. {step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — COMPARISON */}
      <section className="py-24 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose OpsMarketplace?</h2>
            <p className="text-muted-foreground mt-2">Comparison based on typical operational service delivery.</p>
          </div>
          <Card className="max-w-4xl mx-auto border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900 text-white">
                <TableRow className="hover:bg-slate-900 border-none">
                  <TableHead className="text-white h-14">Feature</TableHead>
                  <TableHead className="text-white text-center">LinkedIn</TableHead>
                  <TableHead className="text-white text-center">IndiaMART</TableHead>
                  <TableHead className="text-white text-center font-bold bg-primary/20">OpsMarketplace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {[
                  { feature: "Structured service request", l: false, i: false, o: true },
                  { feature: "Lead Ownership Protection", l: false, i: false, o: true },
                  { feature: "State-wise Verified Experts", l: "partial", i: "partial", o: true },
                  { feature: "Partner Coordination Flow", l: false, i: false, o: true },
                  { feature: "Work Progress Tracking", l: false, i: false, o: true },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium py-6 text-sm">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.l === true ? <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" /> : row.l === "partial" ? <AlertCircle className="mx-auto h-5 w-5 text-amber-500" /> : <XCircle className="mx-auto h-5 w-5 text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.i === true ? <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" /> : row.i === "partial" ? <AlertCircle className="mx-auto h-5 w-5 text-amber-500" /> : <XCircle className="mx-auto h-5 w-5 text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-center bg-primary/5">
                      <CheckCircle2 className="mx-auto h-5 w-5 text-primary" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* SECTION 6 — PRICING / EARLY ACCESS */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Early Access Campaign</h2>
          <p className="opacity-80 max-w-2xl mx-auto mb-16 text-lg">
            Join the elite group of SMEs, Experts, and Partners during our India launch phase.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { role: "SME", desc: "For businesses", perks: ["Unlimited requests", "Expert matching", "Tracking dashboard"] },
              { role: "Consultant", desc: "For verified experts", perks: ["Free profile listing", "Curated opportunities", "Zero commission"] },
              { role: "Partner", desc: "For network owners", perks: ["Unlimited lead logging", "Ownership protection", "Incentive eligibility"] },
            ].map((pkg, i) => (
              <Card key={i} className="bg-white/10 border-white/20 text-white backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.role} Access</CardTitle>
                  <CardDescription className="text-white/60">{pkg.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  {pkg.perks.map((p, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-accent" /> <span>{p}</span>
                    </div>
                  ))}
                  <div className="pt-8 text-center">
                    <p className="text-4xl font-extrabold mb-1">FREE</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest">First 6 Months</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — INSIGHTS placeholder */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Operational Insights for Growing Businesses</h2>
            <p className="text-muted-foreground mt-2">Latest from our knowledge hub.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Understanding Shop Act Registration", tag: "Compliance" },
              { title: "Best Practices for SME Payroll", tag: "HR Ops" },
              { title: "The Future of Partner-Led Marketplaces", tag: "Growth" },
            ].map((post, i) => (
              <Card key={i} className="group cursor-pointer hover:shadow-lg transition-all">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="pt-6">
                  <Badge variant="outline" className="mb-4">{post.tag}</Badge>
                  <h4 className="font-bold text-lg mb-4 group-hover:text-primary transition-colors">{post.title}</h4>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Faster. Deliver Better. Grow Together.</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
            Join 500+ businesses and professionals streamlining operations today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link href="/request/new">Submit Request</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg text-white border-white/20 hover:bg-white/10" asChild>
              <Link href="/signup">Join the Network</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

    