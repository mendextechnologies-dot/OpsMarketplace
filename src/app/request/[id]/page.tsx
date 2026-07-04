
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp, limit, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
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
  Star,
  ShieldCheck,
  Handshake,
  MessageSquare,
  Share2
} from "lucide-react";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getPricingInsights } from "@/ai/flows/pricing-intelligence-flow";
import type { PricingOutput } from "@/ai/flows/pricing-intelligence-flow";
import { sendLeadAssignmentEmail, sendBidAwardNotificationEmail } from "@/lib/email-service";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [leadOwnerProfile, setLeadOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [bidToConfirm, setBidToConfirm] = useState<any>(null);
  
  // AI Pricing State
  const [pricing, setPricing] = useState<PricingOutput | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  const handleManualAssign = async (consultantId: string) => {
    if (!consultantId) return;
    const consultant = consultants.find((c) => c.id === consultantId);
    if (!consultant) {
      toast({ title: "Selection Error", description: "Selected expert could not be loaded.", variant: "destructive" });
      return;
    }
    await handleSelectExpert(consultant);
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

        // Fetch Lead Owner (Partner) profile if applicable
        if (data.leadOwnerType === 'partner' && data.leadOwnerId) {
          const partnerSnap = await getDoc(doc(db, "partnerProfiles", data.leadOwnerId));
          if (partnerSnap.exists()) {
            setLeadOwnerProfile(partnerSnap.data());
          }
        }

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

        // 2. Fetch active bids for this request
        const bidQ = query(collection(db, "requestBids"), where("requestId", "==", id));
        const bidSnap = await getDocs(bidQ);
        setBids(bidSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // 3. Fetch Potential AI Matches
        if (data.serviceIds && data.serviceIds.length > 0) {
          const potentialQuery = query(
            collection(db, "consultantProfiles"),
            where("servicesOffered", "array-contains-any", data.serviceIds.slice(0, 10)),
            where("verified", "==", true),
            limit(5)
          );
          const potentialSnap = await getDocs(potentialQuery);
          let potential = potentialSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          if (potential.length === 0) {
             const fallbackQuery = query(
               collection(db, "consultantProfiles"),
               where("statesCovered", "array-contains", data.state),
               where("verified", "==", true),
               limit(5)
             );
             const fallbackSnap = await getDocs(fallbackQuery);
             potential = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
          setPotentialMatches(potential);
        }

        // 3. Admin override list
        if (isAdmin) {
          const consSnap = await getDocs(query(
            collection(db, "consultantProfiles"),
            where("verified", "==", true)
          ));
          setConsultants(consSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("Fetch Detail Error:", error);
      }
    };

    fetchRequest();
  }, [id, profile, router]);

  const handleSelectExpert = async (consultant: any) => {
    if (!request || !consultant) return;
    setAssigning(true);
    try {
      const assignmentId = `${request.id}_${consultant.id}`;
      await setDoc(doc(db, "leadAssignments", assignmentId), {
        requestId: request.id,
        consultantId: consultant.id,
        status: "selected",
        createdAt: serverTimestamp(),
        assignedById: profile.id,
        assignedByName: profile.name,
        assignedByRole: profile.role,
        assignmentHistory: [
          {
            event: "selected",
            byId: profile.id,
            byName: profile.name,
            byRole: profile.role,
            timestamp: serverTimestamp(),
            note: "Verified consultant selected for the requirement.",
          }
        ]
      });

      if (request.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", request.id), {
          status: 'assigned',
          selectedConsultantId: consultant.id,
          auditLog: arrayUnion({
            event: "expert_selected",
            byId: profile.id,
            byName: profile.name,
            byRole: profile.role,
            timestamp: serverTimestamp(),
            note: "Expert selected through the marketplace selection flow.",
          })
        });
        setRequest({ ...request, status: 'assigned', selectedConsultantId: consultant.id });
      }

      let targetEmail = consultant.notificationEmail;
      if (!targetEmail) {
        const consUserSnap = await getDoc(doc(db, "users", consultant.id));
        targetEmail = consUserSnap.data()?.email;
      }
      if (targetEmail) {
        sendLeadAssignmentEmail(targetEmail, consultant.name, request.companyName, getCategoryName(request.categoryId));
      }

      setMatches([...matches, {
        id: assignmentId,
        requestId: request.id,
        consultantId: consultant.id,
        status: 'selected',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
        consultant
      }]);// optimistic update

      toast({ title: "Expert Selected", description: "The verified consultant has been selected for your requirement." });
    } catch (error: any) {
      toast({ title: "Selection Failed", description: error.message, variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmAward = async () => {
    if (!bidToConfirm) return;
    await handleAwardBid(bidToConfirm);
    setBidToConfirm(null);
  };

  const handleAwardBid = async (bid: any) => {
    if (!request || !bid) return;
    setAwarding(true);

    try {
      const assignmentId = `${request.id}_${bid.consultantId}`;
      await setDoc(doc(db, "leadAssignments", assignmentId), {
        requestId: request.id,
        consultantId: bid.consultantId,
        status: "selected",
        createdAt: serverTimestamp(),
        assignedById: profile.id,
        assignedByName: profile.name,
        assignedByRole: profile.role,
        assignmentHistory: [
          {
            event: "awarded",
            byId: profile.id,
            byName: profile.name,
            byRole: profile.role,
            timestamp: serverTimestamp(),
            note: "Bid awarded to the selected consultant.",
          }
        ]
      });

      await updateDoc(doc(db, "serviceRequests", request.id), {
        status: 'assigned',
        selectedConsultantId: bid.consultantId,
        winningBidId: bid.id,
        auditLog: arrayUnion({
          event: "bid_awarded",
          byId: profile.id,
          byName: profile.name,
          byRole: profile.role,
          timestamp: serverTimestamp(),
          note: `Bid awarded to ${bid.consultantName} for ₹${bid.bidAmount}.`, 
        })
      });

      await updateDoc(doc(db, "requestBids", bid.id), {
        status: 'awarded',
        awardedAt: serverTimestamp()
      });

      const otherBidUpdates = bids
        .filter((otherBid) => otherBid.id !== bid.id)
        .map((otherBid) => updateDoc(doc(db, "requestBids", otherBid.id), { status: 'rejected' }));

      await Promise.all(otherBidUpdates);

      try {
        const consultantUserSnap = await getDoc(doc(db, "users", bid.consultantId));
        const consultantEmail = consultantUserSnap.exists() ? consultantUserSnap.data()?.email : null;
        if (consultantEmail) {
          await sendBidAwardNotificationEmail(
            consultantEmail,
            bid.consultantName,
            request.companyName,
            bid.bidAmount,
            getCategoryName(request.categoryId)
          );
        }
      } catch (notifyError) {
        console.error("Award notification email failed:", notifyError);
      }

      setRequest({ ...request, status: 'assigned', selectedConsultantId: bid.consultantId, winningBidId: bid.id });
      setMatches([...matches, { id: assignmentId, requestId: request.id, consultantId: bid.consultantId, status: 'selected', consultant: { name: bid.consultantName, companyName: bid.consultantCompany } }]);
      setBids(bids.map((otherBid) => ({ ...otherBid, status: otherBid.id === bid.id ? 'awarded' : 'rejected' })));

      toast({ title: "Bid Awarded", description: `${bid.consultantName} has been awarded the request.` });
    } catch (error: any) {
      toast({ title: "Award Failed", description: error.message, variant: "destructive" });
    } finally {
      setAwarding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const activeAssignment = matches.find(m => ['accepted', 'completed', 'sent', 'selected'].includes(m.status));
  const isAdmin = profile?.role === 'admin';
  const isPartnerView = profile?.role === 'partner' && request.leadOwnerId === profile.id;
  const canSelectExpert = profile?.role === 'admin' || request.userId === profile?.id || isPartnerView;

  const awardedBid = bids.find((bid) => bid.status === 'awarded');
  const submittedBids = bids.filter((bid) => bid.status === 'submitted');
  const lowestSubmittedBid = submittedBids.reduce((best, bid) => {
    if (!best || Number(bid.bidAmount) < Number(best.bidAmount)) return bid;
    return best;
  }, null as any);
  const bidCount = bids.length;
  const isAssigned = request.status !== 'new';
  const bidReviewActive = bids.length > 0 || !!request.winningBidId || request.status !== 'new';
  const expertMatchedActive = !!activeAssignment;
  const workInProgressActive = request.status === 'assigned' || request.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" asChild className="mb-8">
        <Link href={isAdmin ? "/dashboard/admin" : (isPartnerView ? "/dashboard/partner" : "/dashboard/sme")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {request.leadOwnerType === 'partner' && (
        <div className="mb-8 p-4 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest leading-none">Partner-Led Coordination</p>
              <p className="text-sm font-medium text-slate-700 mt-1">Managed execution ecosystem. Communication must be routed through the lead owner.</p>
            </div>
          </div>
          <Badge className="bg-primary text-white font-black px-4 py-1">MANAGED DEAL</Badge>
        </div>
      )}

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
                {activeAssignment ? "Matched Delivery Expert" : "Expert Identification Engine"}
              </CardTitle>
              <CardDescription>
                {activeAssignment
                  ? "A verified specialist has been assigned to this requirement." 
                  : "Scanning top 5% of verified experts for your specific requirement."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeAssignment ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 border-2 border-primary/20 rounded-2xl bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                        {activeAssignment.consultant?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-xl text-primary">{activeAssignment.consultant?.name}</p>
                          <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">
                            {activeAssignment.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{activeAssignment.consultant?.companyName}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 px-4 py-1 text-[10px] font-black">VERIFIED PROVIDER</Badge>
                  </div>

                  {(isAdmin || isPartnerView) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button className="h-14 gap-2 text-base font-bold shadow-md" variant="default" asChild>
                        <a href={`tel:${activeAssignment.consultant?.phone}`}>
                          <Phone className="h-5 w-5" /> Call Assigned Expert
                        </a>
                      </Button>
                      <Button className="h-14 gap-2 text-base font-bold" variant="outline" asChild>
                        <a href={`mailto:${activeAssignment.consultant?.notificationEmail || activeAssignment.consultant?.email}`}>
                          <Mail className="h-5 w-5" /> Email Direct Brief
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-xl border border-dashed flex items-center gap-3">
                      <Handshake className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium">
                        Coordination is managed by our central operations team or lead partner. You will be introduced once the initial intake check is complete.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {potentialMatches.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Candidate Shortlist ({potentialMatches.length})</p>
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
                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{expert.city}</span>
                            {canSelectExpert && request.status === 'new' && (
                              <Button size="sm" onClick={() => handleSelectExpert(expert)} disabled={assigning}>
                                Select Expert
                              </Button>
                            )}
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

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  Bid Review Board
                </CardTitle>
                <CardDescription>
                  Review consultant proposals and award the best-fit bid for this requirement.
                </CardDescription>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-black">{bidCount} total bid{bidCount === 1 ? '' : 's'}</span>
                  {lowestSubmittedBid && (
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      Lowest quote ₹{Number(lowestSubmittedBid.bidAmount).toLocaleString()}
                    </Badge>
                  )}
                  {awardedBid && (
                    <Badge className="bg-emerald-600 text-white uppercase text-[10px] font-black px-2 py-1">
                      Awarded to {awardedBid.consultantName}
                    </Badge>
                  )}
                </div>
                {isAssigned && !awardedBid ? (
                  <p className="text-xs text-amber-700">Request is already in assigned status; bids are visible for reference only.</p>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {bids.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No bids have been submitted yet. Consultants will appear here once they submit proposals for this request.
                </div>
              ) : (
                bids
                  .slice()
                  .sort((a, b) => {
                    const statusOrder = { awarded: 0, submitted: 1, rejected: 2 };
                    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3) || (a.bidAmount || 0) - (b.bidAmount || 0);
                  })
                  .map((bid) => (
                    <div key={bid.id} className={cn(
                      "rounded-3xl border p-5 shadow-sm",
                      bid.status === 'awarded' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                    )}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center font-bold">
                              {bid.consultantName?.charAt(0) || "C"}
                            </div>
                            <div>
                              <p className="text-sm font-black">{bid.consultantName}</p>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{bid.consultantCompany}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <Badge variant="outline" className="uppercase">₹{Number(bid.bidAmount).toLocaleString()}</Badge>
                            <Badge className={cn(
                              "uppercase text-[10px] font-black px-2 py-1",
                              bid.status === 'awarded' ? 'bg-emerald-600 text-white' : bid.status === 'rejected' ? 'bg-slate-100 text-slate-700' : 'bg-primary/10 text-primary'
                            )}>
                              {bid.status}
                            </Badge>
                            {bid.id === lowestSubmittedBid?.id && !awardedBid && (
                              <Badge className="bg-amber-100 text-amber-700 uppercase text-[10px] font-black px-2 py-1">
                                Best value
                              </Badge>
                            )}
                            {bid.createdAt?.seconds && (
                              <span className="text-muted-foreground">Submitted {new Date(bid.createdAt.seconds * 1000).toLocaleDateString()}</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{bid.message}</p>
                        </div>
                        <div className="flex flex-col items-stretch gap-3 sm:items-end">
                          {canSelectExpert && request.status === 'new' && bid.status === 'submitted' ? (
                            <Button size="sm" onClick={() => setBidToConfirm(bid)} disabled={awarding}>
                              {awarding ? 'Awarding...' : 'Award Bid'}
                            </Button>
                          ) : bid.status === 'awarded' ? (
                            <Badge className="bg-emerald-600 text-white uppercase text-[10px] font-black px-2 py-1">Awarded</Badge>
                          ) : bid.status === 'rejected' ? (
                            <Badge className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black px-2 py-1">Rejected</Badge>
                          ) : null}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/leads/${bid.requestId}`}>View Detail</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest">
                  <UserCheck className="h-4 w-4" /> Admin Override Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleManualAssign} disabled={assigning}>
                  <SelectTrigger className="h-12 w-full bg-white">
                    <SelectValue placeholder="Select alternative expert..." />
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
          <Card className="border-primary/20 shadow-md bg-white">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Contact Point
              </CardTitle>
              <CardDescription>Primary stakeholder for this deal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {request.leadOwnerType === 'partner' && leadOwnerProfile ? (
                <div className="space-y-5">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Relationship Manager
                    </p>
                    <p className="font-extrabold text-lg text-primary">{leadOwnerProfile.partnerName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Mobile</p>
                      <a href={`tel:${leadOwnerProfile.phone}`} className="font-bold text-lg hover:underline">{leadOwnerProfile.phone}</a>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 leading-relaxed font-medium">
                    <p className="font-bold mb-1">Commission Protected Path</p>
                    This requirement was logged by a channel partner. Direct client-expert bypass is prohibited to ensure deal security and Partner recognition.
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Client Contact</p>
                    <p className="font-extrabold text-lg">{request.contactName || 'Primary Contact'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-full text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Direct Line</p>
                      <span className="font-bold text-lg">{request.contactPhone || 'Hidden'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-amber-100/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-amber-900 font-black">
                <Coins className="h-4 w-4 text-amber-600" />
                Compliance Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {loadingPricing ? (
                <div className="flex items-center gap-2 text-amber-700 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Analyzing Compliance Signals...</span>
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
                </div>
              ) : (
                <p className="text-xs text-amber-700 italic">Gathering regional market data...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-xl border-none rounded-2xl overflow-hidden">
            <div className="p-6 bg-white/10 border-b border-white/10">
               <CardTitle className="text-lg flex items-center gap-2 font-black">
                <TrendingUp className="h-5 w-5" />
                Lead Lifecycle
              </CardTitle>
            </div>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Intent Logged", sub: "Requirement captured.", active: true },
                { step: 2, title: "Bid Review", sub: bidReviewActive ? "Proposals under evaluation." : "Awaiting consultant proposals.", active: bidReviewActive },
                { step: 3, title: "Expert Matched", sub: "Selected consultant confirmed.", active: expertMatchedActive },
                { step: 4, title: "Work in Progress", sub: "Delivery and compliance support.", active: workInProgressActive }
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg transition-all duration-500",
                      item.active ? "bg-white text-primary scale-110" : "bg-white/20 text-white/50"
                    )}>{item.step}</div>
                    {i < 3 && <div className={cn("w-0.5 h-12 my-1 transition-colors duration-500", item.active && ((i === 0 && bidReviewActive) || (i === 1 && expertMatchedActive) || (i === 2 && workInProgressActive)) ? "bg-white" : "bg-white/20")}></div>}
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
