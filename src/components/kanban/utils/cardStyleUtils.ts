
import { LeadStatus } from '@/components/common/StatusBadge';

export const getCardBorderClass = (
  status: LeadStatus, 
  isOverdue: boolean, 
  isTaskToday: boolean, 
  isFutureTask: boolean, 
  hasScheduledAction: boolean
): string => {
  // Leads supprimés - style spécial
  if (status === 'Deleted') {
    return 'bg-red-50 border-red-200';
  }
  
  // Leads fermés (Gagné/Perdu) - style neutre même s'ils avaient des actions
  const closedStatuses = ['Gagné', 'Perdu'];
  if (closedStatuses.includes(status)) {
    return 'bg-gray-50 border-gray-200';
  }
  
  // Logique basée sur les actions prévues
  if (!hasScheduledAction) {
    // Pas d'action prévue - style neutre/gris
    return 'bg-gray-50/50 border-gray-200';
  }
  
  // Actions en retard - rouge/rose
  if (isOverdue) {
    return 'bg-red-50/80 border-red-200';
  }
  
  // Actions prévues aujourd'hui - ambre
  if (isTaskToday) {
    return 'bg-amber-50/80 border-amber-200';
  }
  
  // Actions futures - vert léger
  if (isFutureTask) {
    return 'bg-green-50/60 border-green-200';
  }
  
  // Fallback - neutre
  return 'bg-white border-gray-200';
};
