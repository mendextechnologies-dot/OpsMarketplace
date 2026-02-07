
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Users, 
  CheckCircle, 
  ShieldAlert, 
  Briefcase, 
  LayoutDashboard,
  ArrowUpRight,
  Loader2,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'assignments';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile || profile.role !== 'admin') return;

      try {
        const [reqSnap, consSnap, assignSnap] = await Promise.all([
          getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "consultantProfiles")),
          getDocs(query(collection(db, "leadAssignments"), orderBy("createdAt", "desc")))
        ]);

        setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [profile, authLoading, toast]);

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "serviceRequests", reqId), { status: newStatus });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
      toast({ 
        title: "Status Updated", 
        description: `Request status set to ${newStatus}.` 
      });
    } catch (error: any) {
      toast({ 
        title: "Update Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
        <Button asChild variant="outline">
          <a href="/dashboard">Return to Personal Dashboard</a>
        </Button>
      </div>
    );
  }

  const openRequestsCount = requests.filter(r => r.status !== 'completed').length;
  const totalConsultants = consultants.length;

  const NavItem = ({ view, icon: Icon, label }: { view: AdminView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
        activeView === view 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-white p-6 hidden md:block">
        <div className="mb-8 px-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Management</h2>
          <div className="space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="requests" icon={FileText} label="Service Requests" />
            <NavItem view="consultants" icon={Users} label="Consultants" />
            <NavItem view="assignments" icon={Briefcase} label="Lead Assignments" />
          </div>
        </div>
        
        <div className="px-2 pt-6 border-t">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">System</h2>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground leading-tight">
              OpsMarketplace Admin Console v1.0. Connected to {db.app.options.projectId}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary capitalize">{activeView}</h1>
            <p className="text-muted-foreground">Manage and monitor platform activity in real-time.</p>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-white">
            Admin: {profile.name}
          </Badge>
        </header>

        {/* Dynamic View Content */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm border-2 border-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Requests</p>
                      <h3 className="text-3xl font-bold mt-2">{openRequestsCount}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> Active matching
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2 border-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Consultants</p>
                      <h3 className="text-3xl font-bold mt-2">{totalConsultants}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    Across {Array.from(new Set(consultants.flatMap(c => c.statesCovered || []))).length} states
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2 border-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                      <h3 className="text-3xl font-bold mt-2">{assignments.length}</h3>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground font-medium">
                    {assignments.filter(a => a.status === 'accepted').length} Accepted
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2 border-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                      <h3 className="text-3xl font-bold mt-2">
                        {requests.length > 0 ? Math.round((assignments.filter(a => a.status === 'accepted').length / requests.length) * 100) : 0}%
                      </h3>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Package className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    Request to acceptance
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest 5 service requests submitted by SMEs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.slice(0, 5).map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.serviceCategory}</TableCell>
                        <TableCell>{req.companyName}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'new' ? 'secondary' : 'default'}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>All Service Requests</CardTitle>
              <CardDescription>Manage the lifecycle of SME requirements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No requests found.</TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.serviceCategory}</TableCell>
                        <TableCell>{req.companyName}</TableCell>
                        <TableCell>{req.city}, {req.state}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'new' ? 'secondary' : 'default'}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status !== 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'completed')}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Mark Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'consultants' && (
          <Card>
            <CardHeader>
              <CardTitle>Consultant Registry</CardTitle>
              <CardDescription>All active consultants and their verified expertise.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No consultants registered.</TableCell>
                    </TableRow>
                  ) : (
                    consultants.map((cons) => (
                      <TableRow key={cons.id}>
                        <TableCell className="font-medium">{cons.name}</TableCell>
                        <TableCell>{cons.city}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {cons.servicesOffered?.slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                            ))}
                            {cons.servicesOffered?.length > 2 && <Badge variant="outline" className="text-[10px]">+{cons.servicesOffered.length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {Array.isArray(cons.statesCovered) ? cons.statesCovered.join(", ") : cons.statesCovered}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeView === 'assignments' && (
          <Card>
            <CardHeader>
              <CardTitle>Assignment Tracking</CardTitle>
              <CardDescription>Monitoring matches between SMEs and Consultants.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request / SME</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No lead assignments recorded.</TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((asgn) => {
                      const request = requests.find(r => r.id === asgn.requestId);
                      const consultant = consultants.find(c => c.id === asgn.consultantId);
                      return (
                        <TableRow key={asgn.id}>
                          <TableCell>
                            <p className="font-medium">{request?.serviceCategory || 'Unknown Service'}</p>
                            <p className="text-[10px] text-muted-foreground">{request?.companyName || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{consultant?.name || 'Unknown Consultant'}</p>
                            <p className="text-[10px] text-muted-foreground">{consultant?.city || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{asgn.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {asgn.createdAt?.seconds ? new Date(asgn.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
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
