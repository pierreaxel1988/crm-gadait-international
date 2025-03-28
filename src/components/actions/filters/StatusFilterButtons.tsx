
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';
import { ActionStatus } from '@/types/actionHistory';

interface StatusFilterButtonsProps {
  statusFilter: ActionStatus | 'all';
  setStatusFilter: (status: ActionStatus | 'all') => void;
}

const StatusFilterButtons: React.FC<StatusFilterButtonsProps> = ({ statusFilter, setStatusFilter }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4" /> Statut
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant={statusFilter === 'all' ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setStatusFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={statusFilter === 'todo' ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setStatusFilter('todo')}
        >
          À faire
        </Button>
        <Button
          variant={statusFilter === 'overdue' ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setStatusFilter('overdue')}
        >
          En retard
        </Button>
        <Button
          variant={statusFilter === 'done' ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setStatusFilter('done')}
        >
          Terminé
        </Button>
      </div>
    </div>
  );
};

export default StatusFilterButtons;
