"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Phone, Building2, Briefcase, CheckCircle2, LayoutGrid, Clock, ArrowRight, Sparkles, TrendingUp, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [consultantData, setConsultantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      
      const [leadsSnap, profileSnap] = await Promise.all([
        getDocs(query(collection(db, "leadAssignments"), where("consultantId", "==", profile.id), orderBy("createdAt", "desc"))),
        getDoc(doc(db, "consultantProfiles", profile.id))
      ]);
      
      setConsultantData(profileSnap.data());
      
      const leadsWithDetails = await Promise.all(
        leadsSnap.docs.map(async (assignmentDoc) => {
          const assignment = assignmentDoc.data();
          const requestSnap = await getDoc(doc(db, "serviceRequests", assignment.requestId));
          const reqData = requestSnap.data() || {};
          
          return {
            id: assignmentDoc.id,
            assignmentStatus: assignment.status,
            ...reqData,
            requestId: assignment.requestId,
            assignmentId: assignmentDoc.id
          };
        })
      );
      
      // Dynamic Ranking Logic: Score = Lead Quality * Provider Performance Multiplier
      const perfMultiplier = consultantData?.performance_multiplier || 1.0;
      const rankedLeads = leadsWithDetails.sort((a, b) => {
        const scoreA = (a.ai_metadata?.quality_score || 0) * perfMultiplier;
        const scoreB = (b.ai_metadata?.quality_score || 0) * perfMultiplier;
        return scoreB - scoreA;
      });
      
      setLeads(rankedLeads);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const newLeads = leads.filter(l => l.assignmentStatus === 'sent' || l.assignmentStatus === 'viewed');
  const activeWork = leads.filter(l => l.assignmentStatus === 'accepted');

  const LeadCard = ({ lead }: { lead: any }) => (
    <Card key={lead.id} className="hover:border-primary/50 transition-all shadow-md group relative overflow-hidden">
      {lead.ai_metadata?.quality_score > 7 && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> HIGH QUALITY MATCH
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-primary">{lead.serviceCategory || 'Service Opportunity'}</CardTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              AI MATCH SCORE: {lead.ai_metadata?.quality_score || 'Calculating...'} / 10
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold truncate">{lead.companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{lead.city}</span>
          </div>
        </div>
        <div className="pt-3 border-t">
          <p className="text-xs line-clamp-2 text-muted-foreground italic">
            "{lead.description}"
          </p>
        </div>
        {lead.ai_metadata?.reasoning && (
          <div className="p-2 bg-primary/5 rounded border border-primary/10 text-[10px] text-primary/80">
            <strong>AI Recommendation:</strong> {lead.ai_metadata.reasoning}
          </div>
        )}
      </CardContent>
      <CardContent className="pt-0 border-t bg-secondary/5 py-4 flex justify-between items-center">
        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
          {lead.urgency} Urgency
        </Badge>
        <Button size="sm" asChild className="group h-8 text-xs">
          <Link href={`/leads/${lead.requestId}`}>
            Review Opportunity
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-primary flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" /> Expert Performance Console
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Opportunities ranked by AI based on your performance and lead quality.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Ranked Matches</p>
                <p className="text-3xl font-bold mt-1 text-primary">{newLeads.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ranking Health</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">Optimal</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Response</p>
                <p className="text-3xl font-bold mt-1 text-green-600">45m</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Market Standing</p>
                <p className="text-3xl font-bold mt-1 text-slate-700">Top 5%</p>
              </div>
              <div className="bg-slate-200 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="bg-muted/80 p-1 mb-8">
          <TabsTrigger value="new" className="px-8 font-bold text-xs uppercase tracking-widest">
            AI Dynamic Ranking ({newLeads.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="px-8 font-bold text-xs uppercase tracking-widest">
            Ongoing Delivery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          {loading ? (
            <div className="text-center py-20 animate-pulse text-muted-foreground italic">Running dynamic ranking engine...</div>
          ) : newLeads.length === 0 ? (
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="py-20 text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-foreground">No matches currently</h3>
                <p className="max-w-xs mx-auto mt-2">The AI is scanning for requirements that perfectly align with your current performance tier.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWork.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
