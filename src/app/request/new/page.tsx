
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
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, MapPin, Sparkles, Loader2 } from "lucide-react";
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
    urgency: "medium" as "low" | "medium" | "high",
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
      
      // Fuzzy match category
      const matchedCategory = SERVICE_TAXONOMY.find(cat => 
        cat.id === intent.serviceCategory || 
        cat.name.toLowerCase().includes(intent.serviceCategory.toLowerCase()) ||
        intent.serviceCategory.toLowerCase().includes(cat.name.toLowerCase())
      );

      // Fuzzy match specific services
      const matchedServiceIds: string[] = [];
      if (intent.specificServices && intent.specificServices.length > 0) {
        SERVICE_TAXONOMY.forEach(cat => {
          cat.services.forEach(serv => {
            const isMatch = intent.specificServices.some(s => 
              s.toLowerCase().includes(serv.name.toLowerCase()) || 
              serv.name.toLowerCase().includes(s.toLowerCase())
            );
            if (isMatch) {
              matchedServiceIds.push(serv.id);
            }
          });
        });
      }

      setFormData(prev => ({
        ...prev,
        categoryId: matchedCategory?.id || prev.categoryId,
        serviceIds: matchedServiceIds.length > 0 ? matchedServiceIds : prev.serviceIds,
        description: aiPrompt,
        urgency: intent.urgency,
        city: intent.location || prev.city,
      }));
      
      setMode('manual');
      setStep(2);
      toast({ title: "AI Intent Extracted", description: "Requirement details and services auto-filled." });
    } catch (error) {
      toast({ title: "AI Busy", description: "Could not process request. Falling back to manual.", variant: "destructive" });
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

      const leadQuality = await scoreLead({ 
        description: formData.description, 
        companyName: formData.companyName 
      });

      const requestData = {
        userId: user ? user.uid : null,
        isGuestRequest,
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
        createdById: user ? user.uid : null,
        createdByRole: user ? profile?.role : 'guest',
        createdByName: user ? profile?.name : "Guest",
        auditLog: [
          {
            event: "request_created",
            byId: user ? user.uid : null,
            byName: user ? profile?.name : "Guest",
            byRole: user ? profile?.role : "guest" : "guest",
            timestamp: serverTimestamp(),
            note: "Requirement submitted through the platform.",
          }
        ]
      };

      await addDoc(collection(db, "serviceRequests"), requestData);
      setStep(4); 
      toast({ title: "Requirement Published", description: "AI engine is now matching your lead." });
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4 text-primary">Requirement Logged</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          The AI engine has analyzed your requirement and is currently ranking the top specialists for <strong>{getServiceNames(formData.serviceIds)}</strong>.
        </p>
        <Button size="lg" className="w-full h-14" asChild>
          <Link href="/dashboard/sme">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> Compliance Intake Console
          </h1>
          <p className="text-muted-foreground mt-2">Tell us your payroll or compliance need once. Our intake AI pre-fills the request for accurate matching.</p>
        </div>
        <Button variant="outline" className="border-primary/20 text-primary" onClick={() => setMode(mode === 'ai' ? 'manual' : 'ai')}>
          {mode === 'ai' ? 'Switch to Manual Form' : 'Use AI Intake'}
        </Button>
      </div>

      {mode === 'ai' && step === 1 && (
        <Card className="border-2 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> SMART INTAKE
          </div>
          <CardHeader className="pt-8">
            <CardTitle>Describe Your Operational Need</CardTitle>
            <CardDescription>Our AI will extract category, location, and urgency automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Example: I need urgent Shop Act registration for my retail outlet in Mumbai. We have 5 employees and need this completed in 10 days."
              className="min-h-[160px] text-lg leading-relaxed p-6"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button 
              className="w-full h-14 text-lg font-bold group" 
              onClick={handleAiIntake}
              disabled={aiProcessing || !aiPrompt}
            >
              {aiProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Analyze & Auto-Fill
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === 'manual' && step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Service Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TAXONOMY.map((cat) => (
              <Card 
                key={cat.id} 
                className={cn(
                  "cursor-pointer hover:border-primary transition-all border-2",
                  formData.categoryId === cat.id ? 'border-primary bg-primary/5' : ''
                )}
                onClick={() => {
                  setFormData({ ...formData, categoryId: cat.id, serviceIds: [] });
                  setStep(2);
                }}
              >
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Change Category
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Select Specific Services
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory?.services.map((serv) => (
              <label 
                key={serv.id} 
                className={cn(
                  "flex items-center space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all", 
                  formData.serviceIds.includes(serv.id) ? "border-primary bg-primary/5 shadow-sm" : "bg-white hover:border-muted-foreground/30"
                )}
              >
                <input 
                  type="checkbox" 
                  className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" 
                  checked={formData.serviceIds.includes(serv.id)} 
                  onChange={() => handleToggleService(serv.id)} 
                />
                <span className="text-base font-semibold">{serv.name}</span>
              </label>
            ))}
            {!selectedCategory && (
              <div className="py-10 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                No category selected. Please go back and choose a category.
              </div>
            )}
          </div>
          
          <div className="pt-10">
            <Button className="w-full h-14 text-lg font-bold" disabled={formData.serviceIds.length === 0} onClick={() => setStep(3)}>
              Continue to Details
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Button>
          
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> AI Verification & Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {!user && (
                <div className="space-y-6">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Guest Contact Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Acme Ltd" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="+91" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" required />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Pune" required />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Requirement Audit</Label>
                <div className="space-y-2">
                  <Label>Urgency Level (AI Recommended)</Label>
                  <Select value={formData.urgency} onValueChange={(v: any) => setFormData({ ...formData, urgency: v })}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Standard Priority</SelectItem>
                      <SelectItem value="medium">Important (High Intent)</SelectItem>
                      <SelectItem value="high">Critical / Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Detailed Context</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="min-h-[140px] text-base leading-relaxed" 
                    placeholder="Describe your payroll, statutory filing, HRMS implementation, or compliance issue in detail..."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-8">
              <Button className="w-full h-14 text-lg font-bold shadow-xl" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Publish Compliance Request
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
