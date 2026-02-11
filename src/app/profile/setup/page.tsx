
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Phone, Award, Mail, Info, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { enhanceProfile } from "@/ai/flows/profile-enhancer-flow";

export default function ProfileSetupPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    notificationEmail: "",
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

  const handleAiEnhance = async () => {
    if (!formData.description || formData.servicesOffered.length === 0) {
      toast({ title: "More info needed", description: "Enter a brief bio and select services first.", variant: "destructive" });
      return;
    }
    setEnhancing(true);
    try {
      const result = await enhanceProfile({
        rawBio: formData.description,
        services: formData.servicesOffered
      });
      setFormData(prev => ({
        ...prev,
        description: result.professionalBio,
      }));
      toast({ title: "Profile Enhanced", description: "AI has rewritten your bio for maximum impact." });
    } catch (error) {
      toast({ title: "AI Assistant Busy", description: "Could not enhance profile right now.", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
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
        notificationEmail: formData.notificationEmail || null,
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
      toast({ title: "Expert Console Ready", description: "Your professional profile is active." });
      router.push("/dashboard/consultant");
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-primary">Expert Identity Setup</h1>
        <p className="text-muted-foreground mt-2">Define your expertise for our curated matching engine.</p>
      </div>

      <Card className="border-2 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> AI PROFILE VERIFICATION
        </div>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-10 pt-10">
            <div className="space-y-6">
              <Label className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Specializations
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {SERVICE_TAXONOMY.map((cat) => (
                  <div key={cat.id} className="border-2 rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-bold text-sm">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                          {cat.services.filter(s => formData.servicesOffered.includes(s.id)).length} SELECTED
                        </Badge>
                        {expandedCats.includes(cat.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedCats.includes(cat.id) && (
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border-t">
                        {cat.services.map((serv) => {
                          const isChecked = formData.servicesOffered.includes(serv.id);
                          return (
                            <label 
                              key={serv.id} 
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                isChecked ? "bg-primary/5 border-primary" : "hover:bg-muted/30 border-transparent"
                              )}
                            >
                              <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-primary text-primary"
                                checked={isChecked}
                                onChange={() => handleServiceToggle(serv.id)}
                              />
                              <span className="text-xs font-medium leading-tight">{serv.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Practice Information</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Firm / Individual Name</Label>
                    <Input placeholder="e.g. Rahul Compliance & Associates" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-3 w-3" /> Notification Email (Optional)</Label>
                    <Input type="email" placeholder="leads@firm.com" value={formData.notificationEmail} onChange={e => setFormData({ ...formData, notificationEmail: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground italic">Defaults to account email if blank.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Years Exp.</Label>
                      <Input type="number" placeholder="10" value={formData.yearsExperience} onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary City</Label>
                      <Input placeholder="Pune" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                  Expert Bio
                  <button type="button" onClick={handleAiEnhance} disabled={enhancing} className="text-primary hover:underline flex items-center gap-1 normal-case font-bold">
                    {enhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Enhance
                  </button>
                </Label>
                <Textarea 
                  placeholder="Describe your specialization..." 
                  className="min-h-[145px] text-sm leading-relaxed" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Regional Jurisdiction</Label>
              <Input placeholder="Maharashtra, Karnataka, Gujarat (comma separated)" value={formData.statesCovered} onChange={e => setFormData({ ...formData, statesCovered: e.target.value })} required />
              <p className="text-[10px] text-muted-foreground italic">You will only be matched with leads in these specific states.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8 border-t">
            <Button className="w-full h-14 text-lg font-bold shadow-xl" type="submit" disabled={loading || formData.servicesOffered.length === 0}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Award className="mr-2 h-5 w-5" />}
              Activate Expert Console
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
