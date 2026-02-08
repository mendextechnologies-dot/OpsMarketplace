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
  ExternalLink,
  TrendingDown,
  ArrowUpRight,
  HeartHandshake,
  Coins
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

  const conversionTriggers = [
    "I need a service request",
    "What's the cost of PF?",
    "How fast can I get an expert?",
    "I want to join the network"
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
    } catch (error) {
      setMessages([...newMessages, { role: 'model', content: "Our matching engine is experiencing high demand. Please try again or submit a request directly via the form." }]);
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

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* HIGH-CONVERSION AI CHAT FUNNEL */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {chatOpen ? (
          <Card className="w-[360px] h-[550px] shadow-2xl border flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-xl overflow-hidden">
            <CardHeader className="bg-primary text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-5 w-5" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-primary animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold">OpsMarketplace Agent</CardTitle>
                  <p className="text-[9px] opacity-80 flex items-center gap-1">
                    <Zap className="h-2 w-2 fill-white" /> Ready to Match
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl text-sm border shadow-sm">
                    <p className="font-bold text-primary text-[10px] mb-1 uppercase tracking-widest flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5" /> Intelligent Intake
                    </p>
                    Hi! I'm the marketplace engine. Are you looking to <strong>outsource a requirement</strong> or <strong>join our expert network</strong>? 
                  </div>
                  
                  {messages.length === 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Start</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {conversionTriggers.map((pos, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSendMessage(pos)}
                            className="text-left text-xs bg-white hover:bg-primary/5 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-lg transition-all shadow-sm hover:border-primary/30 group flex justify-between items-center"
                          >
                            {pos}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className="space-y-2">
                      <div className={cn(
                        "p-3 rounded-xl text-sm max-w-[90%] shadow-sm leading-relaxed",
                        m.role === 'user' ? "ml-auto bg-primary text-white rounded-br-none" : "mr-auto bg-white border rounded-bl-none text-slate-800"
                      )}>
                        {m.content}
                      </div>
                      {m.action === 'redirect' && m.url && (
                        <div className="flex justify-start">
                          <Button size="sm" className="text-xs h-9 gap-2 shadow-md px-5 rounded-full" asChild>
                            <Link href={m.url}>
                              Complete Registration <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse pl-1">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">AI Analyzing...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-white">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Ask me anything..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-slate-50 border-none h-10 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-xs"
                  />
                  <Button size="icon" disabled={loading} className="shrink-0 h-10 w-10 rounded-lg">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setChatOpen(true)}
            className="h-16 w-16 rounded-2xl shadow-xl animate-bounce hover:animate-none flex flex-col gap-1 transition-all bg-primary hover:bg-primary/90"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-[8px] font-extrabold uppercase tracking-tighter">Match Me</span>
          </Button>
        )}
      </div>

      {/* SECTION 1 — HERO */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/10 border-b overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border-primary/20">
            Managed Marketplace • AI-Matched Delivery
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Operations Scaled by <br /> 
            <span className="text-primary italic">Expert Intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            No directories. No bidding wars. Just a curated engine that matches SMEs with verified experts using proactive AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl rounded-xl" asChild>
              <Link href="/request/new">
                Post Requirement <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl border-2" asChild>
              <Link href="/signup">Apply as Expert</Link>
            </Button>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> <span className="text-xs font-bold uppercase tracking-tight">State-Verified</span></div>
            <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> <span className="text-xs font-bold uppercase tracking-tight">Instant Intent</span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> <span className="text-xs font-bold uppercase tracking-tight">Curated Network</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — ROLE-BASED VALUE PROPS */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">How We Serve the Ecosystem</h2>
            <p className="text-muted-foreground text-base">A balanced marketplace built for quality and trust.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 pb-6">
                <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">For SMEs</CardTitle>
                <CardDescription className="text-sm">Operational excellence without the search effort.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> AI-matched local experts
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Zero cold calls or spam
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> High-quality requirement builder
                  </li>
                </ul>
                <Button className="w-full mt-4 h-11" variant="outline" asChild>
                  <Link href="/signup?role=sme">Post as SME</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/20 pb-6">
                <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">For Consultants</CardTitle>
                <CardDescription className="text-sm">Focus on delivery, let AI handle the sales pipeline.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Exclusive high-intent leads
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> AI proposal drafts
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Protected pricing power
                  </li>
                </ul>
                <Button className="w-full mt-4 h-11" variant="outline" asChild>
                  <Link href="/signup?role=consultant">Join as Expert</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="bg-amber-50 pb-6">
                <div className="bg-amber-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <HeartHandshake className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">For Partners</CardTitle>
                <CardDescription className="text-sm">Monetize your network with zero execution risk.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" /> Lead ownership protection
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" /> Execution by verified experts
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" /> Transparent referral tracking
                  </li>
                </ul>
                <Button className="w-full mt-4 h-11" variant="outline" asChild>
                  <Link href="/signup?role=partner">Join as Partner</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE THREE MODELS DIFFERENTIATION */}
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">A Smarter Model for Higher Stakes</h2>
            <p className="text-slate-500 text-lg font-medium">Eliminating the friction of traditional lead lists with an agent-managed ecosystem built for speed and quality.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MODEL 1: DIRECTORY */}
            <Card className="border opacity-70 grayscale hover:grayscale-0 transition-all rounded-2xl bg-white/50">
              <CardHeader>
                <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-slate-500" />
                </div>
                <CardTitle className="text-lg">1. Directory Model</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider">The "Lead Mall" Approach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                  <p className="font-bold opacity-60 mb-1">THE WORKFLOW</p>
                  <p className="font-semibold italic">Search → Cold Call → Filter Spam</p>
                </div>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> Zero intent verification</li>
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> Shared leads cause fatigue</li>
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> No platform accountability</li>
                </ul>
              </CardContent>
            </Card>

            {/* MODEL 2: OPEN BID */}
            <Card className="border opacity-70 grayscale hover:grayscale-0 transition-all rounded-2xl bg-white/50">
              <CardHeader>
                <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Gavel className="h-6 w-6 text-slate-500" />
                </div>
                <CardTitle className="text-lg">2. Open Bid Model</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider">The "Race to Bottom"</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                  <p className="font-bold opacity-60 mb-1">THE WORKFLOW</p>
                  <p className="font-semibold italic">Post → Manage 50 Bids → Compromise</p>
                </div>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> Price over quality</li>
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> High noise, low retention</li>
                  <li className="flex gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0" /> Fragile compliance outcomes</li>
                </ul>
              </CardContent>
            </Card>

            {/* MODEL 3: OPSMARKETPLACE (THE WINNER) */}
            <Card className="border-primary border-2 shadow-lg relative overflow-hidden rounded-2xl bg-white">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-black px-3 py-1 rounded-bl-lg">
                PREMIUM
              </div>
              <CardHeader className="pb-3">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary font-bold">3. Managed Model</CardTitle>
                <CardDescription className="text-sm text-primary/70 font-semibold">OpsMarketplace Standard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs">
                  <p className="font-black text-primary mb-1">THE WORKFLOW</p>
                  <p className="font-bold">Intent Capture → Match → Delivery</p>
                </div>
                <ul className="space-y-3 text-sm font-semibold text-slate-800">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> High Pricing Power for Experts</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> AI-Verified Intent Qualification</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Exclusive Lead Ownership</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4 — ZERO FRICTION PRICING */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-10 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5"><Coins className="h-48 w-48 -mr-12 -mt-12" /></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <Badge className="mb-4 bg-primary text-white border-none px-4 py-1 text-[10px]">Value-Driven Model</Badge>
              <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 tracking-tight">Zero Friction. <span className="text-primary italic">Maximum Value.</span></h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">SMEs shouldn't pay to find help. Our platform is free for SMEs to post requirements and get matched.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl text-left">
                  <p className="text-primary font-bold text-base mb-1">Free for SMEs</p>
                  <p className="text-xs text-slate-400">Post unlimited requirements and choose the best fit without any platform fee.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl text-left">
                  <p className="text-primary font-bold text-base mb-1">Rewarding for Experts</p>
                  <p className="text-xs text-slate-400">Low-cost, high-intent leads. No commission cuts. Pay only for what you value.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — COMPARISON TABLE */}
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Marketplace Architecture Comparison</h2>
          </div>
          <Card className="max-w-4xl mx-auto border shadow-xl overflow-hidden rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-900 text-white">
                <TableRow className="hover:bg-slate-900 border-none h-14">
                  <TableHead className="text-white px-6 font-bold text-sm">Key Differentiators</TableHead>
                  <TableHead className="text-white text-center font-bold text-xs uppercase tracking-wider">Directory</TableHead>
                  <TableHead className="text-white text-center font-bold text-xs uppercase tracking-wider">Open Bid</TableHead>
                  <TableHead className="text-white text-center font-bold text-xs uppercase tracking-wider bg-primary/20">Managed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {comparisonData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-semibold py-6 px-6 text-sm text-slate-700">{row.feature}</TableCell>
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

      {/* FINAL CTA */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">Experience the Managed Future.</h2>
          <p className="text-slate-400 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed">
            Stop competing with noise. Join the ecosystem where AI handles the intake, so you can focus on excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-2xl rounded-xl" asChild>
              <Link href="/request/new">Post Smart Request</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-xl text-white border-white/20 hover:bg-white/10" asChild>
              <Link href="/signup">Join as Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
