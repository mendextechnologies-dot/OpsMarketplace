
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, MapPin, Users, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id || !profile) return;
      
      const docSnap = await getDoc(doc(db, "serviceRequests", id as string));
      if (!docSnap.exists()) {
        router.push("/dashboard/sme");
        return;
      }
      
      const data = docSnap.data();
      if (data.userId !== profile.id && profile.role !== 'admin') {
        router.push("/dashboard/sme");
        return;
      }
      
      setRequest({ id: docSnap.id, ...data });

      // Fetch matches (lead assignments)
      const q = query(collection(db, "leadAssignments"), where("requestId", "==", id));
      const matchSnap = await getDocs(q);
      const matchData = await Promise.all(matchSnap.docs.map(async (mDoc) => {
        const assignment = mDoc.data();
        const consultantSnap = await getDoc(doc(db, "consultantProfiles", assignment.consultantId));
        return {
          id: mDoc.id,
          ...assignment,
          consultant: consultantSnap.data()
        };
      }));
      setMatches(matchData);
      
      setLoading(false);
    };

    fetchRequest();
  }, [id, profile, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/sme">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{request.serviceCategory}</CardTitle>
                <CardDescription>Requested on {new Date(request.createdAt?.seconds * 1000).toLocaleDateString()}</CardDescription>
              </div>
              <Badge variant={request.status === 'new' ? 'secondary' : 'default'}>
                {request.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{request.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{request.employeeCount} Employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{request.city}, {request.state}</span>
                </div>
              </div>
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Requirement Details</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Matching Consultants</CardTitle>
              <CardDescription>Experts notified of your request</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>Searching for the best experts...</p>
                  <p className="text-xs">This usually takes less than 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                      <div>
                        <p className="font-bold">{match.consultant?.name}</p>
                        <p className="text-xs text-muted-foreground">{match.consultant?.city} based</p>
                      </div>
                      <Badge variant="outline">{match.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Request Received</p>
                  <p className="text-xs text-muted-foreground">Successfully posted to marketplace</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  {matches.length > 0 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Consultant Matching</p>
                  <p className="text-xs text-muted-foreground">Identifying qualified professionals</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Engagement Started</p>
                  <p className="text-xs text-muted-foreground">When you accept a consultant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
