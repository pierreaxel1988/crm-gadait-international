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
import { TaskType } from '@/components/kanban/KanbanCard';

interface ActionsListProps {
  actions: ActionItem[];
  isLoading: boolean;
  onMarkComplete: (actionId: string, leadId: string) => void;
  isMobile: boolean;
}

const ActionsList: React.FC<ActionsListProps> = ({ actions, isLoading, onMarkComplete, isMobile }) => {
  const navigate = useNavigate();
  
  const handleCardClick = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=actions`);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
        ))}
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

  // Get icon for task type (matching TaskTypeIndicator)
  const getIconForTaskType = (type: TaskType): JSX.Element | null => {
    switch (type) {
      case 'Call':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        );
      case 'Visites':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case 'Compromis':
      case 'Admin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'Acte de vente':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        );
      case 'Contrat de Location':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <path d="M9 9h6v6H9z"></path>
            <path d="M9 1v3"></path>
            <path d="M15 1v3"></path>
            <path d="M9 20v3"></path>
            <path d="M15 20v3"></path>
            <path d="M20 9h3"></path>
            <path d="M20 14h3"></path>
            <path d="M1 9h3"></path>
            <path d="M1 14h3"></path>
          </svg>
        );
      case 'Propositions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        );
      case 'Follow up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'Estimation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        );
      case 'Prospection':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 1 0 7.75"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Get color from TaskTypeIndicator for consistent styling
  const getTaskTypeColor = (taskType: string): string => {
    switch(taskType) {
      case 'Call': return '#EBD5CE'; // Light beige/pink
      case 'Visites': return '#A78BFA'; // Purple
      case 'Compromis': return '#FCD34D'; // Amber/gold
      case 'Acte de vente': return '#EF4444'; // Red
      case 'Contrat de Location': return '#3B82F6'; // Blue
      case 'Propositions': return '#EC4899'; // Magenta
      case 'Follow up': return '#F3E9D6'; // Beige
      case 'Estimation': return '#14B8A6'; // Teal
      case 'Prospection': return '#F97316'; // Orange
      case 'Admin': return '#9BA3AD'; // Gray
      default: return '#9BA3AD'; // Default gray
    }
  };
  
  // Get text color based on background color
  const getTaskTypeTextColor = (taskType: string) => {
    switch (taskType) {
      case 'Call': return '#D05A76'; // Dark rose/pink for Call
      case 'Compromis': return '#92400E'; // Dark amber for Compromis
      case 'Follow up': return '#B58C59'; // Dark beige for Follow-up
      default: return '#FFFFFF';  // White text for other categories
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
              onClick={() => handleCardClick(action.leadId)}
            >
              <TableCell>{action.leadName}</TableCell>
              <TableCell>
                <div 
                  className="text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1"
                  style={{
                    backgroundColor: getTaskTypeColor(action.actionType),
                    color: getTaskTypeTextColor(action.actionType),
                    border: '1px solid rgba(211, 197, 180, 0.3)',
                    boxShadow: '0 1px 2px rgba(139, 111, 78, 0.05)',
                  }}
                >
                  {getIconForTaskType(action.actionType as TaskType)}
                  {action.actionType}
                </div>
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
