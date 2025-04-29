
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGuaranteedAgents } from '@/services/teamMemberService';

interface LeadsByStageTableProps {
  period: string;
}

interface StageCount {
  [key: string]: number;
}

interface LeadStagesData {
  name: string;
  stages: StageCount;
  total: number;
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

const LeadsByStageTable: React.FC<LeadsByStageTableProps> = ({ period }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<LeadStagesData[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    // Fetch team members when component mounts
    const fetchTeamMembers = async () => {
      try {
        const { data: members, error } = await supabase
          .from('team_members')
          .select('id, name, role')
          .eq('role', 'commercial')
          .order('name');
          
        if (error) {
          console.error('Erreur lors du chargement des commerciaux:', error);
          return;
        }
        
        // Use the guaranteed agents as a fallback or merge with fetched data
        const guaranteedAgents = getGuaranteedAgents().filter(agent => 
          agent.role === 'agent' || agent.role === 'commercial'
        );
        
        // Combine and remove duplicates
        const allMembers = [...(members || []), ...guaranteedAgents];
        const uniqueMembers = Array.from(
          new Map(allMembers.map(m => [m.id, m])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));
        
        setTeamMembers(uniqueMembers);
      } catch (error) {
        console.error('Erreur inattendue:', error);
      }
    };
    
    fetchTeamMembers();
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [period, selectedAgent]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer les agents commerciaux
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('role', 'commercial');
        
      if (teamError) {
        console.error('Erreur lors du chargement des agents:', teamError);
        throw new Error(teamError.message);
      }
      
      // Préparer la requête pour les leads
      let leadsQuery = supabase
        .from('leads')
        .select('id, name, status, assigned_to')
        .gte('created_at', startDate.toISOString());
        
      // Filtrer par commercial si un est sélectionné
      if (selectedAgent !== "all") {
        leadsQuery = leadsQuery.eq('assigned_to', selectedAgent);
      }
        
      // Récupérer les leads
      const { data: leads, error: leadsError } = await leadsQuery;
        
      if (leadsError) {
        console.error('Erreur lors du chargement des leads:', leadsError);
        throw new Error(leadsError.message);
      }
      
      // Déterminer tous les statuts uniques pour les entêtes de colonnes
      const allStages = [...new Set(leads?.map(lead => lead.status))].filter(Boolean).sort();
      setStages(allStages);
      
      // Préparer les données par agent
      const agentData: LeadStagesData[] = teamMembers?.map(member => {
        const agentLeads = leads?.filter(lead => lead.assigned_to === member.id) || [];
        
        // Comptabiliser les leads par statut
        const stagesCount: StageCount = {};
        allStages.forEach(stage => {
          stagesCount[stage] = agentLeads.filter(lead => lead.status === stage).length;
        });
        
        return {
          name: member.name,
          stages: stagesCount,
          total: agentLeads.length
        };
      }) || [];
      
      // Si on ne filtre pas par agent spécifique, ajouter une ligne pour les leads non assignés
      if (selectedAgent === "all") {
        const unassignedLeads = leads?.filter(lead => !lead.assigned_to) || [];
        if (unassignedLeads.length > 0) {
          const unassignedStages: StageCount = {};
          allStages.forEach(stage => {
            unassignedStages[stage] = unassignedLeads.filter(lead => lead.status === stage).length;
          });
          
          agentData.push({
            name: "Non assigné",
            stages: unassignedStages,
            total: unassignedLeads.length
          });
        }
      }
      
      // Calculer les totaux par colonne
      const columnTotals: StageCount = {};
      allStages.forEach(stage => {
        columnTotals[stage] = leads?.filter(lead => lead.status === stage).length || 0;
      });
      
      // Ajouter une ligne de totaux
      agentData.push({
        name: "Total",
        stages: columnTotals,
        total: leads?.length || 0
      });
      
      setData(agentData);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads par commercial et stade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commercial</TableHead>
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <TableHead key={index}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    {[1, 2, 3, 4, 5].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Leads par commercial et stade</CardTitle>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les commerciaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les commerciaux</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Commercial</TableHead>
                {stages.map((stage) => (
                  <TableHead key={stage} className="text-center font-semibold">
                    {stage}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const isLastRow = index === data.length - 1;
                return (
                  <TableRow 
                    key={row.name} 
                    className={isLastRow ? "font-medium bg-muted/20" : ""}
                  >
                    <TableCell className="font-medium">{row.name}</TableCell>
                    {stages.map((stage) => (
                      <TableCell key={stage} className="text-center">
                        {row.stages[stage] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-medium">
                      {row.total}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsByStageTable;
