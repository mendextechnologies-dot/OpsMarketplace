"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Users, 
  LayoutDashboard,
  Loader2,
  Activity,
  PlusCircle,
  Zap,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldEllipsis,
  Coins,
  ShieldCheck,
  Building2,
  Handshake,
  TrendingUp,
  Search,
  History,
  Briefcase,
  Globe,
  Target,
  ArrowRight,
  Sparkles,
  Calendar,
  Mail,
  Settings,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getCategoryName, getServiceName } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'partners' | 'pipeline' | 'conflicts' | 'templates';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingConsultant, setViewingConsultant] = useState<any>(null);
  const [viewingPartner, setViewingPartner] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    if (!profile || profile.role !== 'admin') return;
    setLoading(true);
    try {
      const [reqSnap, consSnap, partnerSnap, assignSnap, tempSnap] = await Promise.all([
        getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "consultantProfiles")),
        getDocs(collection(db, "partnerProfiles")),
        getDocs(query(collection(db, "leadAssignments"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "emailTemplates"))
      ]);

      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPartners(partnerSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTemplates(tempSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      toast({ title: "Sync Failed", description: "Could not sync marketplace data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') fetchData();
  }, [profile, authLoading]);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const { id, ...data } = editingTemplate;
      if (id) {
        await updateDoc(doc(db, "emailTemplates", id), data);
      } else {
        await addDoc(collection(db, "emailTemplates"), data);
      }
      toast({ title: "Template Saved", description: "Email communication updated successfully." });
      setEditingTemplate(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSeedTemplates = async () => {
    setSeeding(true);
    try {
      const defaultTemplates = [
        { name: "Welcome SME", subject: "Welcome to OpsMarketplace, {{name}}!", roleType: "sme", html: "<div style='font-family:sans-serif; padding:20px;'><h2>Welcome {{name}}!</h2><p>Your SME account is active. Start posting requirements today.</p></div>" },
        { name: "Welcome Consultant", subject: "Expert Console Activated: Welcome {{name}}", roleType: "consultant", html: "<div style='font-family:sans-serif; padding:20px;'><h2>Welcome Expert {{name}}!</h2><p>You are now part of our verified network. Your opportunities will appear in the Expert Console.</p></div>" },
        { name: "New Lead Notification", subject: "New Opportunity: {{companyName}}", roleType: "consultant", html: "<div style='font-family:sans-serif; padding:20px;'><h2>Hi {{consultantName}},</h2><p>A new requirement for <strong>{{companyName}}</strong> matches your profile.</p><p>Service: {{serviceCategory}}</p></div>" },
        { name: "Welcome Partner", subject: "Partner Console Ready", roleType: "partner", html: "<div style='font-family:sans-serif; padding:20px;'><h2>Partner Onboarding Complete</h2><p>Start monetizing your network today.</p></div>" }
      ];

      for (const temp of defaultTemplates) {
        // Check if template with this name already exists
        const q = query(collection(db, "emailTemplates"), where("name", "==", temp.name));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(collection(db, "emailTemplates"), { ...temp, createdAt: serverTimestamp() });
        }
      }
      toast({ title: "System Seeded", description: "Standard communication templates have been verified/added." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Seed Failed", description: error.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const pieData = [
    { name: 'Full-time', value: 70, color: 'hsl(var(--primary))' },
    { name: 'Contract', value: 20, color: '#f97316' },
    { name: 'Part-time', value: 10, color: '#3b82f6' },
  ];

  const conflicts = requests.filter(r => r.duplicateFlag === true);

  const NavItem = ({ view, icon: Icon, label, count }: { view: AdminView, icon: any, label: string, count?: number }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl",
        activeView === view 
          ? "bg-primary text-white shadow-lg" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="bg-white/20 text-white border-none ml-1">
          {count}
        </Badge>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-20">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Super Admin Console 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">Platform intelligence and management control.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold bg-white border-none shadow-sm h-11" onClick={fetchData}>
              <History className="h-4 w-4 mr-2" /> Refresh
            </History>
            <Button asChild className="rounded-xl font-bold h-11 shadow-lg bg-primary hover:bg-primary/90">
              <Link href="/admin/create-lead">
                <PlusCircle className="h-4 w-4 mr-2" /> Log Requirement
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border overflow-x-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem view="requests" icon={FileText} label="SME Requests" count={requests.length} />
          <NavItem view="consultants" icon={Users} label="Consultants" count={consultants.length} />
          <NavItem view="partners" icon={Handshake} label="Partners" count={partners.length} />
          <NavItem view="pipeline" icon={Activity} label="Live Pipeline" />
          <NavItem view="conflicts" icon={AlertTriangle} label="Conflicts" count={conflicts.length} />
          <NavItem view="templates" icon={Mail} label="Communications" />
        </div>

        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "SME Requests", val: requests.length, trend: "+12%", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Network Health", val: "94%", trend: "+2%", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/5" },
                  { label: "Active Pipeline", val: assignments.length, trend: "Stable", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl", stat.bg)}>
                          <stat.icon className={cn("h-5 w-5", stat.color)} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-green-100 text-green-600 bg-green-50">
                          {stat.trend}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-3xl font-black mt-1 text-slate-900">{stat.val}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-slate-900">Marketplace Velocity</CardTitle>
                  <CardDescription className="text-xs font-medium">Growth in service requests over time.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black text-slate-900">Recent Expert Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-none">
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider">Expert</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-center">Completion</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultants.slice(0, 4).map((cons) => (
                        <TableRow key={cons.id} className="border-none hover:bg-slate-50 transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 rounded-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cons.name}`} />
                                <AvatarFallback>{cons.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-sm text-slate-900">{cons.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">{cons.companyName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] rounded-lg">
                              ACTIVE
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-black text-slate-700">98%</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingConsultant(cons)}>
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-slate-900">Network Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 w-full mt-4">
                    {pieData.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-sm font-bold text-slate-700">{p.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{p.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-primary text-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6" />
                  <h4 className="font-black text-xl tracking-tight">Growth Playbook</h4>
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed mb-6">
                  Standard operating guide for onboarding partners and generating leads.
                </p>
                <Button asChild variant="secondary" className="w-full rounded-xl font-black py-6 bg-white text-primary hover:bg-white/90 border-none">
                  <Link href="/growth-playbook">Open Playbook</Link>
                </Button>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'templates' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Communication Templates</h2>
                <p className="text-muted-foreground text-sm">Manage automated emails. Use {{name}}, {{companyName}}, {{serviceCategory}} placeholders.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSeedTemplates} disabled={seeding}>
                  {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                  Seed System Defaults
                </Button>
                <Button onClick={() => setEditingTemplate({ name: "", subject: "", html: "", roleType: "general" })}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Template
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((temp) => (
                <Card key={temp.id} className="border-none shadow-sm rounded-3xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase">
                        {temp.roleType}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(temp)}>
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg font-bold mt-2">{temp.name}</CardTitle>
                    <CardDescription className="text-xs font-medium italic">"{temp.subject}"</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200 overflow-hidden text-[10px] p-2 text-slate-400">
                      {temp.html}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templates.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
                  <Mail className="h-10 w-10 mx-auto opacity-10 mb-4" />
                  <p className="text-muted-foreground font-medium">No custom templates yet. Click "Seed System Defaults" to start.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'requests' && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">SME Service Requests</CardTitle>
                <CardDescription className="text-sm font-medium mt-1">Managing the demand side of the ecosystem.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none h-14">
                    <TableHead className="px-8 font-black text-[11px] uppercase tracking-wider">Client & Service</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider">Location</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider text-center">AI Quality</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-right px-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className="border-none hover:bg-slate-50 transition-colors h-20">
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                            {req.companyName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{req.companyName}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{getCategoryName(req.categoryId)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {req.city}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary">
                          {req.ai_metadata?.quality_score || '0'} / 10
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "capitalize text-[10px] font-black rounded-lg px-3",
                          req.status === 'new' ? "bg-orange-50 text-orange-600 border-none" : "bg-blue-50 text-blue-600 border-none"
                        )}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold">
                          <Link href={`/request/${req.id}`}>Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'consultants' && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-black text-slate-900">Verified Expert Network</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">Managing the specialist supply side.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none h-14">
                    <TableHead className="px-8 font-black text-[11px] uppercase tracking-wider">Expert / Firm</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider">Specialization</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider text-center">Performance</TableHead>
                    <TableHead className="text-right px-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((cons) => (
                    <TableRow key={cons.id} className="border-none hover:bg-slate-50 transition-colors h-20">
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cons.name}`} />
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{cons.name}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{cons.companyName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {(cons.servicesOffered || []).slice(0, 2).map((sId: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[8px] font-black border-slate-200">
                              {getServiceName(sId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-black text-slate-900">{cons.completionRate || 100}% Success</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">{cons.avgResponseTime || 45}m Response</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 hover:bg-slate-50" onClick={() => setViewingConsultant(cons)}>
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'partners' && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-black text-slate-900">Channel Partner Registry</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">Managing lead-generating nodes in the ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none h-14">
                    <TableHead className="px-8 font-black text-[11px] uppercase tracking-wider">Partner / Firm</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider">City</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider text-center">Focus</TableHead>
                    <TableHead className="text-right px-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} className="border-none hover:bg-slate-50 transition-colors h-20">
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center font-black">
                            {partner.partnerName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{partner.partnerName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">{partner.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">{partner.city}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                          {(partner.servicesFocus || []).map((sId: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[8px] font-black border-slate-200">
                              {getCategoryName(sId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setViewingPartner(partner)}>
                          Reports
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'pipeline' && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-black text-slate-900">Marketplace Pipeline</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">Tracking movement of live service deals.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none h-14">
                    <TableHead className="px-8 font-black text-[11px] uppercase tracking-wider">Company</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider">Expert Assigned</TableHead>
                    <TableHead className="font-black text-[11px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right px-8">Match Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asgn) => {
                    const req = requests.find(r => r.id === asgn.requestId);
                    const cons = consultants.find(c => c.id === asgn.consultantId);
                    return (
                      <TableRow key={asgn.id} className="border-none h-16">
                        <TableCell className="px-8 font-bold">{req?.companyName || 'Unknown Company'}</TableCell>
                        <TableCell className="font-bold text-primary">{cons?.name || 'Expert'}</TableCell>
                        <TableCell>
                           <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[10px] uppercase">{asgn.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right px-8 text-xs font-medium text-muted-foreground">
                          {asgn.createdAt ? new Date(asgn.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Email Template Editor</DialogTitle>
            <DialogDescription>Modify the content of automated system communications.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={editingTemplate?.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} placeholder="e.g. Welcome SME" required />
              </div>
              <div className="space-y-2">
                <Label>Role Context</Label>
                <Input value={editingTemplate?.roleType} onChange={e => setEditingTemplate({...editingTemplate, roleType: e.target.value})} placeholder="sme, consultant, partner" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input value={editingTemplate?.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})} placeholder="Welcome to OpsMarketplace, {{name}}!" required />
            </div>
            <div className="space-y-2">
              <Label>HTML Body</Label>
              <Textarea 
                value={editingTemplate?.html} 
                onChange={e => setEditingTemplate({...editingTemplate, html: e.target.value})} 
                className="min-h-[250px] font-mono text-xs" 
                placeholder="<div>Hello {{name}}, welcome...</div>" 
                required 
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              <Button type="submit">Save Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingConsultant} onOpenChange={() => setViewingConsultant(null)}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white relative">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 rounded-2xl border-4 border-white/20 shadow-xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingConsultant?.name}`} />
              </Avatar>
              <div>
                <h3 className="text-2xl font-black">{viewingConsultant?.name}</h3>
                <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest mt-1">
                  {viewingConsultant?.companyName} • {viewingConsultant?.city}
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-8 bg-white">
            <div className="space-y-3">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Professional Identity</p>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 italic text-slate-700 text-sm leading-relaxed">
                "{viewingConsultant?.description}"
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Core Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {viewingConsultant?.servicesOffered?.map((sId: any, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] font-black py-1.5 px-3 rounded-xl">
                      {getServiceName(sId)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Regional Focus</p>
                <div className="flex flex-wrap gap-2">
                  {viewingConsultant?.statesCovered?.map((state: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px] font-bold border-slate-200 rounded-xl px-3 py-1.5">
                      <Globe className="h-2 w-2 mr-1" /> {state}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingPartner} onOpenChange={() => setViewingPartner(null)}>
        <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-amber-500 p-8 text-white">
            <h3 className="text-2xl font-black">{viewingPartner?.partnerName}</h3>
            <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest mt-1">
              Channel Partner • {viewingPartner?.city}
            </p>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total Referrals</p>
                <p className="text-2xl font-black">{requests.filter(r => r.leadOwnerId === viewingPartner?.id).length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Status</p>
                <p className="text-2xl font-black text-green-600 uppercase">{viewingPartner?.status || 'Active'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Service Focus</p>
              <div className="flex flex-wrap gap-2">
                {viewingPartner?.servicesFocus?.map((sId: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 border-none font-black px-3 py-1.5 rounded-xl">
                    {getCategoryName(sId)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
