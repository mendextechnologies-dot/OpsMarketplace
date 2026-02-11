
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  LayoutGrid, 
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";

export default function HowItWorksSME() {
  const steps = [
    {
      id: 1,
      title: "Describe Your Need",
      description: "Use natural language to tell us what you need. Our AI understands compliance, HR, and operational requirements without complex forms.",
      icon: MessageSquare,
    },
    {
      id: 2,
      title: "Get Smart Matches",
      description: "Our AI engine scans our verified expert network and recommends the top 3 consultants with matching skills and location scores.",
      icon: Sparkles,
    },
    {
      id: 3,
      title: "Start Secure Workspace",
      description: "Once you pick an expert, a dedicated workspace is created. Share documents, track tasks, and communicate in one protected place.",
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: "Complete Compliance Faster",
      description: "Get guided execution with deadline reminders and expert collaboration. No more chasing consultants over random calls.",
      icon: Zap,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold tracking-widest uppercase text-[10px]">For Businesses & SMEs</Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Get the Right HR & Compliance Expert — <span className="text-primary italic">Without Searching Hundreds.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Describe your requirement once. Our AI matches you with verified specialists and manages the workflow from start to finish.
            </p>
            <div className="mt-10">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl rounded-xl" asChild>
                <Link href="/request/new">Start Your Request <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-16">The Managed Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.id}. {step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                {step.id < 4 && (
                  <div className="hidden lg:block absolute top-8 -right-6 text-slate-200">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold mb-8">Why Businesses Choose OpsMarketplace</h2>
              <div className="space-y-6">
                {[
                  { title: "Save Days of Searching", desc: "AI qualification does the heavy lifting." },
                  { title: "Verified Experts Only", desc: "No random self-listed profiles. Every expert is vetted." },
                  { title: "Protected Workspace", desc: "Payments and documents are handled within our secure platform." },
                  { title: "Transparent Progress", desc: "Track tasks and compliance milestones in real-time." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] p-10">
              <CardContent className="p-0 space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to simplify your operations?</h3>
                  <p className="text-slate-400 mb-8">Join thousands of SMEs getting compliance done right.</p>
                  <Button size="lg" className="w-full h-14 text-lg font-bold shadow-2xl" asChild>
                    <Link href="/request/new">Post Smart Request</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
