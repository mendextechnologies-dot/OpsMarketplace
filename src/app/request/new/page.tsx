
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
import { ShieldCheck, Zap, Users, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "Labour Compliance", icon: ShieldCheck, desc: "Law & regulation support" },
  { id: "PF/ESIC Registration", icon: CheckCircle2, desc: "Registration & filings" },
  { id: "Payroll Setup", icon: Zap, desc: "Automated salary systems" },
  { id: "HR Policy Drafting", icon: Users, desc: "Cultural framework design" },
  { id: "Compliance Audit", icon: ShieldAlert, desc: "Full gap analysis" },
];

export default function NewRequestPage() {
  const { profile, orgProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    serviceCategory: "",
    urgency: "medium",
    description: "",
    additionalNotes: "",
  });

  const handleSubmit = async () => {
    if (!profile || !orgProfile) return;
    setLoading(true);

    try {
      const requestData = {
        userId: profile.id,
        serviceCategory: formData.serviceCategory,
        urgency: formData.urgency,
        description: formData.description,
        additionalNotes: formData.additionalNotes,
        // Smart data from profile
        companyName: orgProfile.companyName,
        employeeCount: orgProfile.employeeCount,
        state: orgProfile.state,
        city: orgProfile.city,
        status: "new",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "serviceRequests"), requestData);

      // Trigger Matching Simulation
      const consultantsQuery = query(
        collection(db, "consultantProfiles"),
        where("statesCovered", "array-contains", orgProfile.state)
      );
      const consultantSnap = await getDocs(consultantsQuery);
      
      for (const doc of consultantSnap.docs) {
        const cData = doc.data();
        if (cData.servicesOffered?.includes(formData.serviceCategory)) {
          await addDoc(collection(db, "leadAssignments"), {
            requestId: docRef.id,
            consultantId: doc.id,
            status: "sent",
            createdAt: serverTimestamp(),
          });
        }
      }

      setStep(3);
      toast({ title: "Request Live", description: "Our engine is finding matching experts." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-headline font-extrabold mb-4">Request Submitted!</h1>
        <p className="text-muted-foreground mb-8">
          We are currently matching you with qualified experts for <strong>{formData.serviceCategory}</strong>.
          You'll be notified as soon as a consultant is assigned.
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
        <h1 className="text-3xl font-headline font-bold">Request a Service</h1>
        <p className="text-muted-foreground">Let us handle the operations while you grow your business.</p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <Card 
              key={cat.id} 
              className={`cursor-pointer hover:border-primary transition-all ${formData.serviceCategory === cat.id ? 'border-primary ring-2 ring-primary/10' : ''}`}
              onClick={() => {
                setFormData({ ...formData, serviceCategory: cat.id });
                setStep(2);
              }}
            >
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{cat.id}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Details for {formData.serviceCategory}
            </CardTitle>
            <CardDescription>
              We've pre-filled your company info ({orgProfile?.companyName}). Just tell us what you need.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="urgency">How urgent is this?</Label>
              <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Standard (Few weeks)</SelectItem>
                  <SelectItem value="medium">Important (This week)</SelectItem>
                  <SelectItem value="high">Urgent (ASAP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe your requirement</Label>
              <Textarea
                id="description"
                placeholder="e.g. We need help setting up our monthly PF filings for 25 employees..."
                className="min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Preferred contact time, specific constraints etc."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1 h-12 shadow-lg group" onClick={handleSubmit} disabled={loading || !formData.description}>
              {loading ? "Creating Request..." : "Submit Request"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
