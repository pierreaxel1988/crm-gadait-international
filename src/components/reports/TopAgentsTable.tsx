
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { agentsDataByPeriod, PeriodType } from './agentsData';
import PeriodSelector, { Period } from './PeriodSelector';
import AgentsTableHeader from './AgentsTableHeader';
import AgentTableRow from './AgentTableRow';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import SearchInput from './table/SearchInput';

const TopAgentsTable = ({ simplified = false }) => {
  const [period, setPeriod] = useState<Period>({ type: 'mois' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'leads' | 'sales' | 'value' | 'conversion' | null>('leads');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [realAgentsData, setRealAgentsData] = useState<any[]>([]);
  
  // Fetch real agent data from Supabase
  useEffect(() => {
    const fetchRealAgentsData = async () => {
      setIsLoading(true);
      try {
        // Get team members (agents)
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('role', 'commercial');
          
        if (teamError) {
          console.error('Error fetching team members:', teamError);
          return;
        }
        
        if (!teamMembers || teamMembers.length === 0) {
          console.log('No commercial team members found');
          setIsLoading(false);
          return;
        }
        
        // Get leads for each agent
        const agentData = await Promise.all(
          teamMembers.map(async (agent) => {
            // Get leads count
            const { count: leadsCount, error: leadsError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_to', agent.id);
              
            if (leadsError) {
              console.error(`Error fetching leads for ${agent.name}:`, leadsError);
              return null;
            }
            
            // Get converted leads (sales) - status is "Gagné"
            const { count: salesCount, error: salesError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_to', agent.id)
              .eq('status', 'Gagné');
              
            if (salesError) {
              console.error(`Error fetching sales for ${agent.name}:`, salesError);
              return null;
            }
            
            // Calculate conversion rate
            const conversionRate = leadsCount > 0 ? Math.round((salesCount / leadsCount) * 100) : 0;
            
            // Get total value of sales
            const { data: salesData, error: valueError } = await supabase
              .from('leads')
              .select('budget_min')
              .eq('assigned_to', agent.id)
              .eq('status', 'Gagné');
              
            if (valueError) {
              console.error(`Error fetching sales value for ${agent.name}:`, valueError);
              return null;
            }
            
            // Calculate total value from budget_min
            let totalValue = 0;
            salesData?.forEach(sale => {
              if (sale.budget_min) {
                const value = parseFloat(sale.budget_min.replace(/[^\d]/g, ''));
                if (!isNaN(value)) {
                  totalValue += value;
                }
              }
            });
            
            // Format total value as currency
            const formattedValue = `€${(totalValue / 1000000).toFixed(1)}M`;
            
            // Get change percentage (based on previous period - mock for now)
            // In a real implementation, this would compare with previous period's data
            const mockChange = Math.floor(Math.random() * 30) - 10; // Random between -10 and +20
            
            return {
              name: agent.name,
              leads: leadsCount || 0,
              sales: salesCount || 0,
              value: formattedValue,
              conversion: conversionRate,
              change: mockChange,
              id: agent.id
            };
          })
        );
        
        // Filter out null values (if any) and set data
        const validAgentData = agentData.filter(agent => agent !== null);
        setRealAgentsData(validAgentData);
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealAgentsData();
  }, [period]); // Re-fetch when period changes
  
  const filteredAndSortedAgents = useMemo(() => {
    // If there's real data, use it
    let sourceData = realAgentsData.length > 0 ? realAgentsData : 
      period.type === 'custom' 
        ? agentsDataByPeriod['mois']
        : agentsDataByPeriod[period.type as PeriodType];
    
    // Filter by search term
    let filtered = sourceData;
    
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort data
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let valueA = sortBy === 'value' 
          ? parseFloat(a[sortBy].replace('€', '').replace('M', '')) 
          : a[sortBy];
        let valueB = sortBy === 'value' 
          ? parseFloat(b[sortBy].replace('€', '').replace('M', '')) 
          : b[sortBy];
          
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [period, searchTerm, sortBy, sortDirection, realAgentsData]);
  
  const handleSort = (column: 'name' | 'leads' | 'sales' | 'value' | 'conversion') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Find top agent by leads count
  const topAgent = useMemo(() => {
    if (filteredAndSortedAgents.length === 0) return null;
    
    return filteredAndSortedAgents.reduce((max, agent) => 
      agent.leads > max.leads ? agent : max, filteredAndSortedAgents[0]);
  }, [filteredAndSortedAgents]);
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // If in simplified mode, render a streamlined version without header options
  if (simplified) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton loading={isLoading}>
            <div className="overflow-x-auto">
              <Table>
                <AgentsTableHeader 
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  simplified={true}
                />
                <TableBody>
                  {filteredAndSortedAgents.length > 0 ? (
                    filteredAndSortedAgents.map((agent) => (
                      <AgentTableRow 
                        key={agent.id || agent.name} 
                        agent={agent} 
                        simplified={true}
                        isTopAgent={topAgent && agent.name === topAgent.name}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        {isLoading ? "Chargement des données..." : "Aucun agent trouvé"}
                      </td>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </div>
          </Skeleton>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Top Agents Commerciaux</CardTitle>
          <PeriodSelector period={period} setPeriod={setPeriod} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />
        </div>
        
        <Skeleton loading={isLoading}>
          <div className="overflow-x-auto">
            <Table>
              <AgentsTableHeader 
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                simplified={false}
              />
              <TableBody>
                {filteredAndSortedAgents.length > 0 ? (
                  filteredAndSortedAgents.map((agent) => (
                    <AgentTableRow 
                      key={agent.id || agent.name} 
                      agent={agent}
                      simplified={false}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      {isLoading ? "Chargement des données..." : "Aucun agent trouvé pour cette recherche"}
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </Skeleton>
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
