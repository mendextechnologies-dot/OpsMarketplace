
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Target, 
  Handshake, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  ArrowLeft,
  Sparkles
} from "lucide-react";

export default function HowItWorksConsultant() {
  const steps = [
    {
      id: 1,
      title: "Create Expert Profile",
      description: "Define your specialization, locations served, and years of experience. Our AI helps enhance your profile for high conversion.",
      icon: UserPlus,
    },
    {
      id: 2,
      title: "Receive AI-Matched Leads",
      description: "Stop browsing random lists. Receive exclusive, high-intent opportunities that specifically match your expertise and location.",
      icon: Target,
    },
    {
      id: 3,
      title: "Accept & Collaborate",
      description: "Unlock lead details and enter a managed project workspace. Share proposals, timelines, and milestones directly with the client.",
      icon: Handshake,
    },
    {
      id: 4,
      title: "Grow Your Reputation",
      description: "Successful completions improve your marketplace match score, leading to higher-value opportunities and better ranking.",
      icon: TrendingUp,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-primary/5 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold tracking-widest uppercase text-[10px]">For Experts & Consultants</Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Get High-Quality Opportunities — <span className="text-primary italic">Not Random Leads.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Focus on execution. Let our AI handle your sales pipeline by matching you with high-intent SME requirements that align with your specialized skills.
            </p>
            <div className="mt-10">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl rounded-xl" asChild>
                <Link href="/signup?role=consultant">Join Expert Network <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-16">The Expert Lifecycle</h2>
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
              <h2 className="text-3xl font-extrabold mb-8">Built for Professional Efficiency</h2>
              <div className="space-y-6">
                {[
                  { title: "High Intent Leads", desc: "No time-wasters. Every match is scored by AI for clarity and urgency." },
                  { title: "Protected Pricing", desc: "We are not a bidding site. We protect your value by matching on quality." },
                  { title: "Integrated Workspace", desc: "Manage client communication and document delivery in one platform." },
                  { title: "Market Insights", desc: "Access AI-driven pricing intelligence and market sentiment for your region." }
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
              <CardContent className="p-0 text-center space-y-6">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Ready to scale your practice?</h3>
                <p className="text-slate-400">Join our curated network of 500+ verified operational experts.</p>
                <Button size="lg" className="w-full h-14 text-lg font-bold shadow-2xl" asChild>
                  <Link href="/signup?role=consultant">Apply as Expert</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
