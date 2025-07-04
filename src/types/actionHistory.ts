
import { TaskType } from '@/components/kanban/KanbanCard';

// Ajouter les types d'actions automatiques aux TaskType existants
export type ExtendedTaskType = TaskType | 'Email Auto J+7' | 'Email Auto J+14' | 'Email Auto J+21' | 'Email Auto J+30';

export interface ActionHistory {
  id: string;
  actionType: string;
  createdAt: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  leadId?: string; // Ajout du lien vers l'ID du lead
  isAutomated?: boolean; // Pour identifier les actions automatiques
}

export type ActionStatus = 'todo' | 'overdue' | 'done';

export interface ActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: ExtendedTaskType;
  createdAt?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  assignedToId?: string;
  assignedToName: string;
  status: ActionStatus;
  phoneNumber?: string;
  email?: string;
  // Propriétés ajoutées pour le tri par priorité
  leadStatus?: string;
  leadTags?: string[];
  // Propriétés pour les actions automatiques
  isAutomated?: boolean;
  sequenceId?: string;
  canStopSequence?: boolean;
}
