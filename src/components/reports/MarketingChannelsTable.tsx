
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketingData {
  name: string;
  cost: number;
  leads: number;
  sales: number;
  revenue: number;
}

interface MarketingChannelsTableProps {
  data: MarketingData[];
}

type SortField = 'name' | 'cost' | 'leads' | 'sales' | 'revenue' | 'roi' | 'cpl' | 'conversion';
type SortDirection = 'asc' | 'desc';

const MarketingChannelsTable: React.FC<MarketingChannelsTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('roi');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Calculer les métriques dérivées
  const tableData = data.map(item => ({
    ...item,
    roi: Math.round((item.revenue - item.cost) / item.cost * 100),
    cpl: Math.round(item.cost / item.leads),
    conversion: Math.round((item.sales / item.leads) * 100)
  }));
  
  // Trier les données
  const sortedData = [...tableData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Gérer le tri
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Helper pour les icônes de tri
  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              onClick={() => handleSort('name')}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Canal
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('cost')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Coût
                <SortIcon field="cost" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('leads')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Leads
                <SortIcon field="leads" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('cpl')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Coût/Lead
                <SortIcon field="cpl" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('sales')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Ventes
                <SortIcon field="sales" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('conversion')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Conversion
                <SortIcon field="conversion" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('revenue')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                Revenus
                <SortIcon field="revenue" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('roi')}
              className="cursor-pointer text-right"
            >
              <div className="flex items-center justify-end">
                ROI
                <SortIcon field="roi" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((channel) => (
            <TableRow key={channel.name} className="hover:bg-muted/30">
              <TableCell className="font-medium">{channel.name}</TableCell>
              <TableCell className="text-right">
                €{channel.cost.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {channel.leads}
              </TableCell>
              <TableCell className="text-right">
                €{channel.cpl}
              </TableCell>
              <TableCell className="text-right">
                {channel.sales}
              </TableCell>
              <TableCell className="text-right">
                {channel.conversion}%
              </TableCell>
              <TableCell className="text-right">
                €{(channel.revenue/1000).toFixed(0)}K
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {channel.roi > 200 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : channel.roi < 100 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={channel.roi >= 200 ? 'text-green-600 font-medium' : 
                                 channel.roi < 100 ? 'text-red-600 font-medium' : ''}>
                    {channel.roi}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MarketingChannelsTable;
