
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  // Dans un cas réel, cette donnée proviendrait de l'API
  const getChange = (value: number): number => {
    // Cette fonction simule une différence avec la période précédente
    return Math.floor(Math.random() * 20) - 10; // Entre -10 et 10
  };

  const periodLabel = 
    period === 'semaine' ? 'Cette semaine' : 
    period === 'mois' ? 'Ce mois' : 'Cette année';

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Changer la direction si on clique sur la même colonne
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, définir le tri par défaut
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
        // Tri par nombre de leads
        return sortDirection === 'asc'
          ? a[period] - b[period]
          : b[period] - a[period];
      }
    });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  return (
    <div className="w-full overflow-auto space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un agent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[300px] cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              Agent commercial {renderSortIcon('name')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('leads')}
            >
              Leads ({periodLabel}) {renderSortIcon('leads')}
            </TableHead>
            <TableHead className="text-right">Évolution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAgents.length > 0 ? (
            sortedAgents.map((agent) => {
              const change = getChange(agent[period]);
              return (
                <TableRow key={agent.name}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-right">{agent[period]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <span 
                        className={cn(
                          "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          change > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                        )}
                      >
                        {change > 0 ? (
                          <ChevronUp className="mr-1 h-3 w-3" />
                        ) : (
                          <ChevronDown className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(change)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                Aucun agent trouvé pour "{searchTerm}"
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsAgentsTable;
