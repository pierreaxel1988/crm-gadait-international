
import { TaskType } from "@/components/kanban/KanbanCard";

// Define a type for action history
export interface ActionHistory {
  id: string;
  actionType: string | TaskType; // Modified to accept both string and TaskType
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}
