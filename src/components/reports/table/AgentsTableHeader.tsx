
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';

type SortColumn = 'name' | 'leads';
type SortDirection = 'asc' | 'desc';

interface AgentsTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  periodLabel: string;
}

const AgentsTableHeader = ({ sortColumn, sortDirection, onSort, periodLabel }: AgentsTableHeaderProps) => {
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  return (
    <TableHeader className="bg-gray-50">
      <TableRow className="hover:bg-gray-50/80">
        <TableHead 
          className="w-[300px] cursor-pointer hover:bg-gray-100/80 px-4 py-3 text-sm font-medium text-gray-700"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center space-x-1">
            <span>Agent commercial</span>
            {renderSortIcon('name')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-gray-100/80 px-4 py-3 text-sm font-medium text-gray-700"
          onClick={() => onSort('leads')}
        >
          <div className="flex items-center justify-end space-x-1">
            <span>Leads ({periodLabel})</span>
            {renderSortIcon('leads')}
          </div>
        </TableHead>
        <TableHead className="text-right px-4 py-3 text-sm font-medium text-gray-700">
          Évolution
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AgentsTableHeader;
