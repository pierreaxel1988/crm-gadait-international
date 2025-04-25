
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday, isTomorrow, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@/types/actionHistory';
import TaskTypeIndicator from '@/components/kanban/card/TaskTypeIndicator';
import { useNavigate } from 'react-router-dom';
import ActionCard from './ActionCard';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface ActionsListProps {
  actions: ActionItem[];
  isLoading: boolean;
  onMarkComplete: (actionId: string, leadId: string) => void;
  isMobile: boolean;
}

const ActionsList: React.FC<ActionsListProps> = ({ actions, isLoading, onMarkComplete, isMobile }) => {
  const navigate = useNavigate();
  
  const handleCardClick = (leadId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/leads/${leadId}?tab=actions`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingScreen fullscreen={false} />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-10 bg-loro-pearl/5 rounded-lg border border-loro-pearl/20 p-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-loro-pearl/30 flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6 text-loro-navy/60" />
        </div>
        <p className="text-loro-navy font-futura text-lg tracking-wide">Aucune action trouvée</p>
        <p className="text-sm text-loro-navy/60 font-futuraLight mt-2">
          Ajoutez des actions à vos leads pour les voir apparaître ici
        </p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive" weight="normal" className="font-futuraLight">En retard</Badge>;
      case 'todo':
        return <Badge variant="outline" weight="normal" className="font-futuraLight">À faire</Badge>;
      case 'done':
        return <Badge variant="default" weight="normal" className="font-futuraLight">Terminé</Badge>;
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

  const getButtonClasses = (status: string) => {
    switch (status) {
      case 'overdue':
        return "h-8 border-rose-300 text-rose-700 hover:bg-[#FFDEE2]/50 hover:text-rose-800";
      case 'todo':
        return "h-8 border-green-300 text-green-700 hover:bg-[#F2FCE2]/50 hover:text-green-800";
      default:
        return "h-8";
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {actions.map(action => (
          <ActionCard 
            key={action.id}
            action={action}
            onMarkComplete={onMarkComplete}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
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
            <TableRow 
              key={action.id} 
              className={`cursor-pointer ${
                action.status === 'overdue' 
                  ? 'bg-[#FFDEE2]/20' 
                  : action.status === 'done'
                    ? 'bg-gray-50/80 text-gray-600' 
                    : 'bg-[#F2FCE2]/20'
              }`}
              onClick={(e) => handleCardClick(action.leadId, e)}
            >
              <TableCell>{action.leadName}</TableCell>
              <TableCell>
                <TaskTypeIndicator taskType={action.actionType} phoneNumber={action.phoneNumber} />
              </TableCell>
              <TableCell>{getStatusBadge(action.status)}</TableCell>
              <TableCell>
                {action.status === 'done' 
                  ? <div className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                      <span>{formatDate(action.completedDate)}</span>
                    </div>
                  : formatDate(action.scheduledDate)
                }
              </TableCell>
              <TableCell>{action.assignedToName}</TableCell>
              <TableCell className={`max-w-xs truncate ${action.status === 'done' ? 'text-gray-500' : ''}`}>
                {action.notes || '-'}
              </TableCell>
              <TableCell>
                {action.status !== 'done' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={getButtonClasses(action.status)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkComplete(action.id, action.leadId);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Compléter
                  </Button>
                ) : (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" /> Terminé
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActionsList;
