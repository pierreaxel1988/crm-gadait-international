
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SourceStats, getSuccessRateFromSource, getStatusBadge } from '../utils/statsUtils';

interface SourcePerformanceTableProps {
  sourceStats: SourceStats[];
}

const SourcePerformanceTable: React.FC<SourcePerformanceTableProps> = ({ sourceStats }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Performances par source</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total leads</TableHead>
              <TableHead className="text-right">Importés</TableHead>
              <TableHead className="text-right">Mis à jour</TableHead>
              <TableHead className="text-right">Doublons</TableHead>
              <TableHead className="text-right">Erreurs</TableHead>
              <TableHead className="text-right">Taux de succès</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sourceStats.map((source, i) => {
              const successRate = getSuccessRateFromSource(source);
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-right">{source.total}</TableCell>
                  <TableCell className="text-right">{source.imported}</TableCell>
                  <TableCell className="text-right">{source.updated}</TableCell>
                  <TableCell className="text-right">{source.duplicates}</TableCell>
                  <TableCell className="text-right">{source.errors}</TableCell>
                  <TableCell className="text-right">{successRate}%</TableCell>
                  <TableCell>{getStatusBadge(successRate)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SourcePerformanceTable;
