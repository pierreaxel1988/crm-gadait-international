
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgentTableRowProps {
  agent: {
    name: string;
    [key: string]: any;
  };
  period: 'semaine' | 'mois' | 'annee';
  isTopAgent: boolean;
  change: number;
}

const AgentTableRow = ({ agent, period, isTopAgent, change }: AgentTableRowProps) => {
  const isMobile = useIsMobile();

  return (
    <TableRow 
      className={cn(
        "border-t border-gray-100 transition-colors",
        isTopAgent ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-gray-50/50"
      )}
    >
      <TableCell className="font-medium px-4 py-3 text-gray-800">
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
          {isTopAgent && !isMobile && (
            <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              Top
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right px-4 py-3 text-gray-800 font-medium">
        <span className={cn(
          "px-3 py-1 rounded-full",
          isTopAgent ? "bg-blue-100" : ""
        )}>
          {agent[period]}
        </span>
      </TableCell>
      <TableCell className="text-right px-4 py-3">
        <div className="flex items-center justify-end">
          <span 
            className={cn(
              "flex items-center px-2 py-1 rounded-full text-xs font-medium",
              change > 0 
                ? "text-green-700 bg-green-100" 
                : "text-red-700 bg-red-100"
            )}
          >
            {change > 0 ? (
              <ChevronUp className="mr-1 h-3 w-3" />
            ) : (
              <ChevronDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(change)}%
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AgentTableRow;
