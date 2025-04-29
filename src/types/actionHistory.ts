import { TaskType } from '@/components/kanban/KanbanCard';

export interface ActionHistory {
  id: string;
  actionType: string;
  createdAt: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
}

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

// These interfaces define the possible shapes of action history items
// which can contain various date fields
export interface ActionHistoryItem {
  actionType: string;
  // Various possible date fields that might be present
  date?: string;
  timestamp?: string;
  created?: string;
  createdDate?: string;
  createdAt?: string;
  // Other potential fields
  notes?: string;
  status?: string;
  [key: string]: any; // Allow for other properties
}
