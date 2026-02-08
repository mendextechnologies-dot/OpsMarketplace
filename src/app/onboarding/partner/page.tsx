
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
import { Users, Phone, MapPin, Briefcase, Zap } from "lucide-react";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PartnerOnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    partnerName: profile?.name || "",
    phone: "",
    city: "",
    servicesFocus: [] as string[],
  });

  const toggleServiceFocus = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      servicesFocus: prev.servicesFocus.includes(catId)
        ? prev.servicesFocus.filter(id => id !== catId)
        : [...prev.servicesFocus, catId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const partnerData = {
        userId: user.uid,
        partnerName: formData.partnerName,
        phone: formData.phone,
        city: formData.city,
        servicesFocus: formData.servicesFocus,
        status: "active",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "partnerProfiles", user.uid), partnerData);
      await updateDoc(doc(db, "users", user.uid), { onboarded: true });

      await refreshProfile();
      toast({ title: "Partner Profile Created", description: "Welcome to the Channel Partner Network." });
      router.push("/dashboard/partner");
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
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold">Partner Onboarding</h1>
        <p className="text-muted-foreground">Set up your profile to start bringing operational leads to the network.</p>
      </div>

      <Card className="border-2 shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="partnerName" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> Partner/Firm Name
                </Label>
                <Input
                  id="partnerName"
                  placeholder="e.g. Rahul & Associates"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Contact Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Primary City
              </Label>
              <Input
                id="city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-bold">Services You Focus On</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_TAXONOMY.map((cat) => {
                  const isChecked = formData.servicesFocus.includes(cat.id);
                  return (
                    <label 
                      key={cat.id} 
                      className={cn(
                        "flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                        isChecked ? "bg-primary/5 border-primary" : "hover:bg-muted/50 border-transparent"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={isChecked}
                        onChange={() => toggleServiceFocus(cat.id)}
                      />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg shadow-lg" type="submit" disabled={loading || formData.servicesFocus.length === 0}>
              {loading ? "Initializing..." : "Join Partner Network"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
