
"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, ArrowLeft, ChevronRight, Tags } from "lucide-react";
import { SERVICE_TAXONOMY, getServiceNames, getCategoryName } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function NewRequestPage() {
  const { profile, orgProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceIds: [] as string[],
    urgency: "medium",
    description: "",
    additionalNotes: "",
  });

  const selectedCategory = SERVICE_TAXONOMY.find(c => c.id === formData.categoryId);

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async () => {
    if (!profile || !orgProfile) return;
    setLoading(true);

    try {
      const requestData = {
        userId: profile.id,
        categoryId: formData.categoryId,
        serviceIds: formData.serviceIds,
        urgency: formData.urgency,
        description: formData.description,
        additionalNotes: formData.additionalNotes,
        companyName: orgProfile.companyName,
        employeeCount: orgProfile.employeeCount,
        state: orgProfile.state,
        city: orgProfile.city,
        status: "new",
        leadType: "inbound",
        leadSource: "platform",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "serviceRequests"), requestData);

      // Trigger Matching - find consultants who offer ANY of the selected services
      const consultantsQuery = query(
        collection(db, "consultantProfiles"),
        where("statesCovered", "array-contains", orgProfile.state)
      );
      const consultantSnap = await getDocs(consultantsQuery);
      
      for (const doc of consultantSnap.docs) {
        const cData = doc.data();
        const matchesService = cData.servicesOffered?.some((sId: string) => formData.serviceIds.includes(sId));
        
        if (matchesService) {
          await addDoc(collection(db, "leadAssignments"), {
            requestId: docRef.id,
            consultantId: doc.id,
            status: "sent",
            createdAt: serverTimestamp(),
          });
        }
      }

      setStep(4);
      toast({ title: "Request Submitted", description: "Finding matching experts..." });
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
        <h1 className="text-3xl font-headline font-extrabold mb-4 text-primary">Requirement Received</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          We are currently matching you with qualified experts for: <br />
          <span className="font-bold text-foreground">{getServiceNames(formData.serviceIds)}</span>.
          We will notify you when a consultant is assigned.
        </p>
        <Button size="lg" className="w-full" asChild>
          <Link href="/dashboard/sme">Go to Tracking Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-headline font-bold text-primary">New Service Request</h1>
        <p className="text-muted-foreground">Streamlined operational support for {orgProfile?.companyName}.</p>
      </div>

      {step === 1 && (
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Select Specific Services
            </h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {formData.serviceIds.length} Selected
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Choose one or more services required in <strong>{selectedCategory?.name}</strong>:</p>
          
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory?.services.map((serv) => {
              const isSelected = formData.serviceIds.includes(serv.id);
              return (
                <div 
                  key={serv.id} 
                  className={cn(
                    "flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "hover:border-primary/40 bg-white"
                  )}
                  onClick={() => toggleService(serv.id)}
                >
                  <Checkbox 
                    id={serv.id}
                    checked={isSelected}
                    className="h-5 w-5 pointer-events-none"
                    onCheckedChange={() => {}} // Controlled by parent div onClick
                  />
                  <div className="flex-1">
                    <Label htmlFor={serv.id} className="text-base font-semibold cursor-pointer block">
                      {serv.name}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="pt-8 sticky bottom-4">
            <Button 
              className="w-full h-14 text-lg shadow-xl" 
              size="lg" 
              disabled={formData.serviceIds.length === 0} 
              onClick={() => setStep(3)}
            >
              Continue to Details <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="w-fit mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Change Services
            </Button>
            <CardTitle className="flex items-center gap-2 text-primary">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Finalize Your Request
            </CardTitle>
            <CardDescription>
              We'll use these details to find the best expert match.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-xl border border-muted space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                <Tags className="h-3 w-3" /> Selected Requirements
              </Label>
              <p className="text-sm font-bold text-foreground leading-tight">{getServiceNames(formData.serviceIds)}</p>
            </div>

            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Standard (Few weeks)</SelectItem>
                  <SelectItem value="medium">Important (This week)</SelectItem>
                  <SelectItem value="high">Urgent (Immediate Support)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Describe what you need help with</Label>
              <Textarea
                placeholder="Be as specific as possible (e.g. 'We need to register 5 employees for ESIC by Friday')"
                className="min-h-[150px] text-base"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Reference / Notes (Optional)</Label>
              <Input
                placeholder="Any internal IDs or specific constraints..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-14 text-lg shadow-lg group" onClick={handleSubmit} disabled={loading || !formData.description}>
              {loading ? "Submitting..." : "Post Requirement"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
