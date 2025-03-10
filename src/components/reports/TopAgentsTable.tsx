
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const TopAgentsTable = () => {
  // Données mockées pour le tableau des agents
  const agentsData = [
    { 
      name: 'Jade Diouane',
      leads: 12, 
      sales: 3, 
      value: '€4.8M', 
      conversion: 32,
      change: 15
    },
    { 
      name: 'Ophelie Durand',
      leads: 10, 
      sales: 2, 
      value: '€3.2M', 
      conversion: 28,
      change: 8
    },
    { 
      name: 'Jean Marc Perrissol',
      leads: 8, 
      sales: 2, 
      value: '€2.9M', 
      conversion: 25,
      change: -4
    },
    { 
      name: 'Jacques Charles',
      leads: 9, 
      sales: 1, 
      value: '€2.5M', 
      conversion: 20,
      change: 12
    },
    { 
      name: 'Sharon Ramdiane',
      leads: 7, 
      sales: 1, 
      value: '€1.9M', 
      conversion: 18,
      change: -2
    },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Top Agents Commerciaux</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
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
          <TableBody>
            {agentsData.map((agent) => (
              <TableRow key={agent.name}>
                <TableCell className="font-medium whitespace-nowrap">{agent.name}</TableCell>
                <TableCell className="text-right font-medium">{agent.leads}</TableCell>
                <TableCell className="text-right">{agent.sales}</TableCell>
                <TableCell className="text-right">{agent.value}</TableCell>
                <TableCell className="text-right">{agent.conversion}%</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <span 
                      className={cn(
                        "flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                        agent.change > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                      )}
                    >
                      {agent.change > 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(agent.change)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
