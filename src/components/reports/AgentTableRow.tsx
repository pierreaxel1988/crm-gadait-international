
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
  id?: string;
}

interface AgentTableRowProps {
  agent: Agent;
  simplified?: boolean;
  isTopAgent?: boolean;
}

const AgentTableRow = ({ agent, simplified = false, isTopAgent = false }: AgentTableRowProps) => {
  // Simplified view for LeadsTabContent
  if (simplified) {
    return (
      <TableRow className={cn(
        "border-t border-gray-100 transition-colors",
        isTopAgent ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-gray-50/50"
      )}>
        <TableCell className="font-medium whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs",
              isTopAgent ? "bg-blue-600" : "bg-gray-500"
            )}>
              {agent.name.charAt(0)}
            </div>
            <span className={cn(isTopAgent && "font-semibold")}>
              {agent.name}
            </span>
            {isTopAgent && (
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Top
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right font-medium">
          <span className={cn(
            "px-3 py-1 rounded-full",
            isTopAgent ? "bg-blue-100" : ""
          )}>
            {agent.leads}
          </span>
        </TableCell>
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
  }

  // Full view for TopAgentsTable
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
