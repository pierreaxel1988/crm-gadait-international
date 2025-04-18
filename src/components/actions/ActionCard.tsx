
import React from 'react';
import { ActionItem } from '@/types/actionHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, Phone, Mail, MessageSquare } from 'lucide-react';
import TaskTypeIndicator from '@/components/kanban/card/TaskTypeIndicator';
import { format, isToday, isYesterday, isTomorrow, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActionCardProps {
  action: ActionItem;
  onMarkComplete: (actionId: string, leadId: string) => void;
  onCardClick: (leadId: string, e: React.MouseEvent) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onMarkComplete, onCardClick }) => {
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
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (action.phoneNumber) {
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
      const cleanedPhone = action.phoneNumber.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };
  
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (action.phoneNumber) {
      window.location.href = `tel:${action.phoneNumber}`;
    }
  };
  
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (action.email) {
      window.location.href = `mailto:${action.email}`;
    }
  };
  
  return (
    <Card 
      className={`p-4 transition-all cursor-pointer w-full overflow-hidden ${
        action.status === 'overdue' 
          ? 'border-red-300 bg-[#FFDEE2]/30' 
          : action.status === 'done' 
            ? 'bg-gray-50/80 border-gray-200' 
            : 'bg-[#F2FCE2]/40 border-green-100'
      }`}
      onClick={(e) => onCardClick(action.leadId, e)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="max-w-[75%]">
          <div className={`font-medium truncate ${action.status === 'done' ? 'text-gray-600' : ''}`}>{action.leadName}</div>
          <div className="text-sm text-muted-foreground mb-1 truncate">{action.assignedToName}</div>
          <TaskTypeIndicator taskType={action.actionType} phoneNumber={action.phoneNumber} />
        </div>
        <div>
          {getStatusBadge(action.status)}
        </div>
      </div>
      
      {action.notes && (
        <div className={`text-sm mt-2 p-2 rounded break-words max-w-full ${
          action.status === 'done' 
            ? 'bg-white/80 text-gray-600' 
            : action.status === 'overdue'
              ? 'bg-[#FFF0F2] text-rose-800'
              : 'bg-[#F7FEF1] text-green-800'
        }`}>
          {action.notes}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
        <div className="flex items-center text-sm text-gray-500 min-w-0 truncate">
          <Calendar className="h-3.5 w-3.5 mr-1 shrink-0" />
          <span className="truncate">{formatDate(action.status === 'done' ? action.completedDate : action.scheduledDate)}</span>
        </div>
        
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {action.phoneNumber && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={handleWhatsAppClick}
                title="Contacter par WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={handlePhoneClick}
                title="Appeler"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {action.email && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              onClick={handleEmailClick}
              title="Envoyer un email"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
          
          {action.status !== 'done' && (
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
              Complété
            </Button>
          )}
          
          {action.status === 'done' && (
            <span className="text-xs py-1 px-2 bg-green-100 text-green-700 rounded-full flex items-center">
              <Check className="h-3 w-3 mr-1" /> Terminé
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActionCard;
