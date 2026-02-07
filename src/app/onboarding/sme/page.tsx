
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
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Phone, Users, Rocket } from "lucide-react";

export default function SMEOnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    state: "",
    city: "",
    contactPerson: profile?.name || "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const orgData = {
        userId: user.uid,
        companyName: formData.companyName,
        industry: formData.industry,
        employeeCount: parseInt(formData.employeeCount),
        state: formData.state,
        city: formData.city,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        createdAt: serverTimestamp(),
      };

      // 1. Create the organisation profile
      await setDoc(doc(db, "organisationProfiles", user.uid), orgData);

      // 2. Mark user as onboarded
      await updateDoc(doc(db, "users", user.uid), {
        onboarded: true
      });

      await refreshProfile();
      toast({ title: "Welcome aboard!", description: "Your profile is set up. Let's grow your business." });
      router.push("/dashboard/sme");
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold">Complete Your Setup</h1>
        <p className="text-muted-foreground">Tell us about your business so we can match you with the right experts.</p>
      </div>

      <Card className="border-2 shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Manufacturing"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employeeCount" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" /> Employee Count
                </Label>
                <Input
                  id="employeeCount"
                  type="number"
                  placeholder="10"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="state" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> State
                </Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person Name</Label>
              <Input
                id="contactPerson"
                placeholder="Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all" type="submit" disabled={loading}>
              {loading ? "Saving your profile..." : "Finish Onboarding"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
