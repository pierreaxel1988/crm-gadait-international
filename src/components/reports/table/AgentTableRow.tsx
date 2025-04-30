
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AgentTableRowProps {
  agent: {
    name: string;
    leads?: number;
    semaine?: number;
    mois?: number;
    annee?: number;
    sales?: number;
    value?: string;
    conversion?: number;
    change: number;
  };
  period?: 'semaine' | 'mois' | 'annee';
  isTopAgent?: boolean;
  simplified?: boolean;
}

const AgentTableRow: React.FC<AgentTableRowProps> = ({ 
  agent, 
  period = 'mois',
  isTopAgent = false,
  simplified = false
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const avatarColor = isTopAgent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
  const renderTrendIcon = () => {
    if (agent.change > 0) {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    } else if (agent.change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };
  
  const trendColor = agent.change > 0 ? "text-emerald-600" : agent.change < 0 ? "text-red-600" : "text-gray-500";
  
  // Get the leads value based on the period
  const leadsValue = agent[period] || agent.leads || 0;
  
  // If it's the simplified version used in leads tab, only show name, leads, and trend
  if (simplified) {
    return (
      <TableRow className="border-b border-gray-100">
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            <Avatar className={cn("h-7 w-7", avatarColor)}>
              <AvatarFallback className="text-xs">{getInitials(agent.name)}</AvatarFallback>
            </Avatar>
            <span className={cn("font-medium", isTopAgent && "text-blue-700")}>{agent.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-right py-3 font-medium">{leadsValue}</TableCell>
        <TableCell className="text-right py-3">
          <div className="flex items-center justify-end gap-1">
            <span className={trendColor}>{agent.change > 0 ? "+" : ""}{agent.change}%</span>
            {renderTrendIcon()}
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  // Full version with all columns
  return (
    <TableRow className="border-b border-gray-100">
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <Avatar className={cn("h-7 w-7", avatarColor)}>
            <AvatarFallback className="text-xs">{getInitials(agent.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{agent.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right py-3 font-medium">{leadsValue}</TableCell>
      <TableCell className="text-right py-3 font-medium">{agent.sales || 0}</TableCell>
      <TableCell className="text-right py-3 font-medium">{agent.value || "€0"}</TableCell>
      <TableCell className="text-right py-3 font-medium">{agent.conversion || 0}%</TableCell>
      <TableCell className="text-right py-3">
        <div className="flex items-center justify-end gap-1">
          <span className={trendColor}>{agent.change > 0 ? "+" : ""}{agent.change}%</span>
          {renderTrendIcon()}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AgentTableRow;
