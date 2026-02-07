
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Phone, Building2, Briefcase, CheckCircle2, LayoutGrid, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!profile) return;
      
      const q = query(
        collection(db, "leadAssignments"),
        where("consultantId", "==", profile.id),
        orderBy("createdAt", "desc")
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
            requestId: assignment.requestId,
            assignmentId: assignmentDoc.id
          };
        })
      );
      
      setLeads(leadsWithDetails);
      setLoading(false);
    };
    fetchLeads();
  }, [profile]);

  const newLeads = leads.filter(l => l.assignmentStatus === 'sent' || l.assignmentStatus === 'viewed');
  const activeWork = leads.filter(l => l.assignmentStatus === 'accepted');
  const completedJobs = leads.filter(l => l.assignmentStatus === 'completed');

  const LeadCard = ({ lead }: { lead: any }) => (
    <Card key={lead.id} className="hover:border-primary/50 transition-all shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-primary">{lead.serviceCategory}</CardTitle>
          <p className="text-xs text-muted-foreground">Received {new Date(lead.createdAt?.seconds * 1000).toLocaleDateString()}</p>
        </div>
        <Badge variant={lead.assignmentStatus === 'sent' ? 'secondary' : 'default'} className="capitalize">
          {lead.assignmentStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate">{lead.companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{lead.city}, {lead.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{lead.employeeCount} Employees</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{lead.urgency} Urgency</span>
          </div>
        </div>
        <div className="pt-3 border-t">
          <p className="text-sm line-clamp-2 italic text-muted-foreground">"{lead.description}"</p>
        </div>
      </CardContent>
      <CardContent className="pt-0 border-t bg-secondary/10 py-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {lead.assignmentStatus === 'accepted' ? 'Contact details unlocked' : 'Express interest to unlock details'}
        </div>
        <Button size="sm" asChild className="group">
          <Link href={`/leads/${lead.requestId}`}>
            View Details
            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-primary">Expert Console</h1>
          <p className="text-muted-foreground mt-1 text-lg">Managing verified business opportunities for {profile?.name}.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/profile/setup">Edit Expert Profile</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">New Leads</p>
                <p className="text-3xl font-bold mt-1">{newLeads.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Work</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{activeWork.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{completedJobs.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="bg-muted/80 p-1 mb-8">
          <TabsTrigger value="new" className="px-8 flex gap-2">
            New Leads {newLeads.length > 0 && <Badge variant="secondary" className="h-5 px-1.5">{newLeads.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active" className="px-8">Active Work</TabsTrigger>
          <TabsTrigger value="completed" className="px-8">Completed Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          {loading ? (
            <div className="text-center py-20 animate-pulse text-muted-foreground">Fetching new opportunities...</div>
          ) : newLeads.length === 0 ? (
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="py-20 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-foreground">No new leads right now</h3>
                <p className="max-w-xs mx-auto mt-2">We'll notify you as soon as a request matching your expertise arrives.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeWork.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>No active projects currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeWork.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedJobs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>No completed jobs recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {completedJobs.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
