
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  name: string;
  leads: number;
  sales: number;
  value: string;
  conversion: number;
  change: number;
}

interface AgentTableRowProps {
  agent: Agent;
  simplified?: boolean;
  isTopAgent?: boolean;
}

const AgentTableRow = ({ agent, simplified = false, isTopAgent = false }: AgentTableRowProps) => {
  const trendColor = agent.change > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100";

  if (simplified) {
    return (
      <TableRow key={agent.name}>
        <TableCell className="font-medium whitespace-nowrap">{agent.name}</TableCell>
        <TableCell className="text-right font-medium">{agent.leads}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end">
            <span 
              className={cn(
                "flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                trendColor
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
    );
  }

  return (
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
  );
};

export default AgentTableRow;
