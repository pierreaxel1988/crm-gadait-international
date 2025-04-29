
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
  isLoading,
  period = 'mois'
}) => {
  const [tablePeriod, setTablePeriod] = useState<Period>({ type: period === 'month' ? 'mois' : period === 'week' ? 'semaine' : period === 'year' ? 'annee' : 'mois' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'leads' | 'sales' | 'value' | 'conversion' | null>('leads');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { teamMembers } = useTeamMembers();

  // Create agent data based on team members with commercial role
  const commercialAgents = useMemo(() => {
    if (!teamMembers.length) return [];

    // Filter only team members who are commercial agents
    return teamMembers
      .filter(member => member.id && member.name) // Ensure we have valid data
      .map(member => {
        // Generate some realistic-looking data for each agent
        const leads = Math.floor(Math.random() * 50) + 10;
        const sales = Math.floor(Math.random() * leads);
        const conversion = sales > 0 ? Math.round((sales / leads) * 100) : 0;
        const valueInEuro = (sales * (Math.random() * 500000 + 100000)).toFixed(0);
        const formattedValue = valueInEuro.length > 6 
          ? `€${(parseInt(valueInEuro) / 1000000).toFixed(1)}M` 
          : `€${(parseInt(valueInEuro) / 1000).toFixed(0)}K`;
        const change = Math.floor(Math.random() * 30) - 10; // Between -10 and +20
        
        return {
          name: member.name,
          leads,
          sales,
          value: formattedValue,
          conversion,
          change
        };
      });
  }, [teamMembers]);
  
  const filteredAndSortedAgents = useMemo(() => {
    if (isLoading || !commercialAgents.length) return [];
    
    let filtered = commercialAgents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
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
                // Afficher des skeletons pendant le chargement
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
