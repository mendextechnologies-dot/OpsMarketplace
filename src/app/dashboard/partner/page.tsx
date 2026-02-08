
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle2, LayoutGrid, ArrowRight, Building2, Tag, Zap } from "lucide-react";
import { getServiceNames, getCategoryName } from "@/lib/constants";

export default function PartnerDashboard() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!profile) return;
      const q = query(
        collection(db, "serviceRequests"),
        where("leadPartnerId", "==", profile.id),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchLeads();
  }, [profile]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary flex items-center gap-3">
            <Zap className="h-8 w-8 fill-primary" /> Partner Console
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Logged in as {profile?.name}. Track your channel leads and their matching progress.
          </p>
        </div>
        <Button size="lg" className="shadow-lg" asChild>
          <Link href="/partner/create-lead">
            <PlusCircle className="mr-2 h-5 w-5" />
            Submit New Lead
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Referred</p>
                <p className="text-3xl font-bold mt-1">{leads.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Assignments</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">
                  {leads.filter(l => l.status === 'assigned').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Deals</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {leads.filter(l => l.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>My Channel Leads</CardTitle>
          <CardDescription>Monitor progress of business requirements you've brought to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center animate-pulse text-muted-foreground italic">Fetching lead history...</div>
          ) : leads.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-xl">
              <Zap className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">You haven't submitted any leads yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/partner/create-lead">Log your first opportunity</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableRow className="bg-muted/30">
                    <TableHead>Client & Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Submitted On</TableHead>
                  </TableRow>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{lead.companyName}</p>
                        <p className="text-[10px] text-primary font-medium">{getCategoryName(lead.categoryId)}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1">{getServiceNames(lead.serviceIds)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {lead.city}, {lead.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.status === 'new' ? 'secondary' : 'default'} className="capitalize text-[9px]">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground">
                      {lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
