"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, ArrowLeft, ChevronRight, Building2, User, Phone, Mail, MapPin, Sparkles, Loader2 } from "lucide-react";
import { SERVICE_TAXONOMY, getServiceNames } from "@/lib/constants";
import { cn, generateCompanyKey } from "@/lib/utils";
import { extractIntent } from "@/ai/flows/intent-flow";
import { scoreLead } from "@/ai/flows/lead-scoring-flow";

export default function NewRequestPage() {
  const { user, profile, orgProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceIds: [] as string[],
    urgency: "medium",
    description: "",
    additionalNotes: "",
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    state: "",
    city: "",
    employeeCount: "",
  });

  useEffect(() => {
    if (profile && profile.role === 'sme' && orgProfile) {
      setFormData(prev => ({
        ...prev,
        companyName: orgProfile.companyName || "",
        contactName: profile.name || "",
        contactPhone: orgProfile.phone || "",
        contactEmail: profile.email || "",
        state: orgProfile.state || "",
        city: orgProfile.city || "",
        employeeCount: orgProfile.employeeCount?.toString() || "",
      }));
    }
  }, [profile, orgProfile]);

  const handleAiIntake = async () => {
    if (!aiPrompt) return;
    setAiProcessing(true);
    try {
      const intent = await extractIntent(aiPrompt);
      setFormData(prev => ({
        ...prev,
        categoryId: intent.serviceCategory,
        description: aiPrompt,
        urgency: intent.urgency,
        city: intent.location || prev.city,
      }));
      setMode('manual');
      setStep(2);
      toast({ title: "AI Matched Requirements", description: "Requirement extracted successfully." });
    } catch (error) {
      toast({ title: "AI Intake Failed", description: "Falling back to manual entry.", variant: "destructive" });
      setMode('manual');
    } finally {
      setAiProcessing(false);
    }
  };

  const selectedCategory = SERVICE_TAXONOMY.find(c => c.id === formData.categoryId);

  const handleToggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const isGuestRequest = !user;
      const companyKey = generateCompanyKey(formData.companyName, formData.city);

      // AI lead scoring before submission
      const leadQuality = await scoreLead({ description: formData.description, companyName: formData.companyName });

      const requestData = {
        userId: user ? user.uid : null,
        isGuestRequest: isGuestRequest,
        categoryId: formData.categoryId,
        serviceIds: formData.serviceIds,
        urgency: formData.urgency,
        description: formData.description,
        additionalNotes: formData.additionalNotes,
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        employeeCount: parseInt(formData.employeeCount) || 0,
        state: formData.state,
        city: formData.city,
        companyUniqueKey: companyKey,
        ai_metadata: {
          quality_score: leadQuality.score,
          intent_clarity: leadQuality.intentClarity,
          completeness: leadQuality.completeness,
          reasoning: leadQuality.reasoning
        },
        leadOwnerType: user ? (profile?.role === 'sme' ? 'sme' : 'admin') : 'sme',
        leadOwnerId: user ? user.uid : null,
        status: "new",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "serviceRequests"), requestData);
      setStep(4); 
      toast({ title: "Request Posted", description: "AI engine is now matching your lead." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-headline font-extrabold mb-4 text-primary">AI Matching Initialized</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          We are identifying the top 3 experts for <span className="font-bold text-foreground">{getServiceNames(formData.serviceIds)}</span> based on your specific intent.
        </p>
        <Button size="lg" className="w-full" asChild>
          <Link href="/dashboard/sme">Track AI Matches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> AI-First Service Intake
          </h1>
          <p className="text-muted-foreground">Smart matching for your operational needs.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMode(mode === 'ai' ? 'manual' : 'ai')}>
          Switch to {mode === 'ai' ? 'Manual Form' : 'AI Prompt'}
        </Button>
      </div>

      {mode === 'ai' && step === 1 && (
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg">Describe Your Need</CardTitle>
            <CardDescription>Tell our AI what you need help with in simple language.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Textarea 
              placeholder="Example: Need help with Factory Licence renewal for my unit in Mumbai. We have 45 employees."
              className="min-h-[150px] text-lg"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                className="w-full h-12 text-lg shadow-lg group" 
                onClick={handleAiIntake}
                disabled={aiProcessing || !aiPrompt}
              >
                {aiProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Analyze Requirement
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-3">
             <p className="text-[10px] text-muted-foreground italic">Our AI extract specific intent, location, and urgency automatically.</p>
          </CardFooter>
        </Card>
      )}

      {mode === 'manual' && step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Select Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TAXONOMY.map((cat) => (
              <Card 
                key={cat.id} 
                className={cn(
                  "cursor-pointer hover:border-primary transition-all group",
                  formData.categoryId === cat.id ? 'border-primary ring-2 ring-primary/10' : ''
                )}
                onClick={() => {
                  setFormData({ ...formData, categoryId: cat.id, serviceIds: [] });
                  setStep(2);
                }}
              >
                <CardContent className="pt-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Intake
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Confirm Specific Services
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory?.services.map((serv) => (
              <label key={serv.id} className={cn("flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all", formData.serviceIds.includes(serv.id) ? "border-primary bg-primary/5" : "bg-white")}>
                <input type="checkbox" className="h-5 w-5 pointer-events-none" checked={formData.serviceIds.includes(serv.id)} onChange={() => handleToggleService(serv.id)} />
                <span className="text-base font-semibold">{serv.name}</span>
              </label>
            ))}
          </div>
          
          <div className="pt-8">
            <Button className="w-full h-14 text-lg" disabled={formData.serviceIds.length === 0} onClick={() => setStep(3)}>
              Continue to Details <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
               <Sparkles className="h-5 w-5" /> AI Review & Confirm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <Input placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                <Input placeholder="Mobile Phone" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                <Input placeholder="State (e.g. Maharashtra)" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                <Input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Urgency Level (AI Suggested)</Label>
              <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Standard</SelectItem>
                  <SelectItem value="medium">High Intent</SelectItem>
                  <SelectItem value="high">Critical / Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Refined Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px]" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-14 text-lg font-bold" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Publish Smart Requirement
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
