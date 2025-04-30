
import React from 'react';
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AgentsTableHeaderProps {
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: any) => void;
  periodLabel?: string;
  sortBy?: string | null;
  simplified?: boolean;
}

const AgentsTableHeader: React.FC<AgentsTableHeaderProps> = ({ 
  sortColumn, 
  sortDirection, 
  onSort,
  periodLabel,
  sortBy,
  simplified = false
}) => {
  const renderSortIcon = (column: string) => {
    const isActive = (sortColumn && sortColumn === column) || (sortBy && sortBy === column);
    const direction = sortDirection || 'asc';
    
    if (!isActive) return null;
    
    return direction === 'asc' ? 
      <ArrowUp className="ml-1 h-4 w-4 inline" /> : 
      <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };
  
  // Use the appropriate handler based on provided props
  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };
  
  // If it's the simplified version for the leads tab, show only agent name and leads columns
  if (simplified) {
    return (
      <TableHeader>
        <TableRow className="border-b border-gray-200 bg-gray-50/80">
          <TableHead className="w-[50%] py-3 text-gray-700">
            <button 
              className="flex items-center font-medium focus:outline-none"
              onClick={() => handleSort('name')}
            >
              Agent {renderSortIcon('name')}
            </button>
          </TableHead>
          <TableHead className="w-[25%] text-right py-3 text-gray-700">
            <button 
              className="flex items-center justify-end font-medium ml-auto focus:outline-none"
              onClick={() => handleSort('leads')}
            >
              Leads {periodLabel ? `(${periodLabel})` : ''} {renderSortIcon('leads')}
            </button>
          </TableHead>
          <TableHead className="w-[25%] text-right py-3 text-gray-700">
            <span className="flex items-center justify-end font-medium">Évolution</span>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  }
  
  // Full version with all columns
  return (
    <TableHeader>
      <TableRow className="border-b border-gray-200 bg-gray-50/80">
        <TableHead className="w-[25%] py-3 text-gray-700">
          <button 
            className="flex items-center font-medium focus:outline-none"
            onClick={() => handleSort('name')}
          >
            Agent {renderSortIcon('name')}
          </button>
        </TableHead>
        <TableHead className="text-right py-3 text-gray-700">
          <button 
            className="flex items-center justify-end font-medium ml-auto focus:outline-none"
            onClick={() => handleSort('leads')}
          >
            Leads {renderSortIcon('leads')}
          </button>
        </TableHead>
        <TableHead className="text-right py-3 text-gray-700">
          <button 
            className="flex items-center justify-end font-medium ml-auto focus:outline-none"
            onClick={() => handleSort('sales')}
          >
            Ventes {renderSortIcon('sales')}
          </button>
        </TableHead>
        <TableHead className="text-right py-3 text-gray-700">
          <button 
            className="flex items-center justify-end font-medium ml-auto focus:outline-none"
            onClick={() => handleSort('value')}
          >
            Volume {renderSortIcon('value')}
          </button>
        </TableHead>
        <TableHead className="text-right py-3 text-gray-700">
          <button 
            className="flex items-center justify-end font-medium ml-auto focus:outline-none"
            onClick={() => handleSort('conversion')}
          >
            Conv. {renderSortIcon('conversion')}
          </button>
        </TableHead>
        <TableHead className="text-right py-3 text-gray-700">
          <span className="flex items-center justify-end font-medium">Évolution</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AgentsTableHeader;
