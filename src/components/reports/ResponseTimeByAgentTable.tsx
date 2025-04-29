
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { formatResponseTime } from '@/utils/formatUtils';
import { supabase } from '@/integrations/supabase/client';

interface AgentResponseData {
  agentId: string;
  avgResponseTime: number;
  leadsCount: number;
  name?: string;
}

interface ResponseTimeByAgentTableProps {
  data: AgentResponseData[];
  isLoading: boolean;
}

const ResponseTimeByAgentTable: React.FC<ResponseTimeByAgentTableProps> = ({ data, isLoading }) => {
  const [agentsWithNames, setAgentsWithNames] = useState<AgentResponseData[]>([]);
  
  useEffect(() => {
    const fetchAgentNames = async () => {
      if (!data.length) return;
      
      // Extract unique agent IDs
      const agentIds = data.map(item => item.agentId);
      
      // Fetch agent names from team_members table
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('id, name')
        .in('id', agentIds);
      
      if (error) {
        console.error('Error fetching agent names:', error);
        return;
      }
      
      // Map names to response data
      const dataWithNames = data.map(item => {
        const matchingMember = teamMembers?.find(member => member.id === item.agentId);
        return {
          ...item,
          name: matchingMember?.name || 'Agent inconnu'
        };
      });
      
      setAgentsWithNames(dataWithNames);
    };
    
    fetchAgentNames();
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-none shadow-luxury">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="font-futura text-xl text-gray-800">Temps de réponse par commercial</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-futura text-gray-700">Commercial</TableHead>
                  <TableHead className="font-futura text-gray-700 text-right">Temps moyen</TableHead>
                  <TableHead className="font-futura text-gray-700 text-right">Leads traités</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
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
    <Card className="border-none shadow-luxury overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="font-futura text-xl text-gray-800">Temps de réponse par commercial</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-futura text-gray-700 px-6 py-4">Commercial</TableHead>
                <TableHead className="font-futura text-gray-700 text-right px-6 py-4">Temps moyen</TableHead>
                <TableHead className="font-futura text-gray-700 text-right px-6 py-4">Leads traités</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentsWithNames.length > 0 ? (
                agentsWithNames.map((agent) => (
                  <TableRow key={agent.agentId} className="hover:bg-gray-50/30">
                    <TableCell className="px-6 py-4 font-medium">{agent.name}</TableCell>
                    <TableCell className="text-right px-6 py-4">
                      {formatResponseTime(agent.avgResponseTime)}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">{agent.leadsCount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                    Aucune donnée disponible pour cette période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseTimeByAgentTable;
