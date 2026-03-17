import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface AlertLead {
  id: string;
  name: string;
  reason: string;
}

interface LeadRowProps {
  lead: AlertLead;
  onClick: () => void;
}

const LeadRow = ({ lead, onClick }: LeadRowProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 transition-colors text-left"
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
      <p className="text-xs text-muted-foreground">{lead.reason}</p>
    </div>
    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
  </button>
);

export default LeadRow;
