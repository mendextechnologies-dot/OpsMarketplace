
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
import { getServiceNames, getCategoryName } from "@/lib/constants";
import { generateProposal, ProposalOutput } from "@/ai/flows/proposal-flow";

export default function LeadDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
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
        if (assignSnap.empty) {
          router.push("/dashboard/consultant");
          return;
        }
        const asgnDoc = assignSnap.docs[0];
        const asgnData = { id: asgnDoc.id, ...asgnDoc.data() };
        setAssignment(asgnData);

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
      });
      
      if (request.status === 'new') {
        await updateDoc(doc(db, "serviceRequests", request.id), {
          status: "assigned"
        });
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
        services: request.serviceIds.map((sId: string) => getCategoryName(request.categoryId)),
        consultantName: profile.name,
        consultantBio: "Verified Operational Expert on OpsMarketplace"
      });
      setAiDraft(draft);
      toast({ title: "AI Draft Ready", description: "Use this template to start your conversation." });
    } catch (error: any) {
      toast({ title: "AI Assistant Busy", description: "Could not generate draft right now.", variant: "destructive" });
    } finally {
      setGeneratingDraft(false);
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
            {!isAccepted && (
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
