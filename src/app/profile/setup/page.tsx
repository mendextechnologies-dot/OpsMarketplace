
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
import { Briefcase, MapPin, Phone, Award, Info, ChevronDown, ChevronUp } from "lucide-react";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ProfileSetupPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    city: "",
    description: "",
    yearsExperience: "",
    servicesOffered: [] as string[],
    statesCovered: "",
  });

  const toggleCategory = (catId: string) => {
    setExpandedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(serviceId)
        ? prev.servicesOffered.filter(s => s !== serviceId)
        : [...prev.servicesOffered, serviceId]
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
      await updateDoc(doc(db, "users", user.uid), { onboarded: true });

      await refreshProfile();
      toast({ title: "Expert Profile Ready", description: "You will now receive targeted leads matching your skills." });
      router.push("/dashboard/consultant");
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-primary">Consultant Onboarding</h1>
        <p className="text-muted-foreground">Select your specializations to match with SMEs.</p>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Info className="h-4 w-4" />
            <span>Structured Expertise</span>
          </div>
          <CardDescription>
            Accurate service selection helps our engine match you with the right leads.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="space-y-4">
              <Label className="text-base font-bold">Services You Offer</Label>
              <div className="space-y-2">
                {SERVICE_TAXONOMY.map((cat) => (
                  <div key={cat.id} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-semibold text-sm">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {cat.services.filter(s => formData.servicesOffered.includes(s.id)).length} selected
                        </span>
                        {expandedCats.includes(cat.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedCats.includes(cat.id) && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                        {cat.services.map((serv) => {
                          const isChecked = formData.servicesOffered.includes(serv.id);
                          return (
                            <div 
                              key={serv.id} 
                              className={cn(
                                "flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors",
                                isChecked ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
                              )}
                              onClick={() => handleServiceToggle(serv.id)}
                            >
                              <div className="pointer-events-none flex items-center space-x-2 w-full">
                                <Checkbox checked={isChecked} />
                                <span className="text-xs leading-tight flex-1">
                                  {serv.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> Company Name
                </Label>
                <Input
                  placeholder="Your firm name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" /> Years Experience
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone
                </Label>
                <Input
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> City
                </Label>
                <Input
                  placeholder="Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>States Covered (comma separated)</Label>
              <Input
                placeholder="Maharashtra, Karnataka"
                value={formData.statesCovered}
                onChange={(e) => setFormData({ ...formData, statesCovered: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Expert Bio</Label>
              <Textarea
                placeholder="Briefly describe your specialization..."
                className="min-h-[100px]"
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
