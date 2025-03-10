
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AgentsTableHeaderProps {
  onSort: (column: 'name' | 'leads' | 'sales' | 'value' | 'conversion') => void;
  sortBy: 'name' | 'leads' | 'sales' | 'value' | 'conversion' | null;
  sortDirection: 'asc' | 'desc';
}

const AgentsTableHeader = ({ onSort, sortBy, sortDirection }: AgentsTableHeaderProps) => {
  const renderSortIcon = (column: 'name' | 'leads' | 'sales' | 'value' | 'conversion') => {
    if (sortBy !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
      : <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };
  
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[200px] cursor-pointer hover:bg-gray-50"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center">
            Agent {renderSortIcon('name')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right whitespace-nowrap cursor-pointer hover:bg-gray-50"
          onClick={() => onSort('leads')}
        >
          <div className="flex items-center justify-end">
            Leads {renderSortIcon('leads')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right whitespace-nowrap cursor-pointer hover:bg-gray-50"
          onClick={() => onSort('sales')}
        >
          <div className="flex items-center justify-end">
            Ventes {renderSortIcon('sales')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right whitespace-nowrap cursor-pointer hover:bg-gray-50"
          onClick={() => onSort('value')}
        >
          <div className="flex items-center justify-end">
            Valeur {renderSortIcon('value')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right whitespace-nowrap cursor-pointer hover:bg-gray-50"
          onClick={() => onSort('conversion')}
        >
          <div className="flex items-center justify-end">
            Conversion {renderSortIcon('conversion')}
          </div>
        </TableHead>
        <TableHead className="text-right whitespace-nowrap">
          Tendance
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AgentsTableHeader;
