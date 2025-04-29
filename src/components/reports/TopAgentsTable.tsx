
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import PeriodSelector, { Period } from './PeriodSelector';
import AgentsTableHeader from './AgentsTableHeader';
import AgentTableRow from './AgentTableRow';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  const filteredAndSortedAgents = useMemo(() => {
    if (isLoading) return [];
    
    let filtered = agentData.filter(agent => 
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
  }, [agentData, searchTerm, sortBy, sortDirection, isLoading]);
  
  const handleSort = (column: 'name' | 'leads' | 'sales' | 'value' | 'conversion') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Top Agents Commerciaux</CardTitle>
          <PeriodSelector period={tablePeriod} setPeriod={setTablePeriod} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-gray-200 rounded-md w-full"
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
                    Aucun agent trouvé pour cette recherche
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
