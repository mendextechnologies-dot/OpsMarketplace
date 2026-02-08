
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
import { ArrowLeft, Building2, MapPin, ListChecks, Zap, AlertTriangle } from "lucide-react";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn, generateCompanyKey } from "@/lib/utils";

export default function PartnerCreateLeadPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceIds: [] as string[],
    companyName: "",
    state: "",
    city: "",
    description: "",
    urgency: "medium",
    notes: "",
  });

  if (profile?.role !== "partner") {
    return (
      <div className="container mx-auto p-20 text-center">
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">Go to My Dashboard</Link>
        </Button>
      </div>
    );
  }

  const selectedCategory = SERVICE_TAXONOMY.find(c => c.id === formData.categoryId);

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.serviceIds.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one specific service", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const companyKey = generateCompanyKey(formData.companyName, formData.city);

      const dupQuery = query(
        collection(db, "serviceRequests"),
        where("companyUniqueKey", "==", companyKey),
        where("status", "!=", "completed")
      );
      const dupSnap = await getDocs(dupQuery);

      if (!dupSnap.empty) {
        toast({
          title: "Potential Duplicate",
          description: "This company already has an active request in the system. Contact admin for ownership disputes.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const leadData = {
        categoryId: formData.categoryId,
        serviceIds: formData.serviceIds,
        companyName: formData.companyName,
        state: formData.state,
        city: formData.city,
        companyUniqueKey: companyKey,
        description: formData.description,
        additionalNotes: formData.notes,
        urgency: formData.urgency,
        
        leadOwnerType: "partner",
        leadOwnerId: profile.id,
        leadPartnerId: profile.id,
        ownershipStatus: "active",
        duplicateFlag: false,
        consultantCommunicatesWith: "partner",
        
        status: "new",
        leadSource: "platform",
        leadType: "inbound",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "serviceRequests"), leadData);

      const consultantsQuery = query(
        collection(db, "consultantProfiles"),
        where("statesCovered", "array-contains", formData.state)
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

      toast({
        title: "Lead Logged Successfully",
        description: "Ownership assigned to your account.",
      });

      router.push("/dashboard/partner");
    } catch (error: any) {
      console.error("Firestore Index Error:", error);
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/partner">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Partner Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-3">
          <Zap className="h-8 w-8" /> Log Channel Lead
        </h1>
        <p className="text-muted-foreground">Submit a requirement on behalf of your client. You will be established as the lead owner.</p>
      </div>

      <Card className="border-2 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Service Classification</Label>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v, serviceIds: [] })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TAXONOMY.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(v) => setFormData({ ...formData, urgency: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Standard</SelectItem>
                      <SelectItem value="medium">High (Important)</SelectItem>
                      <SelectItem value="high">Immediate (Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> 2. Specific Sub-Services
                </Label>
                {!formData.categoryId ? (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-[10px] text-muted-foreground italic uppercase">Pick a category first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto p-4 border-2 rounded-xl bg-muted/10">
                    {selectedCategory?.services.map((serv) => {
                      const isSelected = formData.serviceIds.includes(serv.id);
                      return (
                        <label 
                          key={serv.id} 
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border-2",
                            isSelected ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-white border-transparent"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={isSelected}
                            onChange={() => toggleService(serv.id)}
                          />
                          <span className="text-xs font-semibold flex-1">
                            {serv.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">3. Client Details & Ownership</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <Label>Client Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 h-11"
                      placeholder="e.g. Acme Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    className="h-11"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    className="h-11"
                    placeholder="Pune"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirement Description</Label>
                <Textarea
                  placeholder="Detailed requirements for the expert..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Ownership Rule</p>
                  <p>By logging this lead, you establish primary ownership. If this company is already in our system, the submission will be flagged for admin review.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8">
            <Button className="w-full h-14 text-lg font-bold shadow-lg" type="submit" disabled={loading || formData.serviceIds.length === 0}>
              {loading ? "Verifying Ownership..." : "Secure Lead Ownership"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
