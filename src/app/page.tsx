"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LayoutGrid,
  FileText,
  Building2,
  Clock,
  Briefcase,
  Handshake,
  TrendingUp,
  ShieldEllipsis,
  BookOpen,
  Gavel,
  Target,
  MessageSquare,
  X,
  Sparkles,
  Loader2,
  Send,
  ExternalLink
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
import { marketplaceGuide, GuideOutput } from "@/ai/flows/marketplace-guide-flow";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, action?: string, url?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const standardPossibilities = [
    "What is PF registration?",
    "How to get Shop Act?",
    "Do I need a Factory Licence?",
    "I want to join as a Partner"
  ];

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
      const response = await marketplaceGuide({
        message: text,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages([...newMessages, { 
        role: 'model', 
        content: response.answer,
        action: response.suggestedAction,
        url: response.redirectUrl
      }]);

      if (response.suggestedAction === 'redirect' && response.redirectUrl) {
        // We can auto-redirect or let the user click. Let's show a button for better UX.
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'model', content: "I'm having trouble connecting right now. Please try again or submit a request directly." }]);
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
      <div className="flex flex-col items-center gap-1.5 py-4">
        <Icon className={cn("h-5 w-5", colorClass)} />
        {data.text && <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{data.text}</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* AGENTIC AI CHAT WINDOW */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {chatOpen ? (
          <Card className="w-[380px] h-[580px] shadow-2xl border-2 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-primary text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div>
                  <CardTitle className="text-sm font-bold">OpsMarketplace Agent</CardTitle>
                  <p className="text-[10px] opacity-80">Autonomous Assistant • Online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg text-sm border-l-4 border-primary">
                    <p className="font-bold text-primary text-[10px] mb-1 uppercase tracking-wider">Agent Intelligence</p>
                    I can answer questions, create service requests directly, or initiate your onboarding. How can I help you today?
                  </div>
                  
                  {messages.length === 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Common Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {standardPossibilities.map((pos, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSendMessage(pos)}
                            className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full transition-colors font-medium"
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className="space-y-2">
                      <div className={cn(
                        "p-3 rounded-lg text-sm max-w-[90%] shadow-sm",
                        m.role === 'user' ? "ml-auto bg-primary text-white rounded-br-none" : "mr-auto bg-muted border rounded-bl-none"
                      )}>
                        {m.content}
                      </div>
                      {m.action === 'redirect' && m.url && (
                        <div className="flex justify-start">
                          <Button size="sm" variant="outline" className="text-[10px] h-8 gap-2 border-primary text-primary" asChild>
                            <Link href={m.url}>
                              Complete Registration <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse pl-1">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-medium">Processing intent...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-muted/30">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Describe your need or goal..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-white"
                  />
                  <Button size="icon" disabled={loading} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setChatOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl animate-bounce hover:animate-none flex flex-col gap-0.5"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-[8px] font-bold uppercase tracking-tighter">Ask AI</span>
          </Button>
        )}
      </div>

      {/* SECTION 1 — HERO */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/10 border-b overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20">
            Agentic Marketplace • Powered by Gemini 2.5
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
            Operations Simplified by <br /> 
            <span className="text-primary underline decoration-primary/20 underline-offset-8">Intelligent Agents.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            The first multi-sided marketplace for compliance, HR, and payroll where AI agents manage the intake, matching, and coordination. 
            Experience the future of B2B service delivery.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl" asChild>
              <Link href="/request/new">
                Start Request Flow <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
              <Link href="/signup">Join Expert Network</Link>
            </Button>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Verified Experts</span></div>
            <div className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Partner-Driven Model</span></div>
            <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Agentic Matching</span></div>
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> <span className="text-sm font-bold">Structured Workflow</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE THREE MODELS DIFFERENTIATION */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">A Modern Alternative to Lead Lists</h2>
            <p className="text-muted-foreground text-lg">We've replaced the chaos of directories and the race-to-the-bottom of open bidding with an agentic, managed ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MODEL 1: DIRECTORY */}
            <Card className="border-2 opacity-60 grayscale hover:grayscale-0 transition-all">
              <CardHeader>
                <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle>1. Directory Model</CardTitle>
                <CardDescription>e.g. IndiaMART, JustDial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-bold uppercase mb-2 tracking-widest opacity-60">The Workflow</p>
                  <p className="text-sm">Search list → Contact many → Filter spam</p>
                </div>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> High spam & Low intent</li>
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> Constant price wars</li>
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> No platform verification</li>
                </ul>
              </CardContent>
            </Card>

            {/* MODEL 2: OPEN BID */}
            <Card className="border-2 opacity-60 grayscale hover:grayscale-0 transition-all">
              <CardHeader>
                <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Gavel className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle>2. Open Bid Model</CardTitle>
                <CardDescription>e.g. Upwork, Freelancer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-bold uppercase mb-2 tracking-widest opacity-60">The Workflow</p>
                  <p className="text-sm">Post need → Receive 50 bids → Hire cheapest</p>
                </div>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> Race-to-the-bottom pricing</li>
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> Extreme profile fatigue</li>
                  <li className="flex gap-2"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> Not for high-stakes compliance</li>
                </ul>
              </CardContent>
            </Card>

            {/* MODEL 3: OPSMARKETPLACE (THE WINNER) */}
            <Card className="border-primary border-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                AGENTIC MODEL
              </div>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">3. Managed Model</CardTitle>
                <CardDescription className="text-primary/70">OpsMarketplace Premium</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs font-bold uppercase mb-2 tracking-widest text-primary">The Workflow</p>
                  <p className="text-sm font-semibold">Describe intent → Agent Match → Verified Delivery</p>
                </div>
                <ul className="text-xs space-y-2">
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> High pricing power for experts</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Agent-verified regional experts</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Protected & Verified ownership</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3 — MULTI-SIDED POSITIONING (TABS) */}
      <section className="py-24 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Ecosystem Intelligence</h2>
            <p className="text-muted-foreground mt-2">Specialized tools for every stakeholder in the operational value chain.</p>
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
                    <h3 className="text-3xl font-extrabold">Outsource Your Compliance Overhead</h3>
                    <p className="text-muted-foreground">Describe your need to our Agent. We'll identify the best-fit regional specialist and handle the introduction.</p>
                    <ul className="space-y-4">
                      {[
                        "Submit requirements via AI Chat or Flow",
                        "Matched with state-verified specialists",
                        "No cold calls or vendor spam",
                        "End-to-end progress transparency"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/request/new">Get Started Now</Link>
                    </Button>
                  </div>
                  <div className="bg-primary/5 p-10 flex items-center justify-center">
                    <div className="space-y-4 w-full">
                       <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
                         <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Building2 className="h-5 w-5" /></div>
                         <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">AI Extraction</p>
                            <p className="font-bold">PF Registration (Pune)</p>
                         </div>
                       </div>
                       <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 opacity-60">
                         <div className="bg-green-100 p-2 rounded-lg text-green-600"><Sparkles className="h-5 w-5" /></div>
                         <p className="font-bold">Agent Matched Expert</p>
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
                    <h3 className="text-3xl font-extrabold">High-Intent Leads, Hand-Delivered</h3>
                    <p className="text-muted-foreground">Stop searching. Our agent identifies requirements that match your specific regional and industry expertise.</p>
                    <ul className="space-y-4">
                      {[
                        "AI-ranked operational opportunities",
                        "Automated proposal drafting assistant",
                        "Verified state-wise jurisdiction matching",
                        "Premium value-driven pricing model"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/signup?role=consultant">Join Expert Network</Link>
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-10 flex items-center justify-center text-white">
                    <div className="space-y-6 w-full">
                       <p className="text-xs uppercase font-bold text-slate-400">Agent Console</p>
                       <div className="space-y-2">
                          <div className="h-1 bg-primary w-full rounded-full" />
                          <p className="text-2xl font-bold">Matched Lead: Labour Law Audit</p>
                          <p className="text-sm text-slate-400">Mumbai • AI Score 9.4/10</p>
                       </div>
                       <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">Accept Opportunity</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="mt-10">
              <Card className="border-none shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-10 space-y-6">
                    <h3 className="text-3xl font-extrabold">Activate Your Business Network</h3>
                    <p className="text-muted-foreground">Bring high-stakes operational opportunities to the platform. Our agent manages the matching; you maintain the relationship.</p>
                    <ul className="space-y-4">
                      {[
                        "Secured lead ownership via Unique Key",
                        "Simplified 'Log and Forget' flow",
                        "Real-time status tracking via Dashboard",
                        "Incentive-ready professional ecosystem"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-primary" /> {txt}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full sm:w-auto h-12" asChild>
                      <Link href="/signup?role=partner">Register as Partner</Link>
                    </Button>
                  </div>
                  <div className="bg-primary p-10 flex items-center justify-center text-white">
                    <div className="text-center space-y-6">
                       <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="h-10 w-10 text-white" />
                       </div>
                       <h4 className="text-2xl font-bold">Locked Lead Registry</h4>
                       <p className="text-sm text-white/80">Agent-verified ownership prevents duplicate claims.</p>
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
            <h2 className="text-3xl font-bold tracking-tight">The Agentic Workflow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Intake", desc: "Agent extracts structured intent from raw requirements.", icon: Sparkles },
              { title: "Matching", desc: "Our engine identifies the highest-ranked regional expert.", icon: Zap },
              { title: "Execution", desc: "Consultant handles delivery with AI-assisted responses.", icon: Users },
              { title: "Completion", desc: "Structured handover and feedback loop.", icon: CheckCircle2 },
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
            <h2 className="text-3xl font-bold tracking-tight">Comparison Framework</h2>
            <p className="text-muted-foreground mt-2">Why professional operators choose our agentic model.</p>
          </div>
          <Card className="max-w-5xl mx-auto border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900 text-white">
                <TableRow className="hover:bg-slate-900 border-none">
                  <TableHead className="text-white h-14">Core Capabilities</TableHead>
                  <TableHead className="text-white text-center">Directory Model</TableHead>
                  <TableHead className="text-white text-center">Open Bid Model</TableHead>
                  <TableHead className="text-white text-center font-bold bg-primary/20">Agentic Model</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {comparisonData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium py-6 text-sm">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {renderCell(row.directory)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderCell(row.openBid)}
                    </TableCell>
                    <TableCell className="text-center bg-primary/5">
                      {renderCell(row.opsMarketplace, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Experience the Agentic Future.</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
            Join the ecosystem where AI handles the complexity, so you can focus on the results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link href="/request/new">Post a Smart Request</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg text-white border-white/20 hover:bg-white/10" asChild>
              <Link href="/signup">Apply as Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
