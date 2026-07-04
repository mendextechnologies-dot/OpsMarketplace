
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Zap, 
  Share2, 
  Sparkles,
  Loader2,
  Copy
} from "lucide-react";
import Link from "next/link";
import { getServiceNames, getCategoryName, getServiceName } from "@/lib/constants";
import { generateProposal } from "@/ai/flows/proposal-flow";
import type { ProposalOutput } from "@/ai/flows/proposal-flow";

export default function LeadDetailPage() {
  const { id } = useParams();
  const { profile, consultantProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [contactProfile, setContactProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // AI Proposal State
  const [aiDraft, setAiDraft] = useState<ProposalOutput | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id || !profile) return;
      
      try {
        const requestSnap = await getDoc(doc(db, "serviceRequests", id as string));
        if (!requestSnap.exists()) {
          router.push("/dashboard/consultant");
          return;
        }
        const reqData = { id: requestSnap.id, ...requestSnap.data() };
        setRequest(reqData);

        const q = query(
          collection(db, "leadAssignments"), 
          where("requestId", "==", id),
          where("consultantId", "==", profile.id)
        );
        const assignSnap = await getDocs(q);
        if (!assignSnap.empty) {
          const asgnDoc = assignSnap.docs[0];
          const asgnData = { id: asgnDoc.id, ...asgnDoc.data() };
          setAssignment(asgnData);
        }

        const bidQuery = query(
          collection(db, "requestBids"),
          where("requestId", "==", id),
          where("consultantId", "==", profile.id)
        );
        const bidSnap = await getDocs(bidQuery);
        if (!bidSnap.empty) {
          const bidDoc = bidSnap.docs[0];
          const bidData = { id: bidDoc.id, ...bidDoc.data() };
          setExistingBid(bidData);
          setBidAmount(bidData.bidAmount?.toString() || "");
          setBidMessage(bidData.message || "");
        }

        if (reqData.status !== 'new' && assignSnap.empty) {
          router.push("/dashboard/consultant");
          return;
        }

        if (asgnData.status === 'accepted' || asgnData.status === 'completed') {
          if (reqData.consultantCommunicatesWith === 'partner') {
            const partnerSnap = await getDoc(doc(db, "partnerProfiles", reqData.leadOwnerId));
            if (partnerSnap.exists()) {
              setContactProfile({ ...partnerSnap.data(), isPartner: true });
            }
          } else {
            const smeSnap = await getDoc(doc(db, "organisationProfiles", reqData.userId));
            if (smeSnap.exists()) {
              setContactProfile({ ...smeSnap.data(), isPartner: false });
            }
          }
        }
      } catch (error: any) {
        console.error("Fetch Lead Error:", error);
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
        assignmentHistory: arrayUnion({
          event: "accepted",
          byId: profile.id,
          byName: profile.name,
          byRole: profile.role,
          timestamp: serverTimestamp(),
          note: "Consultant accepted the assignment.",
        }),
      });
      
      if (request.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", request.id), {
          status: "assigned",
          auditLog: arrayUnion({
            event: "assignment_accepted",
            byId: profile.id,
            byName: profile.name,
            byRole: profile.role,
            timestamp: serverTimestamp(),
            note: "Consultant accepted the request assignment.",
          })
        });
        setRequest({ ...request, status: 'assigned' });
      }

      toast({
        title: "Lead Accepted",
        description: "You now have access to the primary contact details.",
      });
      
      setAssignment({ ...assignment, status: 'accepted' });
      
      if (request.consultantCommunicatesWith === 'partner') {
        const partnerSnap = await getDoc(doc(db, "partnerProfiles", request.leadOwnerId));
        if (partnerSnap.exists()) {
          setContactProfile({ ...partnerSnap.data(), isPartner: true });
        }
      } else {
        const smeSnap = await getDoc(doc(db, "organisationProfiles", request.userId));
        if (smeSnap.exists()) {
          setContactProfile({ ...smeSnap.data(), isPartner: false });
        }
      }
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateAiProposal = async () => {
    if (!request || !profile) return;
    setGeneratingDraft(true);
    try {
      const draft = await generateProposal({
        description: request.description,
        services: request.serviceIds.map((sId: string) => getServiceName(sId)),
        consultantName: profile.name,
        consultantBio: "Verified Compliance Expert on OpsMarketplace"
      });
      setAiDraft(draft);
      toast({ title: "AI Draft Ready", description: "Use this template to start your conversation." });
    } catch (error: any) {
      toast({ title: "AI Assistant Busy", description: "Could not generate draft right now.", variant: "destructive" });
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!request || !profile || !consultantProfile) return;
    if (!bidAmount || !bidMessage) {
      toast({ title: "Bid Required", description: "Add your bid amount and message before submitting.", variant: "destructive" });
      return;
    }

    setSubmittingBid(true);
    try {
      const bidId = `${request.id}_${profile.id}`;
      await setDoc(doc(db, "requestBids", bidId), {
        requestId: request.id,
        consultantId: profile.id,
        consultantName: profile.name,
        consultantCompany: consultantProfile.companyName || "",
        bidAmount: parseInt(bidAmount, 10) || 0,
        message: bidMessage,
        status: "submitted",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "serviceRequests", request.id), {
        auditLog: arrayUnion({
          event: "bid_submitted",
          byId: profile.id,
          byName: profile.name,
          byRole: profile.role,
          timestamp: serverTimestamp(),
          note: `Consultant submitted a bid of ₹${parseInt(bidAmount, 10) || 0}.`, 
        })
      });

      const bidRecord = {
        id: bidId,
        requestId: request.id,
        consultantId: profile.id,
        consultantName: profile.name,
        consultantCompany: consultantProfile.companyName || "",
        bidAmount: parseInt(bidAmount, 10) || 0,
        message: bidMessage,
        status: "submitted",
      };
      setExistingBid(bidRecord);
      toast({ title: "Bid Submitted", description: "Your proposal has been submitted to the request owner." });
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmittingBid(false);
    }
  };

  const copyProposal = () => {
    if (aiDraft?.draftMessage) {
      navigator.clipboard.writeText(aiDraft.draftMessage);
      toast({ title: "Copied", description: "Proposal draft copied to clipboard." });
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

  const isAccepted = assignment?.status === 'accepted' || assignment?.status === 'completed';
  const isOpportunityOpen = request?.status === 'new';
  const bidStatusLabel = existingBid?.status === 'awarded'
    ? 'Awarded'
    : existingBid?.status === 'rejected'
    ? 'Rejected'
    : existingBid
    ? 'Submitted'
    : null;
  const bidStatusDescription = existingBid
    ? existingBid.status === 'awarded'
      ? 'Congratulations — your proposal has been selected by the request owner.'
      : existingBid.status === 'rejected'
      ? 'This bid was not selected. You can still review the request if you have ongoing access.'
      : 'Your current bid is active and can be updated until the request is awarded.'
    : 'You have not submitted a bid for this requirement yet.';

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
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{getCategoryName(request.categoryId)}</Badge>
                  <CardTitle className="text-3xl font-extrabold">{request.companyName}</CardTitle>
                </div>
                <Badge variant={isAccepted ? 'default' : 'secondary'} className="px-4 py-1 capitalize">
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Services Needed</h4>
                    <p className="text-lg font-bold">{getServiceNames(request.serviceIds)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-muted">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
                      <span className="font-semibold">{request.city}, {request.state}</span>
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
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg p-4 bg-muted/10 rounded-xl border">
                  {request.description}
                </div>
              </div>

              <Card className="border-2 border-dashed shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Your Bid Status</CardTitle>
                  <CardDescription>
                    {bidStatusDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {existingBid ? (
                    <div className="space-y-4 rounded-2xl border p-4 bg-slate-50">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold">Current bid</p>
                          <p className="text-xs text-muted-foreground mt-1">Submitted on {existingBid.createdAt?.seconds ? new Date(existingBid.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}</p>
                        </div>
                        <Badge className={cn(
                          'uppercase text-[10px] font-black px-2 py-1',
                          existingBid.status === 'awarded'
                            ? 'bg-emerald-600 text-white'
                            : existingBid.status === 'rejected'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-primary/10 text-primary'
                        )}>
                          {bidStatusLabel}
                        </Badge>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="bidAmount">Bid amount (₹)</Label>
                          <Input
                            id="bidAmount"
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="Enter your bid amount"
                            disabled={!isOpportunityOpen}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bidMessage">Bid message</Label>
                          <Textarea
                            id="bidMessage"
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            placeholder="Write a brief proposal summary"
                            className="min-h-[130px]"
                            disabled={!isOpportunityOpen}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="bidAmount">Bid amount (₹)</Label>
                        <Input
                          id="bidAmount"
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter your bid amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bidMessage">Bid message</Label>
                        <Textarea
                          id="bidMessage"
                          value={bidMessage}
                          onChange={(e) => setBidMessage(e.target.value)}
                          placeholder="Write a brief proposal summary"
                          className="min-h-[130px]"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 border-t p-6">
                  <Button className="w-full h-12" onClick={handleSubmitBid} disabled={submittingBid || !isOpportunityOpen}>
                    {submittingBid ? (existingBid ? "Updating bid..." : "Submitting bid...") : existingBid ? "Update Bid" : "Submit Bid"}
                  </Button>
                </CardFooter>
                {!isOpportunityOpen && (
                  <div className="p-4 text-xs text-muted-foreground bg-slate-50 border-t border-slate-200">
                    Bidding is closed for this request since it is no longer open. Your existing bid remains visible for reference.
                  </div>
                )}
              </Card>
              
              {existingBid && existingBid.status === 'awarded' && (
                <Card className="border-2 border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Award Status</CardTitle>
                    <CardDescription>Your proposal won the award and the client has selected your bid.</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {existingBid && existingBid.status === 'rejected' && (
                <Card className="border-2 border-slate-200 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Bid Outcome</CardTitle>
                    <CardDescription>This bid was not selected. Keep scanning for other open opportunities.</CardDescription>
                  </CardHeader>
                </Card>
              )}
              
              {isOpportunityOpen && !existingBid && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
                  Your bid will be visible to the request owner once submitted.
                </div>
              )}
              
            </CardContent>
          </Card>

              {/* AI Conversation Assistant Card */}
              {isAccepted && (
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Conversation Assistant
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Generate a professional introductory proposal based on the client's intent.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!aiDraft ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                        onClick={handleGenerateAiProposal}
                        disabled={generatingDraft}
                      >
                        {generatingDraft ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Generate Custom Proposal
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Textarea 
                            readOnly 
                            className="text-xs bg-white min-h-[150px] pr-10"
                            value={aiDraft.draftMessage}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6" 
                            onClick={copyProposal}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiDraft.keyValueProps.map((prop, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px] bg-primary/10 text-primary border-none">
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
            {!isAccepted && assignment && (
              <CardFooter className="bg-muted/50 border-t p-6 flex gap-4">
                <Button className="flex-1 h-12 text-lg font-bold shadow-lg" onClick={handleAccept} disabled={updating}>
                  {updating ? "Accepting..." : "Accept Lead & Unlock Contact"}
                </Button>
                <Button variant="outline" className="flex-1 h-12" asChild>
                  <Link href="/dashboard/consultant">Ignore</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={isAccepted ? "border-green-200 shadow-md" : "opacity-50"}>
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                {request.consultantCommunicatesWith === 'partner' ? <Share2 className="h-5 w-5 text-primary" /> : <Phone className="h-5 w-5 text-primary" />}
                Primary Contact
              </CardTitle>
              {!isAccepted && <CardDescription>Accept lead to unlock details</CardDescription>}
              {isAccepted && request.consultantCommunicatesWith === 'partner' && (
                <Badge variant="secondary" className="mt-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  Channel Partner Lead
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {isAccepted && contactProfile ? (
                <div className="space-y-5">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      {contactProfile.isPartner ? 'Partner Name' : 'SME Contact Person'}
                    </p>
                    <p className="font-extrabold text-lg">{contactProfile.isPartner ? contactProfile.partnerName : contactProfile.contactPerson}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Mobile</p>
                      <a href={`tel:${contactProfile.phone}`} className="font-bold text-lg hover:underline">{contactProfile.phone}</a>
                    </div>
                  </div>
                  {contactProfile.isPartner && (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-md text-[10px] text-amber-800 italic">
                      Note: This is a channel partner lead. Please coordinate exclusively with the partner representative.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="h-10 w-10 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Contact details are locked until you accept the lead.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
