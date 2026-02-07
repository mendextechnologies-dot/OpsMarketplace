
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Users, 
  ShieldAlert, 
  LayoutDashboard,
  Loader2,
  Activity,
  PlusCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";

type AdminView = 'dashboard' | 'requests' | 'consultants' | 'pipeline';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile || profile.role !== 'admin') return;
    setLoading(true);
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

  const handleManualAssign = async (reqId: string, consultantId: string) => {
    try {
      const assignmentId = `${reqId}_${consultantId}`;
      await setDoc(doc(db, "leadAssignments", assignmentId), {
        requestId: reqId,
        consultantId: consultantId,
        status: "sent",
        createdAt: serverTimestamp(),
      });

      const request = requests.find(r => r.id === reqId);
      if (request?.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", reqId), { status: 'assigned' });
      }

      toast({ title: "Matched", description: "Lead manually assigned to consultant." });
      setAssigningTo(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const NavItem = ({ view, icon: Icon, label }: { view: AdminView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
        activeView === view 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 border-r bg-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <h1 className="text-xl font-bold tracking-tight">OpsAdmin</h1>
        </div>

        <div className="space-y-1 flex-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="requests" icon={FileText} label="Requests" />
          <NavItem view="consultants" icon={Users} label="Consultants" />
          <NavItem view="pipeline" icon={Activity} label="Lead Pipeline" />
        </div>

        <div className="pt-6 border-t">
          <Button asChild variant="default" className="w-full justify-start gap-2 mb-6">
            <Link href="/admin/create-lead">
              <PlusCircle className="h-4 w-4" /> New Lead
            </Link>
          </Button>
          <p className="text-xs font-bold px-2">{profile?.name}</p>
          <p className="text-[10px] text-muted-foreground px-2">Marketplace Operator</p>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">{activeView}</h2>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <Activity className="h-3 w-3" /> Refresh Data
          </Button>
        </header>

        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Requests", val: requests.length, icon: FileText, color: "text-blue-600" },
              { label: "New Requests", val: requests.filter(r => r.status === 'new').length, icon: ShieldAlert, color: "text-amber-600" },
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
        )}

        {activeView === 'requests' && (
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <p className="font-bold">{getCategoryName(req.categoryId)}</p>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1">{getServiceNames(req.serviceIds)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-semibold">{req.companyName}</p>
                        <p className="text-[10px] text-muted-foreground">{req.city}, {req.state}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'new' ? 'secondary' : 'default'} className="text-[9px]">
                          {req.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {assigningTo === req.id ? (
                          <Select onValueChange={(val) => handleManualAssign(req.id, val)}>
                            <SelectTrigger className="w-[150px] h-8 text-[10px] ml-auto">
                              <SelectValue placeholder="Assign Expert" />
                            </SelectTrigger>
                            <SelectContent>
                              {consultants
                                .filter(c => c.servicesOffered?.some((sId: string) => req.serviceIds?.includes(sId)))
                                .map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {req.status === 'new' && (
                              <Button size="sm" variant="default" className="h-7 text-[10px]" onClick={() => setAssigningTo(req.id)}>Match</Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
                              <Link href={`/request/${req.id}`}>View</Link>
                            </Button>
                          </div>
                        )}
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
