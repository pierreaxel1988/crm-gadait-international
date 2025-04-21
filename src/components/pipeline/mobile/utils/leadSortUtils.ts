
import { isPast, isToday, parseISO, isBefore } from 'date-fns';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

/**
 * Determines the priority level of a lead based on its action status
 * 
 * @param lead The lead item to evaluate
 * @returns A priority number (lower is higher priority)
 */
export const getLeadPriority = (lead: any): number => {
  // No follow-up date set - lowest priority
  if (!lead.nextFollowUpDate) {
    return 4;
  }

  try {
    const followUpDate = new Date(lead.nextFollowUpDate);
    
    // Overdue tasks (past but not today) - highest priority
    if (isPast(followUpDate) && !isToday(followUpDate)) {
      return 1;
    }
    
    // Tasks due today - second highest priority
    if (isToday(followUpDate)) {
      return 2;
    }
    
    // Future tasks - medium priority
    return 3;
  } catch (e) {
    // If there's an error parsing the date, give it low priority
    return 5;
  }
};

/**
 * Sort leads by priority, creation date, or other criteria
 * 
 * @param leads Array of leads to sort
 * @param sortBy The sorting method to use
 * @returns Sorted array of leads
 */
export const sortLeadsByPriority = (
  leads: any[],
  sortBy: 'priority' | 'newest' | 'oldest' = 'priority'
): any[] => {
  if (!leads || leads.length === 0) return [];
  
  const leadsCopy = [...leads];
  
  switch (sortBy) {
    case 'priority':
      // Sort by priority first (overdue -> today -> future -> no date)
      // Then by date (earlier dates first within same priority)
      return leadsCopy.sort((a, b) => {
        const priorityA = getLeadPriority(a);
        const priorityB = getLeadPriority(b);
        
        // If priorities are different, sort by priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If both have follow up dates and same priority, sort by date
        if (a.nextFollowUpDate && b.nextFollowUpDate) {
          const dateA = new Date(a.nextFollowUpDate);
          const dateB = new Date(b.nextFollowUpDate);
          return dateA.getTime() - dateB.getTime();
        }
        
        // Sort by created date (newer first) if equal priority or no follow-up dates
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });
      
    case 'newest':
      // Sort by creation date (newest first)
      return leadsCopy.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
    case 'oldest':
      // Sort by creation date (oldest first)
      return leadsCopy.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      
    default:
      return leadsCopy;
  }
};
