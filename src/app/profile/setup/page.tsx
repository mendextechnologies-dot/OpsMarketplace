
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-config";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, MapPin, Phone, User, Award, Info } from "lucide-react";

const SERVICES = [
  "Labour Compliance",
  "PF/ESIC Registration",
  "Payroll Setup",
  "HR Policy Drafting",
  "Compliance Audit",
];

export default function ProfileSetupPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    city: "",
    description: "",
    yearsExperience: "",
    servicesOffered: [] as string[],
    statesCovered: "",
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      const consultantData = {
        userId: user.uid,
        name: profile.name,
        companyName: formData.companyName,
        phone: formData.phone,
        city: formData.city,
        description: formData.description,
        yearsExperience: parseInt(formData.yearsExperience),
        servicesOffered: formData.servicesOffered,
        statesCovered: formData.statesCovered.split(",").map(s => s.trim()),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "consultantProfiles", user.uid), consultantData);
      
      await updateDoc(doc(db, "users", user.uid), {
        onboarded: true
      });

      await refreshProfile();
      toast({ title: "Profile Setup Complete", description: "You will now receive verified service requests matching your expertise." });
      router.push("/dashboard/consultant");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold">Consultant Profile Setup</h1>
        <p className="text-muted-foreground">Define your expertise to start receiving matching leads.</p>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Info className="h-4 w-4" />
            <span>Value Proposition</span>
          </div>
          <CardDescription className="text-primary/80">
            You will receive verified service requests matching your expertise from SMEs across India.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="space-y-4">
              <Label className="text-base font-bold">Services You Offer (Select multiple)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map((service) => (
                  <div key={service} className="flex items-center space-x-2 bg-secondary/20 p-3 rounded-lg border border-secondary/50">
                    <Checkbox 
                      id={service} 
                      checked={formData.servicesOffered.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <Label htmlFor={service} className="text-sm font-medium cursor-pointer">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> Firm / Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Acme Consulting"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience" className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" /> Years Experience
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Contact Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Base City
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statesCovered">States Covered (comma separated)</Label>
              <Input
                id="statesCovered"
                placeholder="e.g. Maharashtra, Goa"
                value={formData.statesCovered}
                onChange={(e) => setFormData({ ...formData, statesCovered: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Bio / Expertise Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your specialization, past projects, and how you help SMEs..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg shadow-lg" type="submit" disabled={loading || formData.servicesOffered.length === 0}>
              {loading ? "Saving Profile..." : "Complete Setup"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
