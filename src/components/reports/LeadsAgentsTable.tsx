
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Search, X, ArrowUp, ArrowDown, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
    <div className="w-full space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un agent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border border-gray-200 rounded-md"
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
      
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-gray-50/80">
              <TableHead 
                className="w-[300px] cursor-pointer hover:bg-gray-100/80 px-4 py-3 text-sm font-medium text-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Agent commercial</span>
                  {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-100/80 px-4 py-3 text-sm font-medium text-gray-700"
                onClick={() => handleSort('leads')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Leads ({periodLabel})</span>
                  {renderSortIcon('leads')}
                </div>
              </TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-medium text-gray-700">Évolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAgents.length > 0 ? (
              sortedAgents.map((agent, index) => {
                const change = getChange(agent.name);
                const isTopAgent = index === 0;
                
                return (
                  <TableRow 
                    key={agent.name} 
                    className={cn(
                      "border-t border-gray-100 transition-colors",
                      isTopAgent ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-gray-50/50"
                    )}
                  >
                    <TableCell className="font-medium px-4 py-3 text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs",
                          isTopAgent ? "bg-blue-600" : "bg-gray-500"
                        )}>
                          {agent.name.charAt(0)}
                        </div>
                        <span className={cn(
                          isTopAgent && "font-semibold"
                        )}>
                          {agent.name}
                        </span>
                        {isTopAgent && !isMobile && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Top
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-4 py-3 text-gray-800 font-medium">
                      <span className={cn(
                        "px-3 py-1 rounded-full",
                        isTopAgent ? "bg-blue-100" : ""
                      )}>
                        {agent[period]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <div className="flex items-center justify-end">
                        <span 
                          className={cn(
                            "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            change > 0 
                              ? "text-green-700 bg-green-100" 
                              : "text-red-700 bg-red-100"
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
                <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                  Aucun agent trouvé pour "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsAgentsTable;
