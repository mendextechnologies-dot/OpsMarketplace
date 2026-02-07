
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const SERVICES = [
  "Labour Compliance",
  "PF/ESIC Registration",
  "Payroll Setup",
  "HR Policy Drafting",
  "Compliance Audit",
];

export default function ProfileSetupPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    city: "",
    description: "",
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
    if (!profile) return;
    setLoading(true);

    try {
      const consultantData = {
        userId: profile.id,
        name: profile.name,
        phone: formData.phone,
        city: formData.city,
        description: formData.description,
        servicesOffered: formData.servicesOffered,
        statesCovered: formData.statesCovered.split(",").map(s => s.trim()),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "consultantProfiles", profile.id), consultantData);

      toast({ title: "Profile Setup Complete", description: "You can now receive matching leads." });
      router.push("/dashboard/consultant");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Consultant Profile Setup</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Services You Offer</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox 
                      id={service} 
                      checked={formData.servicesOffered.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <Label htmlFor={service} className="text-sm font-normal">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Base City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Practice</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe your expertise and experience..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading || formData.servicesOffered.length === 0}>
              {loading ? "Saving Profile..." : "Complete Setup"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
