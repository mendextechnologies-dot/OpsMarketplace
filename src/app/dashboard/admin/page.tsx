
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  Trash2,
  BookOpen,
  Sparkles,
  TrendingUp,
  ShieldEllipsis,
  Coins,
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowRight,
  Handshake,
  BarChart3,
  Search,
  History,
  Briefcase,
  Globe,
  PieChart,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getServiceNames, getCategoryName, getServiceName } from "@/lib/constants";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'partners' | 'pipeline' | 'conflicts' | 'risk';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingConsultant, setViewingConsultant] = useState<any>(null);
  const [viewingPartner, setViewingPartner] = useState<any>(null);

  const fetchData = async () => {
    if (!profile || profile.role !== 'admin') return;
    setLoading(true);
    try {
      const [reqSnap, consSnap, partnerSnap, assignSnap] = await Promise.all([
        getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "consultantProfiles")),
        getDocs(collection(db, "partnerProfiles")),
        getDocs(query(collection(db, "leadAssignments"), orderBy("createdAt", "desc")))
      ]);

      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPartners(partnerSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      console.error("Admin Sync Error:", error);
      toast({
        title: "Sync Failed",
        description: "Could not sync marketplace data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      fetchData();
    }
  }, [profile, authLoading]);

  const handleResolveConflict = async (reqId: string, action: 'keep' | 'reject') => {
    try {
      if (action === 'reject') {
        await deleteDoc(doc(db, "serviceRequests", reqId));
        toast({ title: "Lead Rejected", description: "Conflict resolved by removing duplicate lead." });
      } else {
        await updateDoc(doc(db, "serviceRequests", reqId), { duplicateFlag: false });
        toast({ title: "Lead Verified", description: "Lead flagged as verified and duplicate warning removed." });
      }
      fetchData();
    } catch (error: any) {
      toast({ title: "Resolution Failed", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const conflicts = requests.filter(r => r.duplicateFlag === true);
  const riskyConsultants = consultants.filter(c => (c.ai_risk_score || 0) > 60);
  const avgQualityScore = requests.length > 0 
    ? (requests.reduce((acc, r) => acc + (r.ai_metadata?.quality_score || 0), 0) / requests.length).toFixed(1)
    : "0";

  const NavItem = ({ view, icon: Icon, label, count }: { view: AdminView, icon: any, label: string, count?: number }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors rounded-lg",
        activeView === view 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant={view === 'conflicts' || view === 'risk' ? 'destructive' : 'secondary'} className="h-5 px-1.5 text-[10px]">
          {count}
        </Badge>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 border-r bg-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2 text-primary">
          <Zap className="h-6 w-6 fill-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">SuperAdmin</h1>
        </div>

        <div className="space-y-1 flex-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Insights Dashboard" />
          <NavItem view="requests" icon={FileText} label="Service Requests" count={requests.length} />
          <NavItem view="consultants" icon={Users} label="Consultant Network" count={consultants.length} />
          <NavItem view="partners" icon={Handshake} label="Channel Partners" count={partners.length} />
          <NavItem view="pipeline" icon={Activity} label="Active Pipeline" />
          <div className="pt-4 pb-2 px-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Integrity</p>
          </div>
          <NavItem view="conflicts" icon={AlertTriangle} label="Lead Conflicts" count={conflicts.length} />
          <NavItem view="risk" icon={ShieldEllipsis} label="Risk Monitor" count={riskyConsultants.length} />
        </div>

        <div className="pt-6 border-t space-y-2">
          <Button asChild variant="default" className="w-full justify-start gap-2 shadow-sm">
            <Link href="/admin/create-lead">
              <PlusCircle className="h-4 w-4" /> New Outbound Lead
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5">
            <Link href="/growth-playbook">
              <BookOpen className="h-4 w-4" /> Growth Playbook
            </Link>
          </Button>
          <div className="mt-6 px-2">
            <p className="text-xs font-bold">{profile?.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Platform Architect</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight capitalize">
              {activeView === 'dashboard' ? 'Marketplace Insights' : 
               activeView === 'conflicts' ? 'Ownership Resolution' : 
               activeView === 'risk' ? 'Integrity Management' : activeView}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Real-time supervision of the AI-curated ecosystem.</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <History className="h-3 w-3" /> Refresh Snapshot
          </Button>
        </header>

        {activeView === 'dashboard' && (
          <div className="space-y-10">
            {/* TOP STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: "SME Requests", val: requests.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Experts", val: consultants.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Partners", val: partners.length, icon: Handshake, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Conflicts", val: conflicts.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
                { label: "Risk Score", val: avgQualityScore, icon: Sparkles, color: "text-primary", bg: "bg-primary/5" },
              ].map((stat, i) => (
                <Card key={i} className={cn("border-none shadow-sm", stat.bg)}>
                  <CardContent className="pt-6">
                    <stat.icon className={cn("h-4 w-4 mb-3", stat.color)} />
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{stat.label}</p>
                    <h3 className="text-2xl font-black mt-1">{stat.val}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PLATFORM HEALTH CARD */}
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> AI Platform Health
                  </CardTitle>
                  <CardDescription>Synthesized metrics from the intake and integrity engines.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Network Compliance</p>
                      <h4 className="text-4xl font-black text-primary">{(100 - (riskyConsultants.length / (consultants.length || 1) * 100)).toFixed(0)}%</h4>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Average Lead Quality</p>
                        <p className="text-xl font-bold">{avgQualityScore} / 10</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">OPTIMAL</Badge>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(parseFloat(avgQualityScore) * 10)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PRICING SIGNALS CARD */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-600" /> Market Pricing Signals
                  </CardTitle>
                  <CardDescription>Learned market ranges from AI intelligence.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { cat: "PF Registration", loc: "Pune", range: "₹2,500 - ₹5,000", trend: "up" },
                      { cat: "Shop Act", loc: "Mumbai", range: "₹1,500 - ₹3,500", trend: "stable" },
                      { cat: "Labour Audit", loc: "Maharashtra", range: "₹15,000 - ₹25,000", trend: "stable" },
                      { cat: "GST Filing", loc: "Bangalore", range: "₹1,200 - ₹2,500", trend: "up" }
                    ].map((sig, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-default">
                        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border shadow-sm">
                          <Coins className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black truncate">{sig.cat} • {sig.loc}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{sig.range}</p>
                        </div>
                        {sig.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'requests' && (
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Marketplace Service Requests</CardTitle>
                <CardDescription>Managing the demand side of the ecosystem.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input className="pl-9 h-10 border rounded-lg text-xs w-[250px]" placeholder="Search by company or category..." />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client & Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>AI Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{req.companyName}</p>
                          <p className="text-[10px] text-primary font-bold">{getCategoryName(req.categoryId)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{req.city}, {req.state}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                            Score: {req.ai_metadata?.quality_score || 'N/A'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px]">{req.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
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
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Verified Consultant Network</CardTitle>
              <CardDescription>Managing the specialist supply side.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expert / Firm</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((cons) => (
                    <TableRow key={cons.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{cons.name}</p>
                          <p className="text-[10px] text-muted-foreground">{cons.companyName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{cons.city}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">
                               {cons.completionRate || 100}% Success
                             </Badge>
                             <span className="text-[9px] text-muted-foreground">{cons.avgResponseTime || 45}m Response</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setViewingConsultant(cons)}>Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'partners' && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Channel Partner Registry</CardTitle>
              <CardDescription>Key network owners bringing high-trust leads.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Firm</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Service Focus</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{partner.partnerName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{partner.id.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{partner.city}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(partner.servicesFocus || []).map((s: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[8px] border-amber-200 bg-amber-50 text-amber-700">
                              {s.replace('cat_', '').replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={partner.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => setViewingPartner(partner)}
                        >
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
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Active Lead Pipeline</CardTitle>
              <CardDescription>Tracking real-time assignments and ecosystem velocity.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company (Request)</TableHead>
                    <TableHead>Assigned Expert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asgn) => {
                    const req = requests.find(r => r.id === asgn.requestId);
                    const cons = consultants.find(c => c.id === asgn.consultantId);
                    
                    return (
                      <TableRow key={asgn.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-xs font-bold">{req?.companyName || "Unknown Request"}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{asgn.requestId.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-xs font-medium">{cons?.name || "Unknown Expert"}</p>
                            <p className="text-[10px] text-muted-foreground">{cons?.companyName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asgn.status === 'accepted' ? 'default' : 'outline'} className="capitalize text-[10px]">
                            {asgn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {asgn.createdAt?.seconds ? new Date(asgn.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'conflicts' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                <h4 className="font-bold text-red-900">Lead Ownership Resolution</h4>
                <p className="text-sm text-red-800 opacity-80 mt-1">
                  Exclusivity conflicts identified by the unique key generator.
                </p>
              </div>
            </div>

            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                {conflicts.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No ownership conflicts currently detected.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conflicted Lead</TableHead>
                        <TableHead>Market Context</TableHead>
                        <TableHead className="text-right">Resolution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conflicts.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-sm">{req.companyName}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">KEY: {req.companyUniqueKey}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-[10px]"><strong>Source:</strong> {req.leadSource || 'Manual'}</p>
                            <p className="text-[10px]"><strong>City:</strong> {req.city}</p>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-700" onClick={() => handleResolveConflict(req.id, 'keep')}>
                              Keep Both
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-700" onClick={() => handleResolveConflict(req.id, 'reject')}>
                              Reject Duplicate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'risk' && (
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                {riskyConsultants.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No integrity issues detected currently.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expert Profile</TableHead>
                        <TableHead>Risk Signal</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskyConsultants.map((cons) => (
                        <TableRow key={cons.id}>
                          <TableCell>
                            <p className="font-bold text-sm">{cons.name}</p>
                            <p className="text-[10px] text-muted-foreground">{cons.companyName}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="destructive" className="text-[9px] w-fit">
                                Risk Score: {cons.ai_risk_score}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">Flags: {cons.ai_risk_reason || 'Inconsistent response speed'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-[10px] font-medium">Completion: {cons.completionRate || 0}%</p>
                            <p className="text-[10px] text-muted-foreground">Response: {cons.avgResponseTime || 'N/A'} mins</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                              Suspend Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* CONSULTANT PROFILE DIALOG */}
      <Dialog open={!!viewingConsultant} onOpenChange={() => setViewingConsultant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-primary">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{viewingConsultant?.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {viewingConsultant?.companyName} • {viewingConsultant?.city}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {viewingConsultant && (
            <div className="space-y-6 pt-4">
              <div className="p-4 bg-muted/30 rounded-xl border">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Professional Bio
                </p>
                <p className="text-sm leading-relaxed text-slate-700 italic">
                  "{viewingConsultant.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Services Offered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingConsultant.servicesOffered?.map((sId: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[9px] bg-primary/5 text-primary border-none">
                        {getServiceName(sId)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">State Jurisdictions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingConsultant.statesCovered?.map((state: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] border-slate-200">
                        <Globe className="h-2 w-2 mr-1" /> {state}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Experience</p>
                    <p className="text-sm font-bold">{viewingConsultant.yearsExperience} Years</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Mobile</p>
                    <p className="text-sm font-bold">{viewingConsultant.phone}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1.5 px-3">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified Platform Expert
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PARTNER REPORT DIALOG */}
      <Dialog open={!!viewingPartner} onOpenChange={() => setViewingPartner(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 h-16 w-16 rounded-2xl flex items-center justify-center text-amber-600">
                <Handshake className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Partner Intelligence Report</DialogTitle>
                <DialogDescription className="text-sm">
                  {viewingPartner?.partnerName} • Network Analytics
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {viewingPartner && (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <p className="text-[10px] font-black text-blue-700 uppercase">Total Leads</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    {requests.filter(r => r.leadOwnerId === viewingPartner.userId).length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                  <p className="text-[10px] font-black text-green-700 uppercase">Active</p>
                  <p className="text-2xl font-black text-green-900 mt-1">
                    {requests.filter(r => r.leadOwnerId === viewingPartner.userId && r.status !== 'completed').length}
                  </p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-center">
                  <p className="text-[10px] font-black text-primary uppercase">Conversion</p>
                  <p className="text-2xl font-black text-primary mt-1">
                    {((requests.filter(r => r.leadOwnerId === viewingPartner.userId && r.status === 'completed').length / 
                      (requests.filter(r => r.leadOwnerId === viewingPartner.userId).length || 1)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                  <Target className="h-3 w-3" /> Service Focus Area
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewingPartner.servicesFocus?.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      {s.replace('cat_', '').replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <span>Account Status: {viewingPartner.status}</span>
                <span>Partner ID: {viewingPartner.userId?.slice(0, 8)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
