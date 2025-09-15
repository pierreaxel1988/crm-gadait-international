import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';

interface EnhancedStatusFilterProps {
  status: LeadStatus | null;
  onStatusChange: (status: LeadStatus | null) => void;
}

const EnhancedStatusFilter = ({ status, onStatusChange }: EnhancedStatusFilterProps) => {
  const statuses: Array<{ value: LeadStatus | null; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
    { value: null, label: 'Tous les statuts', icon: UserCheck, color: 'default' },
    { value: 'New', label: 'Nouveau', icon: AlertCircle, color: 'destructive' },
    { value: 'Contacted', label: 'En cours', icon: Clock, color: 'secondary' },
    { value: 'Qualified', label: 'Qualifié', icon: CheckCircle, color: 'default' },
    { value: 'Perdu', label: 'Fermé', icon: XCircle, color: 'outline' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Statut du lead</h4>
        {status && (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statuses.map((statusOption) => {
          const Icon = statusOption.icon;
          const isSelected = status === statusOption.value;
          
          return (
            <Button
              key={statusOption.value || 'all'}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'shadow-md border-primary/50' 
                  : 'hover:border-primary/30 hover:shadow-sm'
              }`}
              onClick={() => onStatusChange(statusOption.value)}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {statusOption.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedStatusFilter;