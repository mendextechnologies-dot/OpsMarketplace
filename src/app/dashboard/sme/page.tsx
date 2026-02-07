
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle2 } from "lucide-react";

export default function SMEDashboard() {
  const { profile } = useAuth();
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
      case "new": return <Badge variant="secondary">New</Badge>;
      case "assigned": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Assigned</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome, {profile?.name}</h1>
          <p className="text-muted-foreground">Manage your service requests and compliance needs.</p>
        </div>
        <Button asChild>
          <Link href="/request/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'assigned').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <p className="mb-4">You haven't created any service requests yet.</p>
              <Button asChild variant="outline">
                <Link href="/request/new">Create Your First Request</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{req.serviceCategory}</h3>
                    <p className="text-sm text-muted-foreground">{req.companyName} • {req.city}, {req.state}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on {new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(req.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/request/${req.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
