
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, MapPin, Users, Phone, Mail, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  const { id } = useParams(); // requestId
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [smeProfile, setSmeProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id || !profile) return;
      
      try {
        // 1. Fetch Request
        const requestSnap = await getDoc(doc(db, "serviceRequests", id as string));
        if (!requestSnap.exists()) {
          router.push("/dashboard/consultant");
          return;
        }
        const reqData = { id: requestSnap.id, ...requestSnap.data() };
        setRequest(reqData);

        // 2. Fetch Assignment for this consultant
        const q = query(
          collection(db, "leadAssignments"), 
          where("requestId", "==", id),
          where("consultantId", "==", profile.id)
        );
        const assignSnap = await getDocs(q);
        if (assignSnap.empty) {
          router.push("/dashboard/consultant");
          return;
        }
        const asgnDoc = assignSnap.docs[0];
        const asgnData = { id: asgnDoc.id, ...asgnDoc.data() };
        setAssignment(asgnData);

        // 3. Fetch SME Profile if accepted
        if (asgnData.status === 'accepted' || asgnData.status === 'completed') {
          const smeSnap = await getDoc(doc(db, "organisationProfiles", reqData.userId));
          if (smeSnap.exists()) {
            setSmeProfile(smeSnap.data());
          }
        }
      } catch (error: any) {
        toast({ title: "Fetch failed", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [id, profile, router, toast]);

  const handleAccept = async () => {
    if (!assignment) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "leadAssignments", assignment.id), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
      });
      
      // Update the main request status too if it's the first acceptance
      if (request.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", request.id), {
          status: "assigned"
        });
      }

      toast({
        title: "Lead Accepted",
        description: "You now have access to the SME's contact details. Good luck!",
      });
      
      // Refresh local state to unlock UI
      setAssignment({ ...assignment, status: 'accepted' });
      const smeSnap = await getDoc(doc(db, "organisationProfiles", request.userId));
      if (smeSnap.exists()) {
        setSmeProfile(smeSnap.data());
      }
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!assignment) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "leadAssignments", assignment.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      
      toast({
        title: "Job Marked Completed",
        description: "Great work! We've updated the record.",
      });
      setAssignment({ ...assignment, status: 'completed' });
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isAccepted = assignment.status === 'accepted' || assignment.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/consultant">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Expert Console
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader className="border-b pb-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{request.serviceCategory}</Badge>
                  <CardTitle className="text-3xl font-extrabold">{request.companyName}</CardTitle>
                </div>
                <Badge variant={isAccepted ? 'default' : 'secondary'} className="px-4 py-1 capitalize">
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-muted">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
                      <span className="font-semibold">{request.city}, {request.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Company Size</p>
                      <span className="font-semibold">{request.employeeCount} Employees</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Urgency</p>
                      <span className="font-semibold capitalize">{request.urgency}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-lg flex items-center gap-2 underline decoration-primary/20 underline-offset-4">
                  <FileText className="h-5 w-5" /> Detailed Requirement
                </h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                  {request.description}
                </p>
              </div>

              {request.additionalNotes && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-xs font-bold text-primary uppercase mb-1">Additional Notes</p>
                  <p className="text-sm italic">"{request.additionalNotes}"</p>
                </div>
              )}
            </CardContent>
            {!isAccepted && (
              <CardFooter className="bg-muted/50 border-t p-6 flex gap-4">
                <Button className="flex-1 h-12 text-lg font-bold" onClick={handleAccept} disabled={updating}>
                  {updating ? "Accepting..." : "Accept Lead & Unlock Contact"}
                </Button>
                <Button variant="outline" className="flex-1 h-12" asChild>
                  <Link href="/dashboard/consultant">Ignore</Link>
                </Button>
              </CardFooter>
            )}
            {assignment.status === 'accepted' && (
              <CardFooter className="bg-green-50/50 border-t p-6">
                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold" onClick={handleComplete} disabled={updating}>
                  {updating ? "Processing..." : "Mark as Project Completed"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={isAccepted ? "border-green-200 shadow-md" : "opacity-50"}>
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> SME Contact Info
              </CardTitle>
              {!isAccepted && <CardDescription>Accept lead to unlock details</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {isAccepted && smeProfile ? (
                <div className="space-y-5">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Contact Person</p>
                    <p className="font-extrabold text-lg">{smeProfile.contactPerson}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Mobile</p>
                      <a href={`tel:${smeProfile.phone}`} className="font-bold text-lg hover:underline">{smeProfile.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                      <span className="font-bold text-lg">{request.userEmail || 'Contact SME via Phone'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    Verify your identity and mention "OpsMarketplace" when calling.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="h-10 w-10 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground">Contact details are locked until you accept the lead.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm opacity-90">
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-white text-primary rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <p>Call the SME within 24 hours of acceptance.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-white text-primary rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <p>Understand their specific documentation needs.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-white text-primary rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <p>Submit your quote and timeline directly.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-white text-primary rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                <p>Mark job as completed on this dashboard once done.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
