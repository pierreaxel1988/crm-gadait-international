
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AgentsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Agent</TableHead>
        <TableHead className="text-right whitespace-nowrap">Leads</TableHead>
        <TableHead className="text-right whitespace-nowrap">Ventes</TableHead>
        <TableHead className="text-right whitespace-nowrap">Valeur</TableHead>
        <TableHead className="text-right whitespace-nowrap">Conversion</TableHead>
        <TableHead className="text-right whitespace-nowrap">Tendance</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AgentsTableHeader;
