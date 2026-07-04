
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Search, 
  ArrowRight, 
  XCircle, 
  AlertCircle,
  Building2,
  Briefcase,
  Handshake,
  TrendingUp,
  Sparkles,
  Loader2,
  Send,
  X,
  MessageSquare,
  LayoutGrid,
  HeartHandshake,
  Target,
  Globe
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
import { cn } from "@/lib/utils";
import { complianceGuide } from "@/ai/flows/compliance-guide-flow";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, action?: string, url?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  const handleSendMessage = async (msg?: string) => {
    const text = msg || chatInput;
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text } as const];
    setMessages(newMessages);
    setChatInput("");
    setLoading(true);

    try {
      const response = await complianceGuide({
        message: text,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages([...newMessages, { 
        role: 'model', 
        content: response.answer,
        action: response.suggestedAction,
        url: response.redirectUrl
      }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', content: "Our matching engine is experiencing high demand. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = [
    {
      feature: "Workflow Structure",
      directory: { icon: "cross", text: "Open Search" },
      openBid: { icon: "warning", text: "Random Bidding" },
      opsMarketplace: { icon: "check", text: "Guided / Curated" },
    },
    {
      feature: "Lead Ownership",
      directory: { icon: "cross", text: "Shared Leads" },
      openBid: { icon: "cross", text: "Public View" },
      opsMarketplace: { icon: "check", text: "Exclusive / Protected" },
    },
    {
      feature: "Expert Verification",
      directory: { icon: "warning", text: "Self-Listed" },
      openBid: { icon: "warning", text: "Profile-Based" },
      opsMarketplace: { icon: "check", text: "State-Wise Verified" },
    },
    {
      feature: "Pricing Model",
      directory: { icon: "warning", text: "Price Wars" },
      openBid: { icon: "cross", text: "Race-to-Bottom" },
      opsMarketplace: { icon: "check", text: "Value-Driven" },
    },
    {
      feature: "Quality Control",
      directory: { icon: "cross", text: "High Spam" },
      openBid: { icon: "warning", text: "High Noise" },
      opsMarketplace: { icon: "check", text: "High Intent" },
    },
  ];

  const renderCell = (data: { icon: string; text?: string }, isOps = false) => {
    const Icon = data.icon === "check" ? CheckCircle2 : data.icon === "warning" ? AlertCircle : XCircle;
    const colorClass = data.icon === "check" 
      ? (isOps ? "text-primary" : "text-green-500") 
      : data.icon === "warning" ? "text-amber-500" : "text-muted-foreground/30";
    
    return (
      <div className="flex flex-col items-center gap-1 py-3">
        <Icon className={cn("h-4 w-4", colorClass)} />
        {data.text && <span className="text-[9px] font-bold uppercase tracking-tight opacity-70">{data.text}</span>}
      </div>
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const smeImg = getImg('sme-illustration');
  const expertImg = getImg('expert-illustration');
  const partnerImg = getImg('partner-illustration');

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* AI CHAT FUNNEL */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {chatOpen ? (
          <Card className="w-[360px] h-[550px] shadow-2xl border flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-xl overflow-hidden">
            <CardHeader className="bg-primary text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-xs font-bold">Compliance Intake Assistant</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl text-sm border shadow-sm">
                    Hi! I'm the compliance intake assistant. Looking to <strong>outsource a requirement</strong> or <strong>join our expert network</strong>? 
                  </div>
                  {messages.map((m, i) => (
                    <div key={i} className={cn(
                      "p-3 rounded-xl text-sm max-w-[90%] shadow-sm",
                      m.role === 'user' ? "ml-auto bg-primary text-white" : "mr-auto bg-white border"
                    )}>
                      {m.content}
                    </div>
                  ))}
                  {loading && <div className="animate-pulse pl-1 text-[10px] font-bold text-muted-foreground">Analyzing...</div>}
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-white">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                  <Input 
                    placeholder="Ask me anything..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="h-10 text-xs"
                  />
                  <Button size="icon" disabled={loading} className="h-10 w-10">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setChatOpen(true)} className="h-16 w-16 rounded-2xl shadow-xl animate-bounce bg-primary">
            <Sparkles className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-white to-secondary/10 border-b overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-[11px] font-black tracking-widest uppercase bg-primary/10 text-primary border-primary/20 rounded-full">
            Managed Compliance Network • AI-Matched Delivery
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-8 text-slate-900 leading-tight">
            HR, Payroll, and Compliance <br />
            <span className="text-primary italic">Delivered with Confidence.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            A managed compliance network for Indian SMEs to connect with verified payroll, labour compliance, and HRMS experts. No open bids, only trusted delivery.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-xl rounded-xl" asChild>
              <Link href="/request/new">Post Requirement <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-xl border-2" asChild>
              <Link href="/signup">Apply as Expert</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ONE PLATFORM - SUMMARY */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 text-slate-900">One Platform. Payroll, HRMS and Compliance Simplified.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Choose your role to access workflows built for regulated payroll, statutory filings and employee operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SME CARD */}
            <Card className="border-2 hover:border-primary/50 transition-all rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group cursor-pointer bg-slate-50/50" onClick={() => scrollToSection('sme-details')}>
              <CardHeader className="pb-8 pt-10 text-center items-center">
                <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">For Businesses</CardTitle>
                <CardDescription className="text-sm mt-2 font-medium">Get expert compliance support without the search effort.</CardDescription>
              </CardHeader>
              <CardFooter className="pb-10 pt-4 mt-auto">
                <Button variant="ghost" className="w-full text-primary font-black text-base hover:bg-transparent">
                  Learn Managed Flow <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* CONSULTANT CARD */}
            <Card className="border-2 hover:border-primary/50 transition-all rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group cursor-pointer bg-slate-50/50" onClick={() => scrollToSection('expert-details')}>
              <CardHeader className="pb-8 pt-10 text-center items-center">
                <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">For Experts</CardTitle>
                <CardDescription className="text-sm mt-2 font-medium">Focus on delivery, let AI handle your sales pipeline.</CardDescription>
              </CardHeader>
              <CardFooter className="pb-10 pt-4 mt-auto">
                <Button variant="ghost" className="w-full text-primary font-black text-base hover:bg-transparent">
                  See Expert Benefits <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* PARTNER CARD */}
            <Card className="border-2 hover:border-amber-500/50 transition-all rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group cursor-pointer bg-slate-50/50" onClick={() => scrollToSection('partner-details')}>
              <CardHeader className="pb-8 pt-10 text-center items-center">
                <div className="bg-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <HeartHandshake className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">For Partners</CardTitle>
                <CardDescription className="text-sm mt-2 font-medium">Monetize your network with zero execution risk.</CardDescription>
              </CardHeader>
              <CardFooter className="pb-10 pt-4 mt-auto">
                <Button variant="ghost" className="w-full text-amber-600 font-black text-base hover:bg-transparent">
                  Partner Growth Model <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* SME DEEP DIVE */}
      <section id="sme-details" className="py-24 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-black tracking-widest uppercase text-[11px] px-3 py-1 rounded-full">For Businesses & SMEs</Badge>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                Get the Right Expert — <span className="text-primary italic">Without Searching Hundreds.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10">
                Describe your requirement once. Our AI matches you with verified specialists and manages the workflow from start to finish.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Describe Your Need", desc: "Use natural language. AI understands compliance and HR without complex forms.", icon: MessageSquare },
                  { title: "Get Smart Matches", desc: "Receive top 3 vetted consultants with high matching skill scores.", icon: Sparkles },
                  { title: "Start Secure Workspace", desc: "Share docs and track tasks in one protected platform.", icon: ShieldCheck },
                  { title: "Complete Compliance", desc: "Get guided execution with expert collaboration.", icon: CheckCircle2 }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-0.5">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl shadow-xl" asChild>
                  <Link href="/request/new">Post Smart Request</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="max-w-md mx-auto relative z-10">
                {smeImg?.imageUrl && (
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-square">
                    <Image 
                      src={smeImg.imageUrl} 
                      alt="AI Workflow Illustration" 
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      data-ai-hint={smeImg.imageHint}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERT DEEP DIVE */}
      <section id="expert-details" className="py-24 bg-slate-900 text-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 hidden lg:block relative">
              <div className="max-w-md mx-auto relative z-10">
                {expertImg?.imageUrl && (
                  <div className="rounded-[3rem] overflow-hidden opacity-90 shadow-2xl border-4 border-white/10 aspect-square">
                    <Image 
                      src={expertImg.imageUrl} 
                      alt="Expert Workspace Illustration" 
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      data-ai-hint={expertImg.imageHint}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-none font-black tracking-widest uppercase text-[11px] px-3 py-1 rounded-full">For Experts & Consultants</Badge>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                Get High-Quality Leads — <span className="text-primary italic">Not Random Noise.</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed font-medium mb-10">
                Stop browsing directories. Receive exclusive, high-intent opportunities matched specifically to your expertise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Exclusive Matches", desc: "No public bidding. Leads are assigned based on your performance.", icon: Target },
                  { title: "AI Proposal Assistant", desc: "Generate professional introductory messages in seconds.", icon: Sparkles },
                  { title: "Managed Execution", desc: "Integrated tools for document delivery and client chat.", icon: LayoutGrid },
                  { title: "Reputation Growth", desc: "Improve your rank with every successful project delivery.", icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-black text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl shadow-2xl bg-white text-primary hover:bg-slate-100" asChild>
                  <Link href="/signup?role=consultant">Join Expert Network</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER DEEP DIVE */}
      <section id="partner-details" className="py-24 bg-amber-50/20 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <Badge className="mb-4 bg-amber-100 text-amber-700 border-none font-black tracking-widest uppercase text-[11px] px-3 py-1 rounded-full">For Channel Partners</Badge>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                Monetize Your Network — <span className="text-amber-600 italic">With Zero Execution Risk.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Secure lead ownership by logging requirements for your clients. We provide the experts and the infrastructure for managed execution.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="max-w-md mx-auto relative">
                {partnerImg?.imageUrl && (
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-amber-100 aspect-square">
                    <Image 
                      src={partnerImg.imageUrl} 
                      alt="Partner Network Illustration" 
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      data-ai-hint={partnerImg.imageHint}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { step: "1", title: "Register as Partner", desc: "Onboard your firm and define your network's core focus.", icon: Building2 },
              { step: "2", title: "Secure Ownership", desc: "Log a requirement to lock lead ownership immediately.", icon: ShieldCheck },
              { step: "3", title: "Receive AI Match", desc: "Our engine identifies the best-suited expert for your client.", icon: Target },
              { step: "4", title: "Managed Delivery", desc: "Track progress through our managed delivery workspace.", icon: Zap }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-amber-200">
                  <step.icon className="h-8 w-8 text-amber-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-8 -right-5 text-amber-200"><ArrowRight className="h-6 w-6" /></div>}
              </div>
            ))}
          </div>

          <div className="mt-16 p-10 bg-slate-900 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div>
              <h3 className="text-2xl font-black mb-1">Ready to grow your advisory footprint?</h3>
              <p className="text-slate-400 text-base font-medium">Join 200+ partners monetizing their trusted networks.</p>
            </div>
            <button className="h-14 px-10 text-lg font-black rounded-xl bg-amber-600 hover:bg-amber-700 shadow-xl transition-colors">
              <Link href="/signup?role=partner">Join as Partner</Link>
            </button>
          </div>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 text-slate-900">Compliance Network Comparison</h2>
            <p className="text-lg text-muted-foreground font-medium">Why the managed compliance model outperforms traditional directories.</p>
          </div>
          <Card className="max-w-5xl mx-auto border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden rounded-[2.5rem]">
            <Table>
              <TableHeader className="bg-slate-900 text-white">
                <TableRow className="hover:bg-slate-900 border-none h-16">
                  <TableHead className="text-white px-8 font-black text-base">Key Differentiators</TableHead>
                  <TableHead className="text-white text-center font-black text-[10px] uppercase tracking-widest opacity-60">Directory</TableHead>
                  <TableHead className="text-white text-center font-black text-[10px] uppercase tracking-widest opacity-60">Open Bid</TableHead>
                  <TableHead className="text-white text-center font-black text-[10px] uppercase tracking-widest bg-primary/20">Managed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {comparisonData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors h-20">
                    <TableCell className="font-black py-4 px-8 text-base text-slate-700 text-left">{row.feature}</TableCell>
                    <TableCell className="text-center">{renderCell(row.directory)}</TableCell>
                    <TableCell className="text-center">{renderCell(row.openBid)}</TableCell>
                    <TableCell className="text-center bg-primary/5">{renderCell(row.opsMarketplace, true)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full scale-150" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight leading-tight">Experience the Managed Future.</h2>
          <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 max-w-2xl mx-auto">
            Stop competing with noise. Join the ecosystem where AI handles the intake, so you can focus on excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-black shadow-2xl rounded-xl" asChild>
              <Link href="/request/new">Post Smart Request</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-black rounded-xl text-white border-white/20 hover:bg-white/10" asChild>
              <Link href="/signup">Join as Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
