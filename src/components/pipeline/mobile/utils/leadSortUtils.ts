
import { isPast, isToday, parseISO, isBefore } from 'date-fns';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

/**
 * Calculate priority score based on lead stage
 */
const getStageScore = (status: string): number => {
  switch (status) {
    case 'New':
    case 'Contacted':
      return 1000; // Priorité A - leads chauds à traiter
    case 'Qualified':
    case 'Proposal':
      return 800;  // Priorité B - leads en négociation
    case 'Visit':
    case 'Offre':
    case 'Deposit':
      return 600;  // Priorité C - leads avancés
    case 'Gagné':
    case 'Perdu':
      return 100;  // Priorité D - leads fermés
    default:
      return 400;  // Statuts non définis
  }
};

/**
 * Calculate priority score based on lead tags
 */
const getTagScore = (tags: string[] = []): number => {
  let maxScore = 0;
  
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('vip')) {
      maxScore = Math.max(maxScore, 100);
    } else if (tagLower.includes('hot')) {
      maxScore = Math.max(maxScore, 80);
    } else if (tagLower.includes('serious')) {
      maxScore = Math.max(maxScore, 60);
    } else if (tagLower.includes('cold')) {
      maxScore = Math.max(maxScore, 20);
    } else if (tagLower.includes('no response') || tagLower.includes('no phone') || tagLower.includes('fake')) {
      maxScore = Math.max(maxScore, -50);
    }
  });
  
  return maxScore;
};

/**
 * Calculate priority score based on action date
 */
const getActionDateScore = (nextFollowUpDate?: string): number => {
  if (!nextFollowUpDate) return 0;

  try {
    const followUpDate = new Date(nextFollowUpDate);
    
    // Actions en retard
    if (isPast(followUpDate) && !isToday(followUpDate)) {
      return 30;
    }
    
    // Actions aujourd'hui
    if (isToday(followUpDate)) {
      return 20;
    }
    
    // Actions cette semaine (approximation: 7 jours)
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    
    if (followUpDate <= weekFromNow) {
      return 10;
    }
    
    // Actions futures
    return 5;
  } catch (e) {
    return 0;
  }
};

/**
 * Parse budget string to number for sorting
 */
const parseBudget = (budget?: string): number => {
  if (!budget) return 0;
  
  // Remove currency symbols, spaces, and convert to number
  const cleanBudget = budget.replace(/[€$£,\s]/g, '');
  
  // Handle 'k' and 'M' suffixes
  if (cleanBudget.toLowerCase().includes('k')) {
    return parseFloat(cleanBudget.replace(/k/i, '')) * 1000;
  }
  if (cleanBudget.toLowerCase().includes('m')) {
    return parseFloat(cleanBudget.replace(/m/i, '')) * 1000000;
  }
  
  const parsed = parseFloat(cleanBudget);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate total priority score for a lead
 */
const getLeadPriorityScore = (lead: any): number => {
  const stageScore = getStageScore(lead.status);
  const tagScore = getTagScore(lead.tags);
  const dateScore = getActionDateScore(lead.nextFollowUpDate);
  
  return stageScore + tagScore + dateScore;
};

/**
 * Determines the priority level of a lead based on its action status (legacy function for compatibility)
 */
export const getLeadPriority = (lead: any): number => {
  // Convertir le score en priorité (inverse pour compatibilité)
  const score = getLeadPriorityScore(lead);
  
  // Plus le score est élevé, plus la priorité est haute (numéro bas)
  if (score >= 1100) return 1; // Très haute priorité
  if (score >= 900) return 2;  // Haute priorité
  if (score >= 700) return 3;  // Priorité moyenne
  if (score >= 500) return 4;  // Priorité basse
  return 5; // Très basse priorité
};

/**
 * Sort leads by priority, creation date, or other criteria
 */
export const sortLeadsByPriority = (
  leads: any[],
  sortBy: 'priority' | 'newest' | 'oldest' | 'stage' | 'urgency' | 'importance' | 'budget' = 'priority'
): any[] => {
  if (!leads || leads.length === 0) return [];
  
  const leadsCopy = [...leads];
  
  switch (sortBy) {
    case 'priority':
      // Tri par score de priorité (du plus haut au plus bas)
      return leadsCopy.sort((a, b) => {
        const scoreA = getLeadPriorityScore(a);
        const scoreB = getLeadPriorityScore(b);
        
        // Si les scores sont différents, trier par score
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Score le plus haut en premier
        }
        
        // Si même score, trier par date de création (plus récent en premier)
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });

    case 'stage':
      // Tri par stade uniquement
      return leadsCopy.sort((a, b) => {
        const stageScoreA = getStageScore(a.status);
        const stageScoreB = getStageScore(b.status);
        
        if (stageScoreA !== stageScoreB) {
          return stageScoreB - stageScoreA;
        }
        
        // Si même stade, trier par date de création
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });

    case 'urgency':
      // Tri par urgence (dates d'action uniquement)
      return leadsCopy.sort((a, b) => {
        const dateScoreA = getActionDateScore(a.nextFollowUpDate);
        const dateScoreB = getActionDateScore(b.nextFollowUpDate);
        
        if (dateScoreA !== dateScoreB) {
          return dateScoreB - dateScoreA;
        }
        
        // Si même urgence, trier par date de suivi
        if (a.nextFollowUpDate && b.nextFollowUpDate) {
          const dateA = new Date(a.nextFollowUpDate);
          const dateB = new Date(b.nextFollowUpDate);
          return dateA.getTime() - dateB.getTime();
        }
        
        // Trier par date de création
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });

    case 'importance':
      // Tri par importance (tags uniquement)
      return leadsCopy.sort((a, b) => {
        const tagScoreA = getTagScore(a.tags);
        const tagScoreB = getTagScore(b.tags);
        
        if (tagScoreA !== tagScoreB) {
          return tagScoreB - tagScoreA;
        }
        
        // Si même importance, trier par date de création
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });

    case 'budget':
      // Tri par budget (du plus élevé au plus bas)
      return leadsCopy.sort((a, b) => {
        const budgetA = parseBudget(a.budget);
        const budgetB = parseBudget(b.budget);
        
        if (budgetA !== budgetB) {
          return budgetB - budgetA; // Budget le plus élevé en premier
        }
        
        // Si même budget, trier par date de création
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
