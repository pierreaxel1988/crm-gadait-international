
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImportStat, formatDate, getSuccessRate, getStatusBadge } from '../utils/statsUtils';

interface ImportHistoryTableProps {
  stats: ImportStat[];
}

const ImportHistoryTable: React.FC<ImportHistoryTableProps> = ({ stats }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Importés</TableHead>
          <TableHead className="text-right">Mis à jour</TableHead>
          <TableHead className="text-right">Doublons</TableHead>
          <TableHead className="text-right">Erreurs</TableHead>
          <TableHead className="text-right">Taux de succès</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat) => {
          const successRate = getSuccessRate(stat);
          return (
            <TableRow key={stat.id}>
              <TableCell>{formatDate(stat.import_date)}</TableCell>
              <TableCell className="font-medium">{stat.source_type}</TableCell>
              <TableCell className="text-right">{stat.total_count}</TableCell>
              <TableCell className="text-right">{stat.imported_count}</TableCell>
              <TableCell className="text-right">{stat.updated_count}</TableCell>
              <TableCell className="text-right">{stat.duplicates_count}</TableCell>
              <TableCell className="text-right">{stat.error_count}</TableCell>
              <TableCell className="text-right">{successRate}%</TableCell>
              <TableCell>{getStatusBadge(successRate)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ImportHistoryTable;
