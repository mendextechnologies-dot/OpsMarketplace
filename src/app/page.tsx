
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  ArrowUpRight,
  HeartHandshake,
  Coins,
  MessageSquare,
  LayoutGrid
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
import { marketplaceGuide } from "@/ai/flows/marketplace-guide-flow";

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

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* AI CHAT FUNNEL */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {chatOpen ? (
          <Card className="w-[360px] h-[550px] shadow-2xl border flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-xl overflow-hidden">
            <CardHeader className="bg-primary text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-xs font-bold">OpsMarketplace Agent</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl text-sm border shadow-sm">
                    Hi! I'm the marketplace engine. Looking to <strong>outsource a requirement</strong> or <strong>join our expert network</strong>? 
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
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-white to-secondary/10 border-b overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border-primary/20">
            Managed Marketplace • AI-Matched Delivery
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
            Operations Scaled by <br /> 
            <span className="text-primary italic">Expert Intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            A curated engine that matches SMEs with verified experts using proactive AI. No directories. No bidding wars.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl rounded-xl" asChild>
              <Link href="/request/new">Post Requirement <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl border-2" asChild>
              <Link href="/signup">Apply as Expert</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ONE PLATFORM - PERSONA CARDS */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">One Platform. Complete HR & Compliance Execution.</h2>
            <p className="text-muted-foreground">Select your role to see how OpsMarketplace simplifies your workflow.</p>
          </div>

          {/* FLOW DIAGRAM */}
          <div className="max-w-4xl mx-auto mb-20 flex flex-wrap items-center justify-between gap-4 p-8 bg-slate-50 rounded-3xl border">
            {[
              { label: "Describe Need", icon: MessageSquare },
              { label: "AI Match", icon: Sparkles },
              { label: "Start Workspace", icon: LayoutGrid },
              { label: "Complete Compliance", icon: CheckCircle2 }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight">{step.label}</span>
                </div>
                {i < 3 && <ArrowRight className="h-4 w-4 text-slate-300 hidden md:block" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SME */}
            <Card className="border-2 hover:border-primary/50 transition-all rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <CardHeader className="bg-primary/5 pb-8">
                <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">For Businesses</CardTitle>
                <CardDescription className="text-sm">Get expert compliance and HR support without the search effort.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> AI-matched local experts</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Zero cold calls or spam</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Managed delivery workspace</li>
                </ul>
              </CardContent>
              <CardFooter className="pb-8 flex flex-col gap-3">
                <Button className="w-full h-12 rounded-xl" asChild>
                  <Link href="/request/new">Post Request</Link>
                </Button>
                <Link href="/how-it-works/sme" className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2">
                  Learn How It Works <ArrowRight className="h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>

            {/* CONSULTANT */}
            <Card className="border-2 hover:border-primary/50 transition-all rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <CardHeader className="bg-secondary/20 pb-8">
                <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">For Experts</CardTitle>
                <CardDescription className="text-sm">Focus on delivery, let AI handle your sales pipeline.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Exclusive high-intent leads</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> AI proposal assistance</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Structured work delivery</li>
                </ul>
              </CardContent>
              <CardFooter className="pb-8 flex flex-col gap-3">
                <Button className="w-full h-12 rounded-xl" asChild>
                  <Link href="/signup?role=consultant">Join as Expert</Link>
                </Button>
                <Link href="/how-it-works/consultant" className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2">
                  See Expert Benefits <ArrowRight className="h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>

            {/* PARTNER */}
            <Card className="border-2 hover:border-primary/50 transition-all rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <CardHeader className="bg-amber-50 pb-8">
                <div className="bg-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <HeartHandshake className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">For Partners</CardTitle>
                <CardDescription className="text-sm">Monetize your network with zero execution risk.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-amber-500" /> Lead ownership protection</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-amber-500" /> Execution by verified specialists</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-amber-500" /> Transparent referral tracking</li>
                </ul>
              </CardContent>
              <CardFooter className="pb-8 flex flex-col gap-3">
                <Button className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700" asChild>
                  <Link href="/signup?role=partner">Join as Partner</Link>
                </Button>
                <Link href="/how-it-works/partner" className="text-sm font-bold text-amber-600 hover:underline flex items-center justify-center gap-2">
                  Partner Growth Model <ArrowRight className="h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="py-24 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Marketplace Architecture Comparison</h2>
          </div>
          <Card className="max-w-4xl mx-auto border shadow-xl overflow-hidden rounded-3xl">
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
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">Experience the Managed Future.</h2>
          <p className="text-slate-400 text-lg font-medium mb-12 max-w-xl mx-auto">
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
