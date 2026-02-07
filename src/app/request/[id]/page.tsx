
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, MapPin, Users, Clock, CheckCircle2, Phone, Mail, UserCheck, Tag } from "lucide-react";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";

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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const assignedConsultant = matches.find(m => m.status === 'accepted' || m.status === 'sent');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/dashboard/sme">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tracking
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-primary">{getCategoryName(request.categoryId)}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" /> Submitted {new Date(request.createdAt?.seconds * 1000).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={request.status === 'new' ? 'secondary' : 'default'} className="px-4 py-1">
                {request.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase">Services Requested</h4>
                    <p className="text-lg font-semibold">{getServiceNames(request.serviceIds)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Company</p>
                      <span className="font-semibold">{request.companyName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><Users className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Employees</p>
                      <span className="font-semibold">{request.employeeCount}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Location</p>
                      <span className="font-semibold">{request.city}, {request.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">Urgency: {request.urgency}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-lg flex items-center gap-2 underline decoration-primary/20 underline-offset-4">
                  Requirement Details
                </h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {request.additionalNotes && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">Additional Notes</p>
                  <p className="text-sm text-amber-900">{request.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {assignedConsultant ? "Assigned Expert" : "Expert Matching"}
              </CardTitle>
              <CardDescription>
                {assignedConsultant ? "Direct support unlocked" : "Our engine is scanning 100+ verified professionals"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!assignedConsultant ? (
                <div className="text-center py-10">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
                    <div className="relative z-10 bg-primary/10 w-16 h-12 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h5 className="font-bold mb-1">Scanning Professionals...</h5>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    We match based on state regulations and specific service expertise. This usually takes &lt; 24h.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 border-2 border-primary/20 rounded-xl bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg">
                        {assignedConsultant.consultant?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-lg">{assignedConsultant.consultant?.name}</p>
                        <p className="text-sm text-muted-foreground">{assignedConsultant.consultant?.city} based Expert</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">VERIFIED</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button className="h-12 gap-2" variant="default" asChild>
                      <a href={`tel:${assignedConsultant.consultant?.phone}`}>
                        <Phone className="h-4 w-4" /> Call Expert
                      </a>
                    </Button>
                    <Button className="h-12 gap-2" variant="outline" asChild>
                      <a href={`mailto:expert@opsmarketplace.com`}>
                        <Mail className="h-4 w-4" /> Send Email
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Process Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-white text-primary h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                  <div className="w-0.5 h-12 bg-white/20 my-1"></div>
                </div>
                <div>
                  <p className="text-sm font-bold">Requirement Submitted</p>
                  <p className="text-xs opacity-80">We've logged your request successfully.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`${assignedConsultant ? 'bg-white text-primary' : 'bg-white/20 text-white'} h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold`}>2</div>
                  <div className="w-0.5 h-12 bg-white/20 my-1"></div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${!assignedConsultant && 'opacity-50'}`}>Consultant Matched</p>
                  <p className="text-xs opacity-80">Finding experts in {request.state}.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`${request.status === 'completed' ? 'bg-white text-primary' : 'bg-white/20 text-white'} h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold`}>3</div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${request.status !== 'completed' && 'opacity-50'}`}>Service Completed</p>
                  <p className="text-xs opacity-80">Project closure & handover.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {request.status === 'completed' && (
            <Card className="border-green-200 bg-green-50 shadow-sm">
              <CardHeader className="text-center pb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-green-800 text-lg">Project Successful</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-green-700 mb-6">Need support with another operational area?</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/request/new">Start New Project</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
