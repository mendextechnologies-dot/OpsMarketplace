
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-config";
import { doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  Briefcase, 
  Award, 
  Mail, 
  Sparkles, 
  Loader2, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { enhanceProfile } from "@/ai/flows/profile-enhancer-flow";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProfileSettingsPage() {
  const { user, profile, orgProfile, partnerProfile, consultantProfile, refreshProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  // SME State
  const [smeData, setSmeData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    state: "",
    city: "",
    contactPerson: "",
    phone: "",
  });

  // Consultant State
  const [consData, setConsData] = useState({
    companyName: "",
    phone: "",
    notificationEmail: "",
    city: "",
    description: "",
    yearsExperience: "",
    servicesOffered: [] as string[],
    statesCovered: "",
  });

  // Partner State
  const [partnerData, setPartnerData] = useState({
    partnerName: "",
    phone: "",
    city: "",
    servicesFocus: [] as string[],
  });

  useEffect(() => {
    if (orgProfile) {
      setSmeData({
        companyName: orgProfile.companyName || "",
        industry: orgProfile.industry || "",
        employeeCount: orgProfile.employeeCount?.toString() || "",
        state: orgProfile.state || "",
        city: orgProfile.city || "",
        contactPerson: orgProfile.contactPerson || "",
        phone: orgProfile.phone || "",
      });
    }
    if (consultantProfile) {
      setConsData({
        companyName: consultantProfile.companyName || "",
        phone: consultantProfile.phone || "",
        notificationEmail: consultantProfile.notificationEmail || "",
        city: consultantProfile.city || "",
        description: consultantProfile.description || "",
        yearsExperience: consultantProfile.yearsExperience?.toString() || "",
        servicesOffered: consultantProfile.servicesOffered || [],
        statesCovered: consultantProfile.statesCovered?.join(", ") || "",
      });
    }
    if (partnerProfile) {
      setPartnerData({
        partnerName: partnerProfile.partnerName || "",
        phone: partnerProfile.phone || "",
        city: partnerProfile.city || "",
        servicesFocus: partnerProfile.servicesFocus || [],
      });
    }
  }, [orgProfile, consultantProfile, partnerProfile]);

  const handleSmeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "organisationProfiles", user.uid), {
        ...smeData,
        employeeCount: parseInt(smeData.employeeCount) || 0,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      toast({ title: "Profile Updated", description: "Your business details have been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "consultantProfiles", user.uid), {
        ...consData,
        yearsExperience: parseInt(consData.yearsExperience) || 0,
        statesCovered: consData.statesCovered.split(",").map(s => s.trim()).filter(s => s),
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      toast({ title: "Expert Profile Updated", description: "Your professional details have been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "partnerProfiles", user.uid), {
        ...partnerData,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      toast({ title: "Partner Profile Updated", description: "Your network details have been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAiEnhance = async () => {
    if (!consData.description || consData.servicesOffered.length === 0) {
      toast({ title: "More info needed", description: "Ensure bio and services are present for AI enhancement.", variant: "destructive" });
      return;
    }
    setEnhancing(true);
    try {
      const result = await enhanceProfile({
        rawBio: consData.description,
        services: consData.servicesOffered
      });
      setConsData(prev => ({ ...prev, description: result.professionalBio }));
      toast({ title: "Bio Enhanced", description: "AI has optimized your professional description." });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not enhance bio at this moment.", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 font-bold">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground font-medium mt-1">Manage your identity and operational details on the platform.</p>
      </div>

      {profile?.role === 'sme' && (
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black">
              <Building2 className="h-6 w-6 text-primary" /> Business Configuration
            </CardTitle>
            <CardDescription className="font-medium">Details about your company and primary contact.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSmeSubmit}>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Company Name</Label>
                  <Input value={smeData.companyName} onChange={e => setSmeData({...smeData, companyName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Industry</Label>
                  <Input value={smeData.industry} onChange={e => setSmeData({...smeData, industry: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Employee Count</Label>
                  <Input type="number" value={smeData.employeeCount} onChange={e => setSmeData({...smeData, employeeCount: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone Number</Label>
                  <Input value={smeData.phone} onChange={e => setSmeData({...smeData, phone: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <Label className="font-bold">Contact Person</Label>
                  <Input value={smeData.contactPerson} onChange={e => setSmeData({...smeData, contactPerson: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">State</Label>
                  <Input value={smeData.state} onChange={e => setSmeData({...smeData, state: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">City</Label>
                  <Input value={smeData.city} onChange={e => setSmeData({...smeData, city: e.target.value})} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-8 border-t">
              <Button className="ml-auto rounded-xl font-black px-8 h-12 shadow-lg" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {profile?.role === 'consultant' && (
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-primary">
              <Award className="h-6 w-6" /> Expert Console Setup
            </CardTitle>
            <CardDescription className="font-medium">Define your professional expertise and jurisdiction.</CardDescription>
            <div className="absolute top-6 right-6 flex items-center gap-2 text-[10px] font-black uppercase text-primary bg-white px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="h-3 w-3" /> AI Verification Active
            </div>
          </CardHeader>
          <form onSubmit={handleConsSubmit}>
            <CardContent className="space-y-10 pt-8">
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Specializations</Label>
                <div className="grid grid-cols-1 gap-3">
                  {SERVICE_TAXONOMY.map((cat) => (
                    <div key={cat.id} className="border-2 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedCats(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-bold text-sm">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                            {cat.services.filter(s => consData.servicesOffered.includes(s.id)).length} SELECTED
                          </Badge>
                          {expandedCats.includes(cat.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>
                      {expandedCats.includes(cat.id) && (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border-t">
                          {cat.services.map((serv) => {
                            const isChecked = consData.servicesOffered.includes(serv.id);
                            return (
                              <label key={serv.id} className={cn("flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all", isChecked ? "bg-primary/5 border-primary" : "hover:bg-muted/30 border-transparent")}>
                                <input type="checkbox" className="h-4 w-4 rounded border-primary text-primary" checked={isChecked} onChange={() => setConsData({...consData, servicesOffered: isChecked ? consData.servicesOffered.filter(s => s !== serv.id) : [...consData.servicesOffered, serv.id]})} />
                                <span className="text-xs font-bold leading-tight">{serv.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identity & Contact</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Practice / Firm Name</Label>
                      <Input value={consData.companyName} onChange={e => setConsData({...consData, companyName: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><Mail className="h-3 w-3" /> Notification Email</Label>
                      <Input type="email" placeholder="For lead alerts" value={consData.notificationEmail} onChange={e => setConsData({...consData, notificationEmail: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Years Exp.</Label>
                        <Input type="number" value={consData.yearsExperience} onChange={e => setConsData({...consData, yearsExperience: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">City</Label>
                        <Input value={consData.city} onChange={e => setConsData({...consData, city: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Expert Bio</Label>
                    <Button type="button" variant="link" size="sm" onClick={handleAiEnhance} disabled={enhancing} className="text-primary font-black h-auto p-0">
                      {enhancing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI Enhance
                    </Button>
                  </div>
                  <Textarea className="min-h-[160px] text-sm leading-relaxed rounded-2xl" value={consData.description} onChange={e => setConsData({...consData, description: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">States Covered (CSV)</Label>
                <Input placeholder="Maharashtra, Karnataka..." value={consData.statesCovered} onChange={e => setConsData({...consData, statesCovered: e.target.value})} required />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-8 border-t">
              <Button className="ml-auto rounded-xl font-black px-8 h-12 shadow-lg" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Update Expert Console
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {profile?.role === 'partner' && (
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-amber-500/5 pb-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-amber-600">
              <Briefcase className="h-6 w-6" /> Partner Network Identity
            </CardTitle>
            <CardDescription className="font-medium">Details about your firm and service focus.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePartnerSubmit}>
            <CardContent className="space-y-8 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Partner Name / Firm</Label>
                  <Input value={partnerData.partnerName} onChange={e => setPartnerData({...partnerData, partnerName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Contact Phone</Label>
                  <Input value={partnerData.phone} onChange={e => setPartnerData({...partnerData, phone: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Base City</Label>
                <Input value={partnerData.city} onChange={e => setPartnerData({...partnerData, city: e.target.value})} required />
              </div>
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Services Focused On</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_TAXONOMY.map((cat) => {
                    const isChecked = partnerData.servicesFocus.includes(cat.id);
                    return (
                      <label key={cat.id} className={cn("flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all", isChecked ? "bg-amber-500/5 border-amber-500" : "hover:bg-muted/50 border-transparent")}>
                        <input type="checkbox" className="h-4 w-4 rounded border-amber-500 text-amber-600" checked={isChecked} onChange={() => setPartnerData({...partnerData, servicesFocus: isChecked ? partnerData.servicesFocus.filter(id => id !== cat.id) : [...partnerData.servicesFocus, cat.id]})} />
                        <span className="text-xs font-bold">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-8 border-t">
              <Button className="ml-auto rounded-xl font-black px-8 h-12 shadow-lg bg-amber-600 hover:bg-amber-700" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Save Partner Details
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
