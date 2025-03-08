
import React from 'react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge, { LeadStatus } from '@/components/common/StatusBadge';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status: LeadStatus;
  tags: LeadTag[];
  assignedTo?: string;
  createdAt: string;
  lastContactedAt?: string;
}

interface LeadCardProps {
  lead: Lead;
  className?: string;
}

const LeadCard = ({ lead, className }: LeadCardProps) => {
  return (
    <div className={cn('luxury-card p-5 scale-in', className)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-foreground">{lead.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Mail className="h-3.5 w-3.5 mr-1" />
            <span>{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="h-3.5 w-3.5 mr-1" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.location && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{lead.location}</span>
            </div>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lead.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>
              {lead.assignedTo || 'Unassigned'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {lead.lastContactedAt
              ? `Last contacted: ${lead.lastContactedAt}`
              : `Created: ${lead.createdAt}`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button className="w-full luxury-button bg-accent text-accent-foreground hover:bg-accent/90">
          View
        </button>
        <button className="w-full luxury-button">
          Contact
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
