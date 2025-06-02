
import { TaskType } from '@/components/kanban/KanbanCard';

// Re-export ActionHistory from lead.ts to maintain compatibility
export type { ActionHistory } from './lead';

export type ActionStatus = 'todo' | 'overdue' | 'done';

export interface ActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: TaskType;
  createdAt?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  assignedToId?: string;
  assignedToName: string;
  status: ActionStatus;
  phoneNumber?: string;
  email?: string;
}
