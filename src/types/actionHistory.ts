
export interface ActionHistory {
  id: string;
  actionType: string;
  createdAt: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
}
