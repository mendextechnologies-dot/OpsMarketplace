
"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, ArrowLeft, ChevronRight, Tags, Building2, User, Phone, Mail, MapPin } from "lucide-react";
import { SERVICE_TAXONOMY, getServiceNames } from "@/lib/constants";
import { cn, generateCompanyKey } from "@/lib/utils";

export default function NewRequestPage() {
  const { user, profile, orgProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    categoryId: "",
    serviceIds: [] as string[],
    urgency: "medium",
    description: "",
    additionalNotes: "",
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    state: "",
    city: "",
    employeeCount: "",
  });

  useEffect(() => {
    if (profile && profile.role === 'sme' && orgProfile) {
      setFormData(prev => ({
        ...prev,
        companyName: orgProfile.companyName || "",
        contactName: profile.name || "",
        contactPhone: orgProfile.phone || "",
        contactEmail: profile.email || "",
        state: orgProfile.state || "",
        city: orgProfile.city || "",
        employeeCount: orgProfile.employeeCount?.toString() || "",
      }));
    }
  }, [profile, orgProfile]);

  const selectedCategory = SERVICE_TAXONOMY.find(c => c.id === formData.categoryId);

  const handleToggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const isGuestRequest = !user;
      const companyKey = generateCompanyKey(formData.companyName, formData.city);

      const dupQuery = query(
        collection(db, "serviceRequests"),
        where("companyUniqueKey", "==", companyKey),
        where("status", "!=", "completed")
      );
      const dupSnap = await getDocs(dupQuery);
      const isDuplicate = !dupSnap.empty;

      const requestData = {
        userId: user ? user.uid : null,
        isGuestRequest: isGuestRequest,
        categoryId: formData.categoryId,
        serviceIds: formData.serviceIds,
        urgency: formData.urgency,
        description: formData.description,
        additionalNotes: formData.additionalNotes,
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        employeeCount: parseInt(formData.employeeCount) || 0,
        state: formData.state,
        city: formData.city,
        companyUniqueKey: companyKey,
        duplicateFlag: isDuplicate,
        leadOwnerType: user ? (profile?.role === 'sme' ? 'sme' : 'admin') : 'sme',
        leadOwnerId: user ? user.uid : null,
        ownershipStatus: "active",
        status: "new",
        leadType: "inbound",
        leadSource: "platform",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "serviceRequests"), requestData);

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

      setStep(user ? 4 : 5); 
      toast({ title: "Request Submitted", description: isDuplicate ? "Lead logged (potential duplicate flagged)" : "Finding matching experts..." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === 5) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-headline font-extrabold mb-4 text-primary">Requirement Received</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          We are matching you with experts for: <span className="font-bold text-foreground">{getServiceNames(formData.serviceIds)}</span>.
          We will contact you on <span className="font-bold">{formData.contactPhone}</span> soon.
        </p>
        <Card className="bg-muted/30 border-dashed mb-8">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-2">Want to track progress online?</h3>
            <p className="text-xs text-muted-foreground mb-4">Create an account to manage this and future requests.</p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/signup?role=sme">Create SME Account</Link>
            </Button>
          </CardContent>
        </Card>
        <Button variant="ghost" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-headline font-extrabold mb-4 text-primary">Requirement Received</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Experts are being matched for <span className="font-bold text-foreground">{getServiceNames(formData.serviceIds)}</span>.
        </p>
        <Button size="lg" className="w-full" asChild>
          <Link href="/dashboard/sme">Go to Tracking Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-headline font-bold text-primary">Service Marketplace</h1>
        <p className="text-muted-foreground">Professional support for {user ? formData.companyName : "your business"}.</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Select Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TAXONOMY.map((cat) => (
              <Card 
                key={cat.id} 
                className={cn(
                  "cursor-pointer hover:border-primary transition-all group",
                  formData.categoryId === cat.id ? 'border-primary ring-2 ring-primary/10' : ''
                )}
                onClick={() => {
                  setFormData({ ...formData, categoryId: cat.id, serviceIds: [] });
                  setStep(2);
                }}
              >
                <CardContent className="pt-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Select Specific Services
            </h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {formData.serviceIds.length} Selected
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory?.services.map((serv) => {
              const isSelected = formData.serviceIds.includes(serv.id);
              return (
                <div 
                  key={serv.id} 
                  className={cn(
                    "flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40 bg-white"
                  )}
                  onClick={() => handleToggleService(serv.id)}
                >
                  <Checkbox 
                    checked={isSelected}
                    className="h-5 w-5 pointer-events-none"
                    onCheckedChange={() => {}} // Controlled by parent div
                  />
                  <div className="flex-1 pointer-events-none">
                    <span className="text-base font-semibold block">
                      {serv.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="pt-8">
            <Button 
              className="w-full h-14 text-lg shadow-xl" 
              size="lg" 
              disabled={formData.serviceIds.length === 0} 
              onClick={() => setStep(3)}
            >
              Continue to Details <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="w-fit mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
            <CardTitle className="flex items-center gap-2 text-primary">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Finalize Request
            </CardTitle>
            <CardDescription>
              {user ? "Confirm your details and requirement." : "Tell us about your business and requirement."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user && (
              <div className="space-y-6 pt-2 pb-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Building2 className="h-3 w-3" /> Company Name</Label>
                    <Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Acme Inc" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-3 w-3" /> Contact Name</Label>
                    <Input value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="John Doe" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-3 w-3" /> Phone Number</Label>
                    <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="+91..." required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-3 w-3" /> Email Address</Label>
                    <Input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder="john@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-3 w-3" /> State</Label>
                    <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" required />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Mumbai" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Employees</Label>
                    <Input type="number" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} placeholder="10" required />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Standard (Few weeks)</SelectItem>
                  <SelectItem value="medium">Important (This week)</SelectItem>
                  <SelectItem value="high">Urgent (Immediate Support)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Describe what you need help with</Label>
              <Textarea
                placeholder="Be as specific as possible..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-14 text-lg shadow-lg" 
              onClick={handleSubmit} 
              disabled={loading || !formData.description || !formData.companyName || !formData.contactPhone || !formData.state}
            >
              {loading ? "Submitting..." : user ? "Post Requirement" : "Submit Requirement (Guest)"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
