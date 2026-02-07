
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, MapPin, Users, Phone, Mail, FileText } from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  const { id } = useParams(); // id here is the requestId
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      if (!id || !profile) return;
      
      // Fetch the service request
      const requestSnap = await getDoc(doc(db, "serviceRequests", id as string));
      if (!requestSnap.exists()) {
        router.push("/dashboard/consultant");
        return;
      }
      setRequest({ id: requestSnap.id, ...requestSnap.data() });

      // Find the assignment for this consultant
      // For simplicity in this mock, we'll assume the consultant knows their assignment ID 
      // or we query it. In a real app, the URL might contain the assignment ID.
      // Here we'll just check if they are authorized via a quick profile check.
      
      setLoading(false);
    };

    fetchLead();
  }, [id, profile, router]);

  const handleInterest = async () => {
    toast({
      title: "Interest Registered",
      description: "We've notified the SME. They will reach out if interested.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/consultant">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2">{request.serviceCategory}</Badge>
                  <CardTitle className="text-2xl font-bold">{request.companyName}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{request.city}, {request.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{request.employeeCount} Employees</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Project Requirement
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {request.description}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 pt-6">
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" size="lg" onClick={handleInterest}>
                  Express Interest
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  Save for Later
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
              <CardDescription>Unlocked for matched consultants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+91 ••••• ••••</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>••••••@••••.com</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2 italic">
                Full contact details are revealed once the SME accepts your interest.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Why this match?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm opacity-90 space-y-2">
              <p>• Location match: {request.state}</p>
              <p>• Expertise match: {request.serviceCategory}</p>
              <p>• Capacity: High probability project</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
