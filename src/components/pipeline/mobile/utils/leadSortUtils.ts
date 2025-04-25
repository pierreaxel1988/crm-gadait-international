
import { ExtendedKanbanItem } from "@/hooks/useKanbanData";

// Update the type to match the one used in MobileColumnList
export const sortLeadsByPriority = (
  leads: ExtendedKanbanItem[], 
  sortBy: "priority" | "newest" | "oldest"
): ExtendedKanbanItem[] => {
  return [...leads].sort((a, b) => {
    if (sortBy === "priority") {
      // Default priority logic stays the same
      const priorityOrder: Record<string, number> = {
        'Hot': 1,
        'Serious': 2,
        'VIP': 3,
        'Cold': 4,
        'No response': 5,
        'Fake': 6,
        'Imported': 7,
        'No phone': 8
      };

      const getLeadPriority = (lead: ExtendedKanbanItem) => {
        if (lead.tags && lead.tags.length > 0) {
          for (const tag of lead.tags) {
            if (priorityOrder[tag]) return priorityOrder[tag];
          }
        }
        return 999; // Default lowest priority
      };

      return getLeadPriority(a) - getLeadPriority(b);
    } else if (sortBy === "newest") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    } else if (sortBy === "oldest") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    }
    return 0;
  });
};
