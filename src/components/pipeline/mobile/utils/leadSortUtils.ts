import { SortBy } from '../../types/pipelineTypes';

export const sortLeadsByPriority = (leads: any[], sortBy: SortBy) => {
  if (!leads) return [];
  
  const sortedLeads = [...leads];
  
  switch (sortBy) {
    case 'priority':
      // Sort by priority logic
      return sortedLeads.sort((a, b) => {
        // Implement your priority sorting logic here
        // For now, just return the original order
        return 0;
      });
      
    case 'newest':
      // Sort by created date, newest first
      return sortedLeads.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
    case 'oldest':
      // Sort by created date, oldest first
      return sortedLeads.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
    case 'mandate':
      // Sort by mandate type
      return sortedLeads.sort((a, b) => {
        if (!a.mandate_type) return 1;
        if (!b.mandate_type) return -1;
        return a.mandate_type.localeCompare(b.mandate_type);
      });
      
    default:
      return sortedLeads;
  }
};
