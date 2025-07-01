
import { isPast, isToday, parseISO, isBefore } from 'date-fns';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

/**
 * Determines the priority level of a lead based on its status, tags, and action status
 * 
 * @param lead The lead item to evaluate
 * @returns A priority number (lower is higher priority)
 */
export const getLeadPriority = (lead: any): number => {
  // 1. LEADS FERMÉS/TERMINÉS - Priorité la plus basse (8-10)
  const closedStatuses = ['Gagné', 'Perdu', 'Deleted'];
  if (closedStatuses.includes(lead.status)) {
    if (lead.status === 'Deleted') return 10; // Le plus bas
    if (lead.status === 'Perdu') return 9;
    if (lead.status === 'Gagné') return 8;
  }

  // 2. LEADS PROBLÉMATIQUES - Très basse priorité (7)
  const problematicTags = ['fake', 'Fake', 'FAKE', 'cold', 'Cold', 'COLD', 'no response', 'No response', 'NO RESPONSE'];
  if (lead.tags && Array.isArray(lead.tags)) {
    const hasProblematicTag = lead.tags.some((tag: string) => 
      problematicTags.some(problematic => 
        tag.toLowerCase().includes(problematic.toLowerCase())
      )
    );
    if (hasProblematicTag) {
      return 7;
    }
  }

  // 3. LEADS VIP/HOT - Boost de priorité si ils ont des actions urgentes
  const vipTags = ['vip', 'VIP', 'hot', 'Hot', 'HOT', 'urgent', 'Urgent', 'URGENT'];
  const isVip = lead.tags && Array.isArray(lead.tags) && 
    lead.tags.some((tag: string) => 
      vipTags.some(vip => 
        tag.toLowerCase().includes(vip.toLowerCase())
      )
    );

  // 4. ÉVALUATION DES ACTIONS PRÉVUES
  if (!lead.nextFollowUpDate) {
    // Pas d'action prévue
    if (isVip) return 5; // VIP sans action = priorité moyenne-haute
    return 6; // Leads sans action = basse priorité
  }

  try {
    const followUpDate = new Date(lead.nextFollowUpDate);
    
    // Actions en retard (urgent)
    if (isPast(followUpDate) && !isToday(followUpDate)) {
      return isVip ? 1 : 2; // VIP en retard = priorité maximale
    }
    
    // Actions prévues aujourd'hui
    if (isToday(followUpDate)) {
      return isVip ? 2 : 3; // VIP aujourd'hui = très haute priorité
    }
    
    // Actions futures
    return isVip ? 3 : 4; // VIP futur = haute priorité, autres = priorité normale
    
  } catch (e) {
    // Erreur de parsing de date
    return isVip ? 5 : 6;
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
      // Sort by priority first, then by status, then by date
      return leadsCopy.sort((a, b) => {
        const priorityA = getLeadPriority(a);
        const priorityB = getLeadPriority(b);
        
        // If priorities are different, sort by priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Same priority: sort by status (active statuses first)
        const closedStatuses = ['Gagné', 'Perdu', 'Deleted'];
        const aIsClosed = closedStatuses.includes(a.status);
        const bIsClosed = closedStatuses.includes(b.status);
        
        if (aIsClosed !== bIsClosed) {
          return aIsClosed ? 1 : -1; // Active leads first
        }
        
        // Same priority and status type: sort by follow-up date
        if (a.nextFollowUpDate && b.nextFollowUpDate) {
          const dateA = new Date(a.nextFollowUpDate);
          const dateB = new Date(b.nextFollowUpDate);
          return dateA.getTime() - dateB.getTime();
        }
        
        // One has follow-up date, other doesn't
        if (a.nextFollowUpDate && !b.nextFollowUpDate) return -1;
        if (!a.nextFollowUpDate && b.nextFollowUpDate) return 1;
        
        // Neither has follow-up date: sort by creation date (newer first)
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

/**
 * Get a human-readable priority level description
 * @param lead The lead to evaluate
 * @returns Priority description
 */
export const getPriorityDescription = (lead: any): string => {
  const priority = getLeadPriority(lead);
  
  switch (priority) {
    case 1: return 'Critique - VIP en retard';
    case 2: return 'Urgent - En retard';
    case 3: return 'Aujourd\'hui';
    case 4: return 'À venir';
    case 5: return 'VIP - Pas d\'action';
    case 6: return 'Pas d\'action';
    case 7: return 'Problématique';
    case 8: return 'Conclu';
    case 9: return 'Perdu';
    case 10: return 'Supprimé';
    default: return 'Non défini';
  }
};
