import { isPast, isToday, parseISO, isBefore } from 'date-fns';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

/**
 * Calculate priority score based on lead stage - Updated order based on user requirements
 */
const getStageScore = (status: string): number => {
  switch (status) {
    case 'Deposit':
      return 1000; // Priorité 1 - Le plus important
    case 'Visit':
    case 'Offre':
      return 800;  // Priorité 2
    case 'Qualified':
    case 'Proposal':
      return 600;  // Priorité 3
    case 'New':
    case 'Contacted':
      return 400;  // Priorité 4
    case 'Gagné':
    case 'Perdu':
      return 200;  // Priorité 5 - Le moins important
    default:
      return 300;  // Statuts non définis
  }
};

/**
 * Calculate priority score based on lead tags - Updated order based on user requirements
 */
const getTagScore = (tags: string[] = []): number => {
  let maxScore = 0;
  
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    // Ordre de priorité: Vip (plus important) → Hot → Serious → Cold → No response → No phone → Fake (moins important)
    if (tagLower.includes('vip')) {
      maxScore = Math.max(maxScore, 100); // Le plus important
    } else if (tagLower.includes('hot')) {
      maxScore = Math.max(maxScore, 85);
    } else if (tagLower.includes('serious')) {
      maxScore = Math.max(maxScore, 70);
    } else if (tagLower.includes('cold')) {
      maxScore = Math.max(maxScore, 55);
    } else if (tagLower.includes('no response')) {
      maxScore = Math.max(maxScore, 40);
    } else if (tagLower.includes('no phone')) {
      maxScore = Math.max(maxScore, 25);
    } else if (tagLower.includes('fake')) {
      maxScore = Math.max(maxScore, 10); // Le moins important
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
  sortBy: 'priority' | 'newest' | 'oldest' | 'stage' | 'urgency' | 'importance' = 'priority'
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
