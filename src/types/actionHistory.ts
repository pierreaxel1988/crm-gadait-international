
// Define a type for action history
export interface ActionHistory {
  id: string;
  actionType: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}
