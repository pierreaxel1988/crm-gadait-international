export type TaskType = 
  | 'Call' 
  | 'Visit' 
  | 'Contract' 
  | 'Sales Act' 
  | 'Rental Contract' 
  | 'Offer' 
  | 'Follow Up' 
  | 'Estimation' 
  | 'Prospecting' 
  | 'Admin';

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
