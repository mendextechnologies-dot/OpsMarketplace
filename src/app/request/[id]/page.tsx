
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  UserCheck, 
  Tag, 
  Zap, 
  Coins, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  Star 
} from "lucide-react";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getPricingInsights } from "@/ai/flows/pricing-intelligence-flow";
import type { PricingOutput } from "@/ai/flows/pricing-intelligence-flow";
import { sendLeadAssignmentEmail } from "@/lib/email-service";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  // AI Pricing State
  const [pricing, setPricing] = useState<PricingOutput | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id || !profile) return;
      
      try {
        const docSnap = await getDoc(doc(db, "serviceRequests", id as string));
        if (!docSnap.exists()) {
          router.push("/dashboard/sme");
          return;
        }
        
        const data = docSnap.data();
        const isOwner = data.userId === profile.id || data.leadOwnerId === profile.id;
        const isAdmin = profile.role === 'admin';
        
        if (!isOwner && !isAdmin) {
          router.push("/dashboard");
          return;
        }
        
        setRequest({ id: docSnap.id, ...data });

        // Trigger AI Pricing Intelligence
        fetchPricing(getCategoryName(data.categoryId), data.city);

        // 1. Fetch existing assignments (actual matches)
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

        // 2. Fetch Potential AI Matches
        if (data.serviceIds && data.serviceIds.length > 0) {
          const potentialQuery = query(
            collection(db, "consultantProfiles"),
            where("servicesOffered", "array-contains-any", data.serviceIds.slice(0, 10)),
            limit(5)
          );
          const potentialSnap = await getDocs(potentialQuery);
          let potential = potentialSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          if (potential.length === 0) {
             const fallbackQuery = query(
               collection(db, "consultantProfiles"),
               where("statesCovered", "array-contains", data.state),
               limit(5)
             );
             const fallbackSnap = await getDocs(fallbackQuery);
             potential = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
          setPotentialMatches(potential);
        }

        // 3. Admin override list
        if (isAdmin) {
          const consSnap = await getDocs(collection(db, "consultantProfiles"));
          setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("Fetch Detail Error:", error);
      }
    };

    const fetchPricing = async (cat: string, loc: string) => {
      setLoadingPricing(true);
      try {
        const insights = await getPricingInsights({ categoryName: cat, location: loc });
        setPricing(insights);
      } catch (e) {
        console.error("Pricing Flow Error", e);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchRequest();
  }, [id, profile, router]);

  const handleManualAssign = async (consultantId: string) => {
    if (!request || !consultantId) return;
    setAssigning(true);
    try {
      const assignmentId = `${request.id}_${consultantId}`;
      await setDoc(doc(db, "leadAssignments", assignmentId), {
        requestId: request.id,
        consultantId: consultantId,
        status: "sent",
        createdAt: serverTimestamp(),
      });

      if (request.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", request.id), { status: 'assigned' });
        setRequest({ ...request, status: 'assigned' });
      }

      // Trigger Notification Email
      const selectedConsultant = consultants.find(c => c.id === consultantId);
      if (selectedConsultant) {
        // Fallback Logic: Notification Email -> User Email
        let targetEmail = selectedConsultant.notificationEmail;
        
        if (!targetEmail) {
          const consUserSnap = await getDoc(doc(db, "users", consultantId));
          targetEmail = consUserSnap.data()?.email;
        }

        if (targetEmail) {
          sendLeadAssignmentEmail(
            targetEmail, 
            selectedConsultant.name, 
            request.companyName, 
            getCategoryName(request.categoryId)
          );
        }
      }

      toast({ title: "Expert Assigned", description: "Lead matched and notification email sent." });
      
      // Refresh local state
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
    } catch (error: any) {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const activeAssignment = matches.find(m => m.status === 'accepted' || m.status === 'completed') || matches.find(m => m.status === 'sent');
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" asChild className="mb-8">
        <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/sme"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-primary">{getCategoryName(request.categoryId)}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" /> Submitted {new Date(request.createdAt?.seconds * 1000).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={request.status === 'new' ? 'secondary' : 'default'} className="px-4 py-1 uppercase text-[10px] font-bold tracking-widest">
                {request.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Services Requested</h4>
                    <p className="text-lg font-bold leading-tight mt-1">{getServiceNames(request.serviceIds)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm border"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Company</p>
                      <span className="font-bold">{request.companyName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm border"><Users className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Employees</p>
                      <span className="font-bold">{request.employeeCount}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg shadow-sm border"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Location</p>
                      <span className="font-bold">{request.city}, {request.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px] font-bold bg-white">Urgency: {request.urgency}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Requirement Narrative</h4>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap p-5 bg-white rounded-xl border-2 shadow-inner min-h-[100px]">
                  {request.description}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-2 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {activeAssignment?.status === 'accepted' ? "Your Assigned Expert" : "AI Expert Identification"}
              </CardTitle>
              <CardDescription>
                {activeAssignment?.status === 'accepted' 
                  ? "Direct support from a verified specialist is now active." 
                  : "Scanning top experts for your requirement."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeAssignment?.status === 'accepted' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 border-2 border-primary/20 rounded-2xl bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                        {activeAssignment.consultant?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-xl text-primary">{activeAssignment.consultant?.name}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{activeAssignment.consultant?.companyName}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 px-4 py-1 text-[10px] font-black">VERIFIED PARTNER</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button className="h-14 gap-2 text-base font-bold shadow-md" variant="default" asChild>
                      <a href={`tel:${activeAssignment.consultant?.phone}`}>
                        <Phone className="h-5 w-5" /> Call Primary Expert
                      </a>
                    </Button>
                    <Button className="h-14 gap-2 text-base font-bold" variant="outline" asChild>
                      <a href={`mailto:${activeAssignment.consultant?.notificationEmail || activeAssignment.consultant?.email || 'expert@opsmarketplace.com'}`}>
                        <Mail className="h-5 w-5" /> Send Brief
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {potentialMatches.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Matched Candidates ({potentialMatches.length})</p>
                      {potentialMatches.map((expert) => (
                        <div key={expert.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 hover:border-primary/30 transition-all shadow-sm group">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-colors">
                                {expert.name?.charAt(0)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white shadow-sm" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black">{expert.name}</p>
                                <Badge variant="outline" className="text-[9px] h-4 bg-green-50 text-green-700 border-green-200">HIGH MATCH</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{expert.companyName}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{expert.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Zap className="h-10 w-10 text-primary mx-auto animate-pulse mb-4" />
                      <h5 className="font-black text-lg mb-2 text-primary">Scanning Specialized Expert Network...</h5>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {isAdmin && (
            <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest">
                  <UserCheck className="h-4 w-4" /> Admin Manual Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleManualAssign} disabled={assigning}>
                  <SelectTrigger className="h-12 w-full bg-white">
                    <SelectValue placeholder="Override and Assign Expert..." />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.companyName} ({c.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-amber-100/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-amber-900 font-black">
                <Coins className="h-4 w-4 text-amber-600" />
                AI Pricing Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {loadingPricing ? (
                <div className="flex items-center gap-2 text-amber-700 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Analyzing Market Signals...</span>
                </div>
              ) : pricing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">Typical Price Range</p>
                    <p className="text-3xl font-black text-amber-950 mt-1">
                      ₹{pricing.typicalRange.min.toLocaleString()} – ₹{pricing.typicalRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/80 border border-amber-200 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-amber-800 uppercase mb-2">Market Sentiment</p>
                    <p className="text-xs text-amber-900 leading-relaxed italic font-medium">"{pricing.marketSentiment}"</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-amber-800 uppercase">Pricing Factors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pricing.factors.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] font-bold bg-white border-amber-200 text-amber-800">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700">Pricing intelligence gathering data...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-xl border-none rounded-2xl overflow-hidden">
            <div className="p-6 bg-white/10 border-b border-white/10">
               <CardTitle className="text-lg flex items-center gap-2 font-black">
                <TrendingUp className="h-5 w-5" />
                Platform Lifecycle
              </CardTitle>
            </div>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Intent Logged", sub: "Requirement complete.", active: true },
                { step: 2, title: "Expert Matching", sub: "Ranking specialized providers.", active: !!activeAssignment },
                { step: 3, title: "Project Delivery", sub: "Expert execution.", active: request.status === 'completed' }
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg transition-all duration-500",
                      item.active ? "bg-white text-primary scale-110" : "bg-white/20 text-white/50"
                    )}>{item.step}</div>
                    {i < 2 && <div className={cn("w-0.5 h-12 my-1 transition-colors duration-500", item.active && i === 0 && !!activeAssignment ? "bg-white" : "bg-white/20")}></div>}
                  </div>
                  <div className={cn("transition-opacity duration-500", !item.active && "opacity-40")}>
                    <p className="text-sm font-black uppercase tracking-tight">{item.title}</p>
                    <p className="text-[10px] font-medium opacity-80 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
