"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Users, CheckCircle, ShieldAlert, Briefcase } from "lucide-react";

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-headline font-bold">Admin Control Center</h1>
        <p className="text-muted-foreground">Oversee all marketplace activity and manage service fulfillment.</p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 max-w-2xl">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Requests
          </TabsTrigger>
          <TabsTrigger value="consultants" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Consultants
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>All SME submissions across the platform.</CardDescription>
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
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No service requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.serviceCategory}</TableCell>
                        <TableCell>{req.companyName}</TableCell>
                        <TableCell>{req.city}, {req.state}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'new' ? 'secondary' : 'default'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleStatusChange(req.id, 'completed')}
                              className="h-8 gap-1"
                            >
                              <CheckCircle className="h-3 w-3" /> Complete
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
        </TabsContent>

        <TabsContent value="consultants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultant Registry</CardTitle>
              <CardDescription>Verified experts providing operational support.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Base City</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No consultant profiles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    consultants.map((cons) => (
                      <TableRow key={cons.id}>
                        <TableCell className="font-medium">{cons.name}</TableCell>
                        <TableCell>{cons.city}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {cons.servicesOffered?.slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                            {cons.servicesOffered?.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">+{cons.servicesOffered.length - 2}</Badge>
                            )}
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
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Assignments</CardTitle>
              <CardDescription>Mapping of requests to matched consultants.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Consultant ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Matched On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No lead assignments recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((asgn) => (
                      <TableRow key={asgn.id}>
                        <TableCell className="font-mono text-[10px]">{asgn.requestId}</TableCell>
                        <TableCell className="font-mono text-[10px]">{asgn.consultantId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asgn.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {asgn.createdAt?.seconds ? new Date(asgn.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
