
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Parameter {
  name: string;
  description: string;
}

interface ParametersTableProps {
  title: string;
  parameters: Parameter[];
}

const ParametersTable = ({ title, parameters }: ParametersTableProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-6 space-y-3">
      <h3 className="text-lg font-medium text-loro-navy">{title}</h3>
      <div className="overflow-hidden rounded-sm border border-border">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-1/3 py-3 text-left font-medium">Champ</TableHead>
                <TableHead className="py-3 text-left font-medium">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param, index) => (
                <TableRow key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <TableCell className="py-3 align-top whitespace-normal break-words">
                    <code className="text-xs md:text-sm rounded bg-muted px-1.5 py-0.5 font-mono text-loro-navy max-w-full inline-block break-words">{param.name}</code>
                  </TableCell>
                  <TableCell className="py-3 text-sm md:text-base whitespace-normal break-words">
                    <div className="max-w-prose">{param.description}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ParametersTable;
