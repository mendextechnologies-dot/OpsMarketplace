
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Users, 
  ShieldAlert, 
  LayoutDashboard,
  Loader2,
  Activity,
  PlusCircle,
  Zap,
  MapPin,
  Briefcase,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'pipeline' | 'conflicts';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!profile || profile.role !== 'admin') return;
    setLoading(true);
    try {
      const [reqSnap, consSnap, assignSnap, partnerSnap] = await Promise.all([
        getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "consultantProfiles")),
        getDocs(query(collection(db, "leadAssignments"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "partnerProfiles"))
      ]);

      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPartners(partnerSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      console.error("Firestore Sync Error:", error);
      toast({
        title: "Sync Failed",
        description: error.message,
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
  const avgQualityScore = requests.length > 0 
    ? (requests.reduce((acc, r) => acc + (r.ai_metadata?.quality_score || 0), 0) / requests.length).toFixed(1)
    : "0";

  const NavItem = ({ view, icon: Icon, label, count }: { view: AdminView, icon: any, label: string, count?: number }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors rounded-lg",
        activeView === view 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant={view === 'conflicts' ? 'destructive' : 'secondary'} className="h-5 px-1.5 text-[10px]">
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">OpsAdmin</h1>
        </div>

        <div className="space-y-1 flex-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="requests" icon={FileText} label="Requests" count={requests.filter(r => r.status === 'new').length} />
          <NavItem view="consultants" icon={Users} label="Consultants" />
          <NavItem view="pipeline" icon={Activity} label="Lead Pipeline" />
          <NavItem view="conflicts" icon={AlertTriangle} label="Ownership Conflicts" count={conflicts.length} />
        </div>

        <div className="pt-6 border-t space-y-2">
          <Button asChild variant="default" className="w-full justify-start gap-2 shadow-sm">
            <Link href="/admin/create-lead">
              <PlusCircle className="h-4 w-4" /> New Lead
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5">
            <Link href="/growth-playbook">
              <BookOpen className="h-4 w-4" /> Growth Playbook
            </Link>
          </Button>
          <div className="mt-6 px-2">
            <p className="text-xs font-bold">{profile?.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Marketplace Operator</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {activeView === 'conflicts' ? 'Ownership Resolution' : activeView}
          </h2>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <Activity className="h-3 w-3" /> Refresh Data
          </Button>
        </header>

        {activeView === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Requests", val: requests.length, icon: FileText, color: "text-blue-600" },
                { label: "Conflict Leads", val: conflicts.length, icon: AlertTriangle, color: "text-red-600" },
                { label: "Active Pipeline", val: assignments.filter(a => a.status === 'sent' || a.status === 'accepted').length, icon: Activity, color: "text-primary" },
                { label: "Verified Experts", val: consultants.length, icon: Users, color: "text-green-600" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <stat.icon className={cn("h-5 w-5 mb-4", stat.color)} />
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.val}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> AI Platform Health
                  </CardTitle>
                  <CardDescription>Synthesized metrics from the intake and scoring engines.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Avg Quality Score</p>
                      <h4 className="text-3xl font-black text-primary">{avgQualityScore} / 10</h4>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span>Intent Clarity Rate</span>
                      <span>88%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[88%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Intent Signals</CardTitle>
                  <CardDescription>Live feed of structured data from current intake.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((req, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="h-8 w-8 rounded bg-white flex items-center justify-center text-[10px] font-bold border">
                          {req.ai_metadata?.quality_score || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold truncate">{req.companyName}</p>
                          <p className="text-[10px] text-muted-foreground">{getCategoryName(req.categoryId)} • {req.city}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase">{req.urgency}</Badge>
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
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client & Owner</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const partner = req.leadOwnerType === 'partner' ? partners.find(p => p.id === req.leadOwnerId) : null;
                    return (
                      <TableRow key={req.id} className={req.duplicateFlag ? "bg-red-50/30" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{getCategoryName(req.categoryId)}</p>
                            {req.duplicateFlag && <AlertTriangle className="h-3 w-3 text-red-600" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground italic line-clamp-1">{getServiceNames(req.serviceIds)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-semibold">{req.companyName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {req.leadOwnerType === 'partner' ? (
                              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 gap-1 flex items-center">
                                <Share2 className="h-2 w-2" /> Partner: {partner?.partnerName || 'Unknown'}
                              </Badge>
                            ) : req.leadOwnerType === 'admin' ? (
                              <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-700 gap-1 flex items-center">
                                <Activity className="h-2 w-2" /> Admin Manual
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 gap-1 flex items-center">
                                <Users className="h-2 w-2" /> SME Direct
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                             <div className={cn(
                               "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                               (req.ai_metadata?.quality_score || 0) > 7 ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground"
                             )}>
                               {req.ai_metadata?.quality_score || '-'}
                             </div>
                             <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Matchable</span>
                           </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'new' ? 'secondary' : 'default'} className="text-[9px]">
                            {req.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                            <Link href={`/request/${req.id}`}>
                              View Details
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
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
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex gap-4">
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900">Duplicate Prevention Framework</h4>
                <p className="text-sm text-amber-800 opacity-80 mt-1">
                  The following requests share a company signature (Name + City) with another active lead. 
                  Review them to maintain data integrity and resolve partner ownership disputes.
                </p>
              </div>
            </div>

            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                {conflicts.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No ownership conflicts detected.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conflicting Lead</TableHead>
                        <TableHead>Owner & Source</TableHead>
                        <TableHead>Signature Key</TableHead>
                        <TableHead className="text-right">Resolution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conflicts.map((req) => {
                         const partner = req.leadOwnerType === 'partner' ? partners.find(p => p.id === req.leadOwnerId) : null;
                         return (
                          <TableRow key={req.id}>
                            <TableCell>
                              <p className="font-bold text-sm">{req.companyName}</p>
                              <p className="text-[10px] text-muted-foreground">{getCategoryName(req.categoryId)}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[9px] capitalize">
                                  {req.leadOwnerType}
                                </Badge>
                                <p className="text-[10px] font-medium">{partner?.partnerName || 'Platform Direct'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{req.companyUniqueKey}</code>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleResolveConflict(req.id, 'keep')}>
                                  Verify Lead
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleResolveConflict(req.id, 'reject')}>
                                  <Trash2 className="h-3 w-3 mr-1" /> Reject Duplicate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                         );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'consultants' && (
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expert Name</TableHead>
                    <TableHead>Company & Experience</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Specializations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((cons) => (
                    <TableRow key={cons.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs">
                            {cons.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{cons.name}</p>
                            <p className="text-[10px] text-muted-foreground">{cons.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs flex items-center gap-1 font-medium">
                            <Briefcase className="h-3 w-3 text-muted-foreground" /> {cons.companyName}
                          </p>
                          <Badge variant="secondary" className="text-[9px]">
                            {cons.yearsExperience}+ Years Exp
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{cons.city}, {cons.statesCovered?.join(', ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-2 max-w-[250px]">
                          {getServiceNames(cons.servicesOffered)}
                        </p>
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
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Expert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asgn) => {
                    const req = requests.find(r => r.id === asgn.requestId);
                    const cons = consultants.find(c => c.id === asgn.consultantId);
                    return (
                      <TableRow key={asgn.id}>
                        <TableCell>
                          <p className="text-xs font-bold">{req?.companyName}</p>
                          <p className="text-[10px] text-muted-foreground">{req?.categoryId ? getCategoryName(req.categoryId) : 'Manual Lead'}</p>
                          <p className="text-[9px] text-muted-foreground italic line-clamp-1">{getServiceNames(req?.serviceIds)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold">{cons?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{cons?.city}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-[10px] capitalize">{asgn.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-[10px] text-muted-foreground">
                          {asgn.createdAt?.seconds ? new Date(asgn.createdAt.seconds * 1000).toLocaleDateString() : 'Now'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
