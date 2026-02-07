
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Users, 
  CheckCircle, 
  ShieldAlert, 
  Briefcase, 
  LayoutDashboard,
  ArrowUpRight,
  Loader2,
  Package,
  Activity,
  UserPlus,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'pipeline';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [orgProfiles, setOrgProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile || profile.role !== 'admin') return;
    setLoading(true);
    try {
      const [reqSnap, consSnap, assignSnap, orgSnap] = await Promise.all([
        getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "consultantProfiles")),
        getDocs(query(collection(db, "leadAssignments"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "organisationProfiles"))
      ]);

      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setOrgProfiles(orgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      toast({
        title: "Error fetching platform data",
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

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "serviceRequests", reqId), { status: newStatus });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
      toast({ title: "Status Updated", description: `Request status set to ${newStatus}.` });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleManualAssign = async (reqId: string, consultantId: string) => {
    try {
      // Create new assignment
      const assignmentId = `${reqId}_${consultantId}`;
      await setDoc(doc(db, "leadAssignments", assignmentId), {
        requestId: reqId,
        consultantId: consultantId,
        status: "sent",
        createdAt: serverTimestamp(),
      });

      // Update request status if it was new
      const request = requests.find(r => r.id === reqId);
      if (request?.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", reqId), { status: 'assigned' });
      }

      toast({ title: "Expert Assigned", description: "Lead has been manually matched." });
      setAssigningTo(null);
      fetchData(); // Refresh all
    } catch (error: any) {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Initializing Marketplace Console...</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Super Admin privileges required.</p>
        <Button asChild variant="outline" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    );
  }

  // Dashboard Stats
  const totalRequests = requests.length;
  const newRequests = requests.filter(r => r.status === 'new').length;
  const activeLeads = assignments.filter(a => a.status === 'accepted' || a.status === 'sent').length;
  const completedJobs = requests.filter(r => r.status === 'completed').length;
  const totalCons = consultants.length;

  const NavItem = ({ view, icon: Icon, label }: { view: AdminView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
        activeView === view 
          ? "bg-primary text-primary-foreground shadow-lg" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-white p-6 hidden lg:block sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <h1 className="text-xl font-bold tracking-tight">OpsMarketplace</h1>
        </div>

        <div className="space-y-1 mb-8">
          <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Monitor</p>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Control Center" />
          <NavItem view="pipeline" icon={Activity} label="Lead Pipeline" />
        </div>
        
        <div className="space-y-1 mb-8">
          <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Operations</p>
          <NavItem view="requests" icon={FileText} label="Service Requests" />
          <NavItem view="consultants" icon={Users} label="Expert Registry" />
        </div>

        <div className="mt-auto pt-6 border-t px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {profile.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{profile.name}</p>
              <p className="text-[10px] text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
              {activeView === 'dashboard' ? 'Marketplace Pulse' : activeView}
            </h2>
            <p className="text-slate-500 mt-1">Foundation level oversight of SME-Expert interactions.</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <Activity className="h-4 w-4" /> Refresh Data
          </Button>
        </header>

        {activeView === 'dashboard' && (
          <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Requests", val: totalRequests, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "New Requests", val: newRequests, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Active Leads", val: activeLeads, icon: Activity, color: "text-primary", bg: "bg-primary/5" },
                { label: "Completed", val: completedJobs, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                { label: "Total Experts", val: totalCons, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((kpi, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className={cn("p-2 rounded-lg w-fit mb-4", kpi.bg)}>
                      <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                    </div>
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{kpi.val}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Critical: New Requests</CardTitle>
                  <CardDescription>SMEs waiting for expert validation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.filter(r => r.status === 'new').slice(0, 5).map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold">{req.serviceCategory}</TableCell>
                          <TableCell className="text-xs">{req.companyName}</TableCell>
                          <TableCell className="text-xs">{req.city}, {req.state}</TableCell>
                          <TableCell className="text-right">
                            <Button size="xs" variant="ghost" className="text-primary font-bold h-8" onClick={() => setActiveView('requests')}>
                              Review <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Top Experts</CardTitle>
                  <CardDescription>Most active consultants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultants.slice(0, 5).map((cons) => {
                    const leadCount = assignments.filter(a => a.consultantId === cons.id).length;
                    return (
                      <div key={cons.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold uppercase">
                            {cons.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-none">{cons.name}</p>
                            <p className="text-[10px] text-muted-foreground">{cons.city}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{leadCount} Leads</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'requests' && (
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Validate and match incoming requirements.</CardDescription>
              </div>
              <Badge>{requests.length} Total</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Info</TableHead>
                    <TableHead>SME Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Marketplace Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const org = orgProfiles.find(o => o.id === req.userId);
                    return (
                      <TableRow key={req.id}>
                        <TableCell>
                          <p className="font-bold">{req.serviceCategory}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{req.description}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold">{req.companyName}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-2 w-2" /> {org?.phone || 'No phone'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'new' ? 'secondary' : 'default'} className="capitalize text-[10px]">
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {assigningTo === req.id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <Select onValueChange={(val) => handleManualAssign(req.id, val)}>
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                  <SelectValue placeholder="Pick Expert" />
                                </SelectTrigger>
                                <SelectContent>
                                  {consultants
                                    .filter(c => c.servicesOffered?.includes(req.serviceCategory))
                                    .map(c => (
                                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              <Button size="sm" variant="ghost" onClick={() => setAssigningTo(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <>
                              {req.status === 'new' && (
                                <Button size="sm" variant="default" className="h-8 gap-1" onClick={() => setAssigningTo(req.id)}>
                                  <UserPlus className="h-3 w-3" /> Assign Expert
                                </Button>
                              )}
                              {req.status !== 'completed' && (
                                <Button size="sm" variant="outline" className="h-8" onClick={() => handleStatusChange(req.id, 'completed')}>
                                  Mark Complete
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'consultants' && (
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expert Registry</CardTitle>
                <CardDescription>Supply side management and verification.</CardDescription>
              </div>
              <Badge variant="outline">{consultants.length} Active</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Location & Coverage</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((cons) => {
                    const leadCount = assignments.filter(a => a.consultantId === cons.id).length;
                    const acceptedCount = assignments.filter(a => a.consultantId === cons.id && a.status === 'accepted').length;
                    return (
                      <TableRow key={cons.id}>
                        <TableCell>
                          <p className="font-bold">{cons.name}</p>
                          <p className="text-[10px] text-muted-foreground">{cons.companyName}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium">{cons.city}</p>
                          <p className="text-[10px] text-muted-foreground">{cons.statesCovered?.join(", ")}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {cons.servicesOffered?.slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-[9px] px-1 h-4">{s}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold">{leadCount} Leads Recv.</span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${leadCount > 0 ? (acceptedCount/leadCount)*100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <a href={`tel:${cons.phone}`} className="text-[10px] font-bold hover:underline flex items-center gap-1">
                              <Phone className="h-2 w-2" /> {cons.phone}
                            </a>
                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">expert@opsmarketplace.com</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'pipeline' && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>Real-time journey of every marketplace transaction.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SME / Request</TableHead>
                    <TableHead>Assigned Expert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Matched At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No leads in pipeline.</TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((asgn) => {
                      const request = requests.find(r => r.id === asgn.requestId);
                      const consultant = consultants.find(c => c.id === asgn.consultantId);
                      return (
                        <TableRow key={asgn.id}>
                          <TableCell>
                            <p className="text-xs font-bold">{request?.companyName || 'Deleted SME'}</p>
                            <Badge variant="outline" className="text-[9px] h-4">{request?.serviceCategory || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs font-bold">{consultant?.name || 'Unknown Expert'}</p>
                            <p className="text-[10px] text-muted-foreground italic">{consultant?.city}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "text-[10px] capitalize",
                              asgn.status === 'accepted' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                              asgn.status === 'sent' ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
                            )}>
                              {asgn.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-[10px] text-muted-foreground">
                            {asgn.createdAt?.seconds ? new Date(asgn.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
