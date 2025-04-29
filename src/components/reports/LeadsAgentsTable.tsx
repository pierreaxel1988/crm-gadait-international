
import React, { useState } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import SearchInput from './table/SearchInput';
import AgentsTableHeader from './table/AgentsTableHeader';
import AgentTableRow from './table/AgentTableRow';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadsData {
  name: string;
  semaine?: number;
  mois?: number;
  annee?: number;
  change: number;
}

interface LeadsAgentsTableProps {
  period: 'semaine' | 'mois' | 'annee';
  data: LeadsData[];
  isLoading?: boolean;
}

type SortColumn = 'name' | 'leads';
type SortDirection = 'asc' | 'desc';

const LeadsAgentsTable: React.FC<LeadsAgentsTableProps> = ({ period, data, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('leads');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const periodLabel = 
    period === 'semaine' ? 'Cette semaine' : 
    period === 'mois' ? 'Ce mois' : 'Cette année';

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedAgents = [...data]
    .filter(agent => agent.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const valueA = a[period] || 0;
        const valueB = b[period] || 0;
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
    });

  return (
    <div className="w-full space-y-4">
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        disabled={isLoading}
      />
      
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <AgentsTableHeader
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            periodLabel={periodLabel}
          />
          <TableBody>
            {isLoading ? (
              // Afficher des skeletons pendant le chargement
              Array(5).fill(0).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-6 w-[150px]" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-6 w-[50px] ml-auto" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-6 w-[70px] ml-auto" />
                  </td>
                </tr>
              ))
            ) : sortedAgents.length > 0 ? (
              sortedAgents.map((agent, index) => (
                <AgentTableRow
                  key={agent.name}
                  agent={agent}
                  period={period}
                  isTopAgent={index === 0}
                  change={agent.change}
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500 italic">
                  Aucun agent trouvé pour "{searchTerm}"
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsAgentsTable;
