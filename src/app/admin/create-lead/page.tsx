
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PlusCircle, Building2, MapPin, User, Phone, Mail, Zap } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Labour Compliance",
  "PF/ESIC Registration",
  "Payroll Setup",
  "HR Policy Drafting",
  "Compliance Audit",
];

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
    serviceCategory: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leadData = {
        serviceCategory: formData.serviceCategory,
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        employeeCount: parseInt(formData.employeeCount) || 0,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        status: "new",
        urgency: formData.urgency,
        leadSource: formData.leadSource,
        leadType: "outbound",
        createdByAdmin: true,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "serviceRequests"), leadData);

      toast({
        title: "Lead Created",
        description: "The manual lead has been successfully added to the marketplace.",
      });

      router.push("/dashboard/admin");
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Manual Lead</h1>
        <p className="text-muted-foreground">Add a lead found via offline or external channels.</p>
      </div>

      <Card className="border-2 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select
                  value={formData.serviceCategory}
                  onValueChange={(v) => setFormData({ ...formData, serviceCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lead Source</Label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(v) => setFormData({ ...formData, leadSource: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((src) => (
                      <SelectItem key={src.id} value={src.id}>{src.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="e.g. Acme Industries"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                    className="pl-9"
                    placeholder="Full Name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Employee Count</Label>
                <Input
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
                <Label>Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="+91..."
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>State</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description of Requirement</Label>
              <Textarea
                placeholder="Details of what the client needs..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg" type="submit" disabled={loading || !formData.serviceCategory}>
              {loading ? "Saving Lead..." : "Create Lead"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
