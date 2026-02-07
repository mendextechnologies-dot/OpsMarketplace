
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Phone, Building2, Briefcase } from "lucide-react";
import Link from "next/link";

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!profile) return;
      
      // Get lead assignments for this consultant
      const q = query(
        collection(db, "leadAssignments"),
        where("consultantId", "==", profile.id)
      );
      const snapshot = await getDocs(q);
      
      const leadsWithDetails = await Promise.all(
        snapshot.docs.map(async (assignmentDoc) => {
          const assignment = assignmentDoc.data();
          const requestSnap = await getDoc(doc(db, "serviceRequests", assignment.requestId));
          return {
            id: assignmentDoc.id,
            assignmentStatus: assignment.status,
            ...(requestSnap.data() || {}),
            requestId: assignment.requestId
          };
        })
      );
      
      setLeads(leadsWithDetails);
      setLoading(false);
    };
    fetchLeads();
  }, [profile]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-headline font-bold">Consultant Leads</h1>
        <p className="text-muted-foreground">Review and respond to matching SME requests.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading matching leads...</div>
      ) : leads.length === 0 ? (
        <Card className="bg-muted/50 border-dashed border-2">
          <CardContent className="py-20 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No matching leads found at the moment.</p>
            <p className="text-sm">We'll notify you when a new request matches your profile.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leads.map((lead) => (
            <Card key={lead.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-primary">{lead.serviceCategory}</CardTitle>
                <Badge variant={lead.assignmentStatus === 'sent' ? 'secondary' : 'default'}>
                  {lead.assignmentStatus}
                </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{lead.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.city}, {lead.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.employeeCount} Employees</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm line-clamp-2 italic text-muted-foreground">"{lead.description}"</p>
                  </div>
                </div>
              </CardContent>
              <CardContent className="pt-0 border-t bg-secondary/30 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Phone className="h-4 w-4" />
                  <span>Contact details available</span>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/leads/${lead.requestId}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
