
// Import the TaskType from the KanbanCard component to avoid duplication
import { TaskType } from '@/components/kanban/KanbanCard';

export type { TaskType };

export type ActionStatus = 'todo' | 'overdue' | 'done';

export interface ActionHistory {
  id: string;
  actionType: TaskType;
  createdAt: string;
  completedAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  priorityLevel?: 'low' | 'medium' | 'high';
}

export interface ActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: TaskType;
  createdAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completedAt?: string;
  notes?: string;
  assignedToId?: string;
  assignedToName: string;
  status: ActionStatus;
  phoneNumber?: string;
  email?: string;
}
