
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Briefcase
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
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-white to-secondary/10 border-b">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20">
            Now in Early Access • Free for 6 Months
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
            Get Operational Work Done Faster — <br /> 
            <span className="text-primary">Without Endless Searching.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with verified experts for compliance, HR, payroll, licensing, and business operations — 
            matched to your needs faster than traditional platforms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl" asChild>
              <Link href="/request/new">
                Submit Request <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
              <Link href="#services">Explore Services</Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Submit Request", icon: FileText },
              { label: "Get Matched", icon: Zap },
              { label: "Work Done", icon: CheckCircle2 },
            ].map((step, i) => (
              <div key={i} className="flex items-center justify-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-primary/10">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <step.icon className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — Problem Statement */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Finding the Right Expert Today Is Slow and Confusing</h2>
              <p className="text-muted-foreground">Generalist platforms aren't built for specific operational tasks.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Wasted Hours", desc: "Searching on LinkedIn takes days of back-and-forth messaging with no structure.", icon: Clock },
                { title: "Product Focus", desc: "IndiaMART focuses on products, not specialized operational or legal tasks.", icon: Search },
                { title: "No Workflow", desc: "Traditional platforms end at 'contact sharing' — leaving the tracking to you.", icon: XCircle },
                { title: "Opaque Quality", desc: "Hard to compare expertise or verify if they can actually handle your state's laws.", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="bg-muted p-3 rounded-lg"><item.icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Comparison */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Built Differently from Traditional Platforms</h2>
          </div>
          <Card className="max-w-5xl mx-auto border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-primary text-primary-foreground">
                <TableRow className="hover:bg-primary border-none">
                  <TableHead className="text-primary-foreground h-14">Feature</TableHead>
                  <TableHead className="text-primary-foreground text-center">LinkedIn</TableHead>
                  <TableHead className="text-primary-foreground text-center">IndiaMART</TableHead>
                  <TableHead className="text-primary-foreground text-center font-bold">OpsMarketplace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {[
                  { feature: "Structured service request", l: false, i: false, o: true },
                  { feature: "SME operational focus", l: "partial", i: "partial", o: true },
                  { feature: "Guided workflow", l: false, i: false, o: true },
                  { feature: "Verified expert matching", l: false, i: "partial", o: true },
                  { feature: "Progress tracking", l: false, i: false, o: true },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium py-6">{row.feature}</TableCell>
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
            <div className="p-4 bg-muted text-[10px] text-muted-foreground text-center uppercase font-bold tracking-widest">
              Comparison based on typical user experience
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 5 — Services Offered */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise-Ready Service Categories</h2>
            <p className="text-muted-foreground">Expert support across all critical business operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Labour & Compliance", icon: ShieldCheck, desc: "Shop Act, Factory Licences, POSH & Audits." },
              { title: "Payroll & HR Ops", icon: Users, desc: "Processing, PF/ESIC filing, Policy drafting." },
              { title: "Business Licensing", icon: Building2, desc: "MSME, GST, Trade Licences & PT." },
              { title: "Finance & Accounting", icon: Briefcase, desc: "Bookkeeping, TDS & ROC Compliance." },
              { title: "Legal Documentation", icon: FileText, desc: "NDAs, Employment & Vendor Contracts." },
              { title: "Industrial Compliance", icon: LayoutGrid, desc: "Safety audits, Pollution & ISO Certs." },
            ].map((service, i) => (
              <Card key={i} className="group hover:border-primary transition-all duration-300 shadow-sm">
                <CardContent className="pt-8">
                  <div className="bg-primary/5 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <service.icon className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Pricing */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Early Access — Free for First 6 Months</h2>
          <p className="opacity-80 max-w-2xl mx-auto mb-16 text-lg">
            Launching campaign — join the elite group of SMEs and Experts growing with a structured marketplace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl">SME Access</CardTitle>
                <CardDescription className="text-white/60">For Businesses needing support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-accent" /> <span>Unlimited service requests</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-accent" /> <span>Verified expert matching</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-accent" /> <span>Progress tracking dashboard</span></div>
                <div className="pt-6">
                  <p className="text-4xl font-extrabold mb-1">FREE</p>
                  <p className="text-xs opacity-60">INDIA LAUNCH CAMPAIGN</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white text-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Consultant Access</CardTitle>
                <CardDescription>For Verified Experts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-primary" /> <span>Receive qualified leads</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-primary" /> <span>Expert profile listing</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-primary" /> <span>Zero platform commission</span></div>
                <div className="pt-6">
                  <p className="text-4xl font-extrabold mb-1">FREE</p>
                  <p className="text-xs text-muted-foreground uppercase">Early access only</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FINAL CTA */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Stop Searching. Start Solving.</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join 500+ SMEs who have streamlined their business operations with our expert network.
          </p>
          <Button size="lg" className="h-16 px-12 text-xl shadow-2xl group" asChild>
            <Link href="/request/new">
              Submit Your Requirement
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
