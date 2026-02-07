
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Labour Compliance",
  "PF/ESIC Registration",
  "Payroll Setup",
  "HR Policy Drafting",
  "Compliance Audit",
];

export default function NewRequestPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    serviceCategory: "",
    companyName: "",
    employeeCount: "",
    state: "",
    city: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const requestData = {
        userId: profile.id,
        ...formData,
        employeeCount: parseInt(formData.employeeCount),
        status: "new",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "serviceRequests"), requestData);

      // Simple Lead Matching Mock:
      // In a real app, this would be a Cloud Function.
      // We'll simulate finding consultants who match serviceCategory and state.
      const consultantsQuery = query(
        collection(db, "consultantProfiles"),
        where("statesCovered", "array-contains", formData.state)
      );
      const consultantSnap = await getDocs(consultantsQuery);
      
      for (const doc of consultantSnap.docs) {
        const profileData = doc.data();
        if (profileData.servicesOffered.includes(formData.serviceCategory)) {
          await addDoc(collection(db, "leadAssignments"), {
            requestId: docRef.id,
            consultantId: doc.id,
            status: "sent",
            createdAt: serverTimestamp(),
          });
        }
      }

      toast({ title: "Request Submitted", description: "Your request is live. Consultants will be matched soon." });
      router.push("/dashboard/sme");
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
          <CardTitle className="text-2xl font-headline">New Service Request</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Service Category</Label>
              <Select 
                onValueChange={(v) => setFormData({ ...formData, serviceCategory: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="ABC Solutions Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Requirement Details</Label>
              <Textarea
                id="description"
                placeholder="Describe your specific needs..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
