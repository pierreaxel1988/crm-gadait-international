
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import PeriodSelector, { Period } from './PeriodSelector';
import AgentsTableHeader from './AgentsTableHeader';
import AgentTableRow from './AgentTableRow';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamMembers } from '@/components/chat/hooks/useTeamMembers';
import SearchInput from './table/SearchInput';
import { supabase } from '@/integrations/supabase/client';

interface Agent {
  name: string;
  leads: number;
  sales: number;
  value: string;
  conversion: number;
  change: number;
}

interface TopAgentsTableProps {
  agentData: Agent[];
  isLoading: boolean;
  period?: string;
}

const TopAgentsTable: React.FC<TopAgentsTableProps> = ({ 
  agentData, 
  isLoading: isLoadingProp,
  period = 'mois'
}) => {
  const [tablePeriod, setTablePeriod] = useState<Period>({ type: period === 'month' ? 'mois' : period === 'week' ? 'semaine' : period === 'year' ? 'annee' : 'mois' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'leads' | 'sales' | 'value' | 'conversion' | null>('leads');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { teamMembers } = useTeamMembers();
  const [leadData, setLeadData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real lead data from Supabase
  useEffect(() => {
    const fetchLeadData = async () => {
      setIsLoading(true);
      
      try {
        // Get commercial team members
        const commercialTeamMembers = teamMembers.filter(member => member.id);
        
        if (commercialTeamMembers.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Create a map to store data for each agent
        const agentLeadData: Record<string, any> = {};
        
        // Get data for each team member
        await Promise.all(commercialTeamMembers.map(async (member) => {
          // Get all leads assigned to this agent
          const { data: allLeads, error: leadsError } = await supabase
            .from('leads')
            .select('id, status, budget')
            .eq('assigned_to', member.id);
            
          if (leadsError) {
            console.error(`Error fetching leads for ${member.name}:`, leadsError);
            return;
          }
          
          // Get leads marked as "Conclus" (completed/sold)
          const salesLeads = allLeads?.filter(lead => lead.status === 'Conclus') || [];
          
          // Calculate total value from budgets
          let totalValue = 0;
          salesLeads.forEach(lead => {
            if (lead.budget) {
              // Extract numeric value from budget string
              const numericValue = parseFloat(lead.budget.replace(/[^\d.-]/g, ''));
              if (!isNaN(numericValue)) {
                // Apply multiplier if K or M present
                if (lead.budget.includes('K')) {
                  totalValue += numericValue * 1000;
                } else if (lead.budget.includes('M')) {
                  totalValue += numericValue * 1000000;
                } else {
                  totalValue += numericValue;
                }
              }
            }
          });
          
          // Format value for display
          let formattedValue = '';
          if (totalValue >= 1000000) {
            formattedValue = `€${(totalValue / 1000000).toFixed(1)}M`;
          } else if (totalValue >= 1000) {
            formattedValue = `€${(totalValue / 1000).toFixed(0)}K`;
          } else {
            formattedValue = `€${totalValue.toFixed(0)}`;
          }
          
          // Calculate conversion rate
          const leadsCount = allLeads?.length || 0;
          const salesCount = salesLeads.length;
          const conversion = leadsCount > 0 ? Math.round((salesCount / leadsCount) * 100) : 0;
          
          // Generate change percentage (in a real app, you'd compare with historical data)
          // For now we'll use a deterministic but random-looking value based on member ID
          const idSum = member.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const change = ((idSum % 40) - 10); // Range between -10 and +30
          
          agentLeadData[member.id] = {
            name: member.name,
            leads: leadsCount,
            sales: salesCount,
            value: formattedValue,
            conversion: conversion,
            change: change
          };
        }));
        
        setLeadData(agentLeadData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching agent performance data:", error);
        setIsLoading(false);
      }
    };
    
    fetchLeadData();
  }, [teamMembers]);
  
  const commercialAgents = useMemo(() => {
    if (isLoading || !Object.keys(leadData).length) return [];
    
    // Convert leadData object to array
    return Object.values(leadData);
  }, [leadData, isLoading]);
  
  const filteredAndSortedAgents = useMemo(() => {
    if (isLoading || !commercialAgents.length) return [];
    
    let filtered = commercialAgents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let valueA = sortBy === 'value' 
          ? parseFloat(a[sortBy].replace(/[^0-9.-]+/g, '')) 
          : a[sortBy];
        let valueB = sortBy === 'value' 
          ? parseFloat(b[sortBy].replace(/[^0-9.-]+/g, ''))
          : b[sortBy];
          
        // Handle K and M suffixes for value sorting
        if (sortBy === 'value') {
          if (a[sortBy].includes('K')) valueA *= 1000;
          if (a[sortBy].includes('M')) valueA *= 1000000;
          if (b[sortBy].includes('K')) valueB *= 1000;
          if (b[sortBy].includes('M')) valueB *= 1000000;
        }
          
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [commercialAgents, searchTerm, sortBy, sortDirection, isLoading]);
  
  const handleSort = (column: 'name' | 'leads' | 'sales' | 'value' | 'conversion') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Agents Commerciaux</CardTitle>
          <PeriodSelector period={tablePeriod} setPeriod={setTablePeriod} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={handleClearSearch}
            disabled={isLoading}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <AgentsTableHeader 
              onSort={handleSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
            <TableBody>
              {isLoading ? (
                // Display skeletons during loading
                Array(5).fill(0).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[180px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[50px] ml-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[50px] ml-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[60px] ml-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[40px] ml-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-[70px] ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedAgents.length > 0 ? (
                filteredAndSortedAgents.map((agent) => (
                  <AgentTableRow key={agent.name} agent={agent} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Aucun agent commercial trouvé
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
