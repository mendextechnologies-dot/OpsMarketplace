
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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Briefcase, FileText, ChevronRight } from "lucide-react";
import { SERVICE_TAXONOMY, getServiceName, getCategoryName } from "@/lib/constants";

export default function NewRequestPage() {
  const { profile, orgProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceId: "",
    urgency: "medium",
    description: "",
    additionalNotes: "",
  });

  const selectedCategory = SERVICE_TAXONOMY.find(c => c.id === formData.categoryId);

  const handleSubmit = async () => {
    if (!profile || !orgProfile) return;
    setLoading(true);

    try {
      const requestData = {
        userId: profile.id,
        categoryId: formData.categoryId,
        serviceId: formData.serviceId,
        serviceCategory: getServiceName(formData.serviceId), // compatibility
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

      // Trigger Matching
      const consultantsQuery = query(
        collection(db, "consultantProfiles"),
        where("statesCovered", "array-contains", orgProfile.state)
      );
      const consultantSnap = await getDocs(consultantsQuery);
      
      for (const doc of consultantSnap.docs) {
        const cData = doc.data();
        if (cData.servicesOffered?.includes(formData.serviceId)) {
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
        <p className="text-muted-foreground mb-8">
          We are currently matching you with qualified experts for <strong>{getServiceName(formData.serviceId)}</strong>.
          We will notify you when a consultant is assigned.
        </p>
        <Button size="lg" className="w-full" asChild>
          <Link href="/dashboard/sme">Return to Dashboard</Link>
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
                className={`cursor-pointer hover:border-primary transition-all group ${formData.categoryId === cat.id ? 'border-primary ring-2 ring-primary/10' : ''}`}
                onClick={() => {
                  setFormData({ ...formData, categoryId: cat.id, serviceId: "" });
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
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Specific Service in {selectedCategory?.name}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory?.services.map((serv) => (
              <Card 
                key={serv.id} 
                className={`cursor-pointer hover:border-primary transition-all group ${formData.serviceId === serv.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => {
                  setFormData({ ...formData, serviceId: serv.id });
                  setStep(3);
                }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium group-hover:text-primary">{serv.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="w-fit mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Change Service
            </Button>
            <CardTitle className="flex items-center gap-2 text-primary">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              {getServiceName(formData.serviceId)}
            </CardTitle>
            <CardDescription>
              Provide specific details for your requirement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Standard (Few weeks)</SelectItem>
                  <SelectItem value="medium">Important (This week)</SelectItem>
                  <SelectItem value="high">Urgent (Immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description of Requirement</Label>
              <Textarea
                placeholder="Details of what you need help with..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Reference / Notes (Optional)</Label>
              <Input
                placeholder="Any internal identifiers or specific constraints..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg shadow-lg group" onClick={handleSubmit} disabled={loading || !formData.description}>
              {loading ? "Submitting..." : "Post Requirement"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
