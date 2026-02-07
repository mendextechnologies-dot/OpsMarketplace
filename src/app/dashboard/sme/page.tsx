
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle2, LayoutGrid, ArrowRight, Building2 } from "lucide-react";

export default function SMEDashboard() {
  const { profile, orgProfile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!profile) return;
      const q = query(
        collection(db, "serviceRequests"),
        where("userId", "==", profile.id),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchRequests();
  }, [profile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge variant="secondary" className="font-normal">Matching...</Badge>;
      case "assigned": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-normal">Expert Assigned</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-normal">Completed</Badge>;
      default: return <Badge variant="outline" className="font-normal">{status}</Badge>;
    }
  };

  const activeRequests = requests.filter(r => r.status !== 'completed');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary">Welcome, {profile?.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="h-4 w-4" /> {orgProfile?.companyName || 'Your Business'} Dashboard
          </p>
        </div>
        <Button size="lg" className="shadow-lg group" asChild>
          <Link href="/request/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Service Request
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold mt-1">{requests.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">
                  {requests.filter(r => r.status === 'assigned').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matching</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">
                  {requests.filter(r => r.status === 'new').length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <LayoutGrid className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {completedRequests.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="active" className="px-6">Active Requests</TabsTrigger>
            <TabsTrigger value="completed" className="px-6">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-muted-foreground">Syncing your requests...</div>
          ) : activeRequests.length === 0 ? (
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="py-20 text-center">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No active requests</h3>
                <p className="text-muted-foreground mb-6">You don't have any ongoing service requests at the moment.</p>
                <Button asChild variant="outline">
                  <Link href="/request/new">Create Your First Request</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeRequests.map((req) => (
                <Card key={req.id} className="hover:border-primary/50 transition-colors shadow-sm">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl text-primary">{req.serviceCategory}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm line-clamp-1 italic text-muted-foreground/80 mt-2">"{req.description}"</p>
                    </div>
                    <Button variant="outline" className="shrink-0" asChild>
                      <Link href={`/request/${req.id}`}>Track Progress</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedRequests.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>No completed requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedRequests.map((req) => (
                <Card key={req.id} className="bg-muted/10 opacity-80">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-bold text-lg">{req.serviceCategory}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" asChild>
                      <Link href={`/request/${req.id}`}>View Archive</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
