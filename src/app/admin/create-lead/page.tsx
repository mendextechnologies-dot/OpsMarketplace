
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase-config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, User, Phone, Mail, Tag, ListChecks, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SERVICE_TAXONOMY } from "@/lib/constants";
import { cn, generateCompanyKey } from "@/lib/utils";

const SOURCES = [
  { id: "admin_manual", label: "Admin Manual" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "google", label: "Google" },
  { id: "cold_outreach", label: "Cold Outreach" },
  { id: "referral", label: "Referral" },
];

export default function AdminCreateLeadPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceIds: [] as string[],
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    employeeCount: "",
    state: "",
    city: "",
    description: "",
    leadSource: "admin_manual",
    urgency: "medium",
  });

  if (profile?.role !== "admin") {
    return (
      <div className="container mx-auto p-20 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">Return to Dashboard</Link>
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
      const isDuplicate = !dupSnap.empty;

      const leadData = {
        categoryId: formData.categoryId,
        serviceIds: formData.serviceIds,
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        employeeCount: parseInt(formData.employeeCount) || 0,
        state: formData.state,
        city: formData.city,
        companyUniqueKey: companyKey,
        duplicateFlag: isDuplicate,
        description: formData.description,
        status: "new",
        urgency: formData.urgency,
        leadSource: formData.leadSource,
        leadType: "outbound",
        leadOwnerType: "admin",
        leadOwnerId: profile.id,
        ownershipStatus: "active",
        createdByAdmin: true,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "serviceRequests"), leadData);

      toast({
        title: isDuplicate ? "Manual Lead Created (Duplicate Flagged)" : "Manual Lead Created",
        description: isDuplicate ? "Lead exists in system. Review in Conflicts panel." : "The lead has been added successfully.",
        variant: isDuplicate ? "destructive" : "default"
      });

      router.push("/dashboard/admin");
    } catch (error: any) {
      console.error("Firestore Index Error:", error);
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Console
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Log Compliance Intelligence</h1>
        <p className="text-muted-foreground">Add manually sourced payroll and compliance opportunities to the platform pipeline.</p>
      </div>

      <Card className="border-2 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Step 1: Classification</Label>
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v, serviceIds: [] })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pick Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TAXONOMY.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Lead Source</Label>
                  <Select
                    value={formData.leadSource}
                    onValueChange={(v) => setFormData({ ...formData, leadSource: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((src) => (
                        <SelectItem key={src.id} value={src.id}>{src.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Step 2: Specific Services
                </Label>
                {!formData.categoryId ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-xs text-muted-foreground italic">Select category first...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto p-3 border-2 rounded-xl bg-muted/10">
                    {selectedCategory?.services.map((serv) => {
                      const isSelected = formData.serviceIds.includes(serv.id);
                      return (
                        <label 
                          key={serv.id} 
                          className={cn(
                            "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors border-2",
                            isSelected ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-white border-transparent"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={isSelected}
                            onChange={() => toggleService(serv.id)}
                          />
                          <span className="text-xs font-medium flex-1">
                            {serv.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {formData.serviceIds.length > 0 && (
                  <p className="text-[10px] font-bold text-primary">{formData.serviceIds.length} services selected</p>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Step 3: Company Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 h-11"
                      placeholder="e.g. Acme Industries"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employee Count</Label>
                  <Input
                    className="h-11"
                    type="number"
                    placeholder="10"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 h-11"
                      placeholder="Full Name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    className="h-11"
                    placeholder="+91..."
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <Label>Contact Email</Label>
                  <Input
                    className="h-11"
                    type="email"
                    placeholder="name@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
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
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Step 4: Requirement Description</Label>
              <Textarea
                placeholder="Specific details about what the client needs..."
                className="min-h-[120px] text-base"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8 rounded-b-xl">
            <Button className="w-full h-14 text-lg shadow-lg" type="submit" disabled={loading || formData.serviceIds.length === 0}>
              {loading ? "Verifying data..." : "Create Outbound Lead"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
