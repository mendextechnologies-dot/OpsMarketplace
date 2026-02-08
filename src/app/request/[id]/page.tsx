"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  Briefcase, 
  ShieldCheck,
  Search,
  Zap,
  Coins,
  TrendingUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getServiceNames, getCategoryName } from "@/lib/constants";
import { getPricingInsights, PricingOutput } from "@/ai/flows/pricing-intelligence-flow";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
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
        if (data.userId !== profile.id && profile.role !== 'admin' && data.leadOwnerId !== profile.id) {
          router.push("/dashboard");
          return;
        }
        
        setRequest({ id: docSnap.id, ...data });

        // Trigger AI Pricing Intelligence
        fetchPricing(getCategoryName(data.categoryId), data.city);

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

        // If admin, fetch all consultants for manual lookup
        if (profile.role === 'admin') {
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

      toast({ title: "Expert Assigned", description: "Lead has been manually matched with the selected expert." });
      
      // Refresh matches
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

  const assignedConsultant = matches.find(m => m.status === 'accepted' || m.status === 'sent');
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
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap p-4 bg-muted/20 rounded-lg border border-muted/50">
                  {request.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Marketplace Assignment
                </CardTitle>
                <CardDescription>
                  Manually assign a verified expert to this requirement.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Select Expert Profile</label>
                  <Select onValueChange={handleManualAssign} disabled={assigning}>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Search verified experts..." />
                    </SelectTrigger>
                    <SelectContent>
                      {consultants.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.companyName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {assignedConsultant ? "Assigned Expert" : "Matching Progress"}
              </CardTitle>
              <CardDescription>
                {assignedConsultant ? "Direct professional support unlocked" : "AI is identifying best-match experts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!assignedConsultant ? (
                <div className="text-center py-10">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
                    <div className="relative z-10 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h5 className="font-bold mb-1">Scanning Specialized Experts...</h5>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto italic">
                    Ranking providers based on performance tiers and location.
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
          {/* AI PRICING INTELLIGENCE CARD */}
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-amber-100/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                <Coins className="h-4 w-4 text-amber-600" />
                AI Pricing Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {loadingPricing ? (
                <div className="flex items-center gap-2 text-amber-700 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Analyzing Market Data...</span>
                </div>
              ) : pricing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter">Typical Price Range</p>
                    <p className="text-2xl font-black text-amber-950">
                      ₹{pricing.typicalRange.min.toLocaleString()} - ₹{pricing.typicalRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-white/60 border border-amber-200 rounded-lg">
                    <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">Market Sentiment</p>
                    <p className="text-xs text-amber-900 leading-relaxed italic">"{pricing.marketSentiment}"</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">Cost Factors</p>
                    <div className="flex flex-wrap gap-1">
                      {pricing.factors.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] bg-white border-amber-200 text-amber-800">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700">Select more details to see pricing guidance.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Process Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-white text-primary h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">1</div>
                  <div className="w-0.5 h-12 bg-white/20 my-1"></div>
                </div>
                <div>
                  <p className="text-sm font-bold">Requirement Submitted</p>
                  <p className="text-[10px] opacity-70">Successfully logged in registry.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`${assignedConsultant ? 'bg-white text-primary' : 'bg-white/20 text-white'} h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm`}>2</div>
                  <div className="w-0.5 h-12 bg-white/20 my-1"></div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${!assignedConsultant && 'opacity-50'}`}>Expert Matched</p>
                  <p className="text-[10px] opacity-70">Uber-style dynamic ranking applied.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`${request.status === 'completed' ? 'bg-white text-primary' : 'bg-white/20 text-white'} h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm`}>3</div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${request.status !== 'completed' && 'opacity-50'}`}>Work Completed</p>
                  <p className="text-[10px] opacity-70">Project delivery & handover.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
