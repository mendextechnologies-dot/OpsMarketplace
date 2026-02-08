
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
import { PlusCircle, FileText, Clock, CheckCircle2, LayoutGrid, ArrowRight, Building2, Tag, Zap, ShieldCheck, AlertCircle } from "lucide-react";
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
        where("leadOwnerId", "==", profile.id),
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
            Logged in as {profile?.name}. Managing your secured lead ownership.
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total referred</p>
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Ownership</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">
                  {leads.filter(l => l.ownershipStatus === 'active').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duplicate Flags</p>
                <p className="text-3xl font-bold mt-1 text-red-600">
                  {leads.filter(l => l.duplicateFlag === true).length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>My Lead Registry</CardTitle>
          <CardDescription>Track the status and matching progress of leads you own.</CardDescription>
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
                    <TableHead>Ownership</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className={lead.duplicateFlag ? "bg-red-50/20" : ""}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{lead.companyName}</p>
                          {lead.duplicateFlag && (
                            <Badge variant="destructive" className="text-[8px] h-4">Potential Duplicate</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-primary font-medium">{getCategoryName(lead.categoryId)}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1">{getServiceNames(lead.serviceIds)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[9px] w-fit border-green-200 bg-green-50 text-green-700">
                          <ShieldCheck className="h-2 w-2 mr-1" /> Owned by You
                        </Badge>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                          Key: {lead.companyUniqueKey}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.status === 'new' ? 'secondary' : 'default'} className="capitalize text-[9px]">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-[10px]" asChild>
                         <Link href={`/request/${lead.id}`}>View Details</Link>
                      </Button>
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
