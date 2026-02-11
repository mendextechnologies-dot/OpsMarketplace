
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  ArrowLeft,
  Building2
} from "lucide-react";

export default function HowItWorksPartner() {
  const steps = [
    {
      id: 1,
      title: "Register as Partner",
      description: "Onboard your firm and define your core operational focus and the industries your network serves.",
      icon: Building2,
    },
    {
      id: 2,
      title: "Secure Lead Ownership",
      description: "Log requirements on behalf of your clients. Our system immediately locks lead ownership to your profile.",
      icon: ShieldCheck,
    },
    {
      id: 3,
      title: "Receive AI-Matched Projects",
      description: "Our AI identifies the best expert for your client's specific need based on specialized skills and location.",
      icon: Target,
    },
    {
      id: 4,
      title: "Managed Delivery",
      description: "Track the project progress through our structured workspace. Ensure your clients get the delivery they expect.",
      icon: Zap,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-amber-50/30 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-none font-bold tracking-widest uppercase text-[10px]">For Channel Partners</Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Monetize Your Network — <span className="text-amber-600 italic">With Zero Execution Risk.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Help your clients find the best operational experts while maintaining full visibility and lead ownership. We provide the infrastructure for managed execution.
            </p>
            <div className="mt-10">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl rounded-xl bg-amber-600 hover:bg-amber-700" asChild>
                <Link href="/signup?role=partner">Join Partner Network <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-16">The Partner Flywheel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                  <step.icon className="h-8 w-8 text-amber-600" />
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
              <h2 className="text-3xl font-extrabold mb-8">Strategic Ecosystem Benefits</h2>
              <div className="space-y-6">
                {[
                  { title: "Lead Ownership Protection", desc: "No disputes. Once you log a lead, it belongs to your node in the network." },
                  { title: "Premium Expert Delivery", desc: "Your clients get matched with only the top 5% of verified specialists." },
                  { title: "AI-Powered Qualification", desc: "We qualify client intent so you only focus on high-value conversations." },
                  { title: "Transparent Tracking", desc: "Monitor the execution lifecycle of every referral in real-time." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-amber-500 shrink-0" />
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
                <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold">Grow your advisory footprint.</h3>
                <p className="text-slate-400">Become a strategic node in the fastest-growing operational marketplace.</p>
                <Button size="lg" className="w-full h-14 text-lg font-bold shadow-2xl bg-amber-600 hover:bg-amber-700" asChild>
                  <Link href="/signup?role=partner">Join as Partner</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
