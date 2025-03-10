import React, { useState } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import SearchInput from './table/SearchInput';
import AgentsTableHeader from './table/AgentsTableHeader';
import AgentTableRow from './table/AgentTableRow';

interface LeadsData {
  name: string;
  semaine: number;
  mois: number;
  annee: number;
}

// En situation réelle, ces données viendraient de la base de données Supabase
const mockLeadsData: LeadsData[] = [
  { name: 'Jade Diouane', semaine: 4, mois: 12, annee: 85 },
  { name: 'Ophelie Durand', semaine: 3, mois: 10, annee: 62 },
  { name: 'Jean Marc Perrissol', semaine: 2, mois: 8, annee: 54 },
  { name: 'Jacques Charles', semaine: 3, mois: 9, annee: 48 },
  { name: 'Sharon Ramdiane', semaine: 1, mois: 7, annee: 35 },
];

interface LeadsAgentsTableProps {
  period: 'semaine' | 'mois' | 'annee';
}

type SortColumn = 'name' | 'leads';
type SortDirection = 'asc' | 'desc';

const LeadsAgentsTable: React.FC<LeadsAgentsTableProps> = ({ period }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('leads');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculer la différence par rapport à la période précédente
  const getChange = (agent: string): number => {
    // Cette fonction simule une évolution - en réalité, ces données viendraient de l'API
    const randomValues = {
      'Jade Diouane': 3,
      'Ophelie Durand': 2,
      'Jean Marc Perrissol': 9,
      'Jacques Charles': -10,
      'Sharon Ramdiane': -5
    };
    return randomValues[agent as keyof typeof randomValues] || 0;
  };

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

  const sortedAgents = [...mockLeadsData]
    .filter(agent => agent.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc'
          ? a[period] - b[period]
          : b[period] - a[period];
      }
    });

  return (
    <div className="w-full space-y-4">
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
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
            {sortedAgents.length > 0 ? (
              sortedAgents.map((agent, index) => (
                <AgentTableRow
                  key={agent.name}
                  agent={agent}
                  period={period}
                  isTopAgent={index === 0}
                  change={getChange(agent.name)}
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
