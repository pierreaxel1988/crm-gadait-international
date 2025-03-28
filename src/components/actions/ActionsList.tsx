
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday, isTomorrow, isThisWeek, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@/types/actionHistory';
import TaskTypeIndicator from '@/components/kanban/card/TaskTypeIndicator';

interface ActionsListProps {
  actions: ActionItem[];
  isLoading: boolean;
  onMarkComplete: (actionId: string, leadId: string) => void;
  isMobile: boolean;
}

const ActionsList: React.FC<ActionsListProps> = ({ actions, isLoading, onMarkComplete, isMobile }) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Chargement des actions...</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-10">
        <p>Aucune action trouvée.</p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      case 'todo':
        return <Badge variant="outline">À faire</Badge>;
      case 'done':
        return <Badge variant="default">Terminé</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Non programmé';
    
    const date = new Date(dateStr);
    
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Hier à ${format(date, 'HH:mm')}`;
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, 'HH:mm')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE à HH:mm', { locale: fr });
    } else {
      return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
    }
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {actions.map(action => (
          <Card key={action.id} className={`p-4 ${action.status === 'overdue' ? 'border-red-400' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{action.leadName}</div>
                <div className="text-sm text-muted-foreground mb-1">{action.assignedToName}</div>
                <TaskTypeIndicator taskType={action.actionType} />
              </div>
              <div>
                {getStatusBadge(action.status)}
              </div>
            </div>
            
            {action.notes && (
              <div className="text-sm mt-2 bg-muted/50 p-2 rounded">
                {action.notes}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(action.scheduledDate)}
              </div>
              
              {action.status !== 'done' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8" 
                  onClick={() => onMarkComplete(action.id, action.leadId)}
                >
                  <Check className="h-4 w-4 mr-1" /> Complété
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop view
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lead</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Programmé pour</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map(action => (
          <TableRow key={action.id} className={action.status === 'overdue' ? 'bg-red-50' : ''}>
            <TableCell>{action.leadName}</TableCell>
            <TableCell>
              <TaskTypeIndicator taskType={action.actionType} />
            </TableCell>
            <TableCell>{getStatusBadge(action.status)}</TableCell>
            <TableCell>{formatDate(action.scheduledDate)}</TableCell>
            <TableCell>{action.assignedToName}</TableCell>
            <TableCell className="max-w-xs truncate">{action.notes || '-'}</TableCell>
            <TableCell>
              {action.status !== 'done' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onMarkComplete(action.id, action.leadId)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Compléter
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  Terminé le {formatDate(action.completedDate)}
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ActionsList;
