import { LeadStatus, PipelineType } from '@/types/lead';

// Define specific status sets for different pipeline types
export const PURCHASE_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Proposal", "Visit", 
  "Offer", "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

export const RENTAL_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Visit", 
  "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

/**
 * Checks if a status is valid for a given pipeline type
 */
export const isStatusValidForPipeline = (status: LeadStatus, pipelineType: PipelineType): boolean => {
  const validStatuses = pipelineType === 'purchase' ? PURCHASE_STATUSES : RENTAL_STATUSES;
  return validStatuses.includes(status);
};

/**
 * Returns the available statuses for a given pipeline type
 */
export const getStatusesForPipeline = (pipelineType: PipelineType): LeadStatus[] => {
  return pipelineType === 'purchase' ? PURCHASE_STATUSES : RENTAL_STATUSES;
};

/**
 * Gets a recommended default status when transitioning between pipeline types
 * If the current status is valid in the new pipeline, it keeps it
 * Otherwise, it returns a default like "New"
 */
export const getRecommendedStatusForPipelineTransition = (
  currentStatus: LeadStatus, 
  targetPipelineType: PipelineType
): LeadStatus => {
  // If current status is valid in target pipeline, keep it
  if (isStatusValidForPipeline(currentStatus, targetPipelineType)) {
    return currentStatus;
  }
  
  // Otherwise return "New" as a safe default
  return "New";
};

/**
 * Helper function to get a description of the pipeline type in French
 */
export const getPipelineTypeLabel = (pipelineType: PipelineType): string => {
  return pipelineType === 'purchase' ? 'Achat' : 'Location';
};

/**
 * Returns the translated pipeline type
 */
export const getPipelineTypeFrench = (pipelineType: PipelineType): string => {
  const mapping: Record<PipelineType, string> = {
    purchase: 'Achat',
    rental: 'Location'
  };
  
  return mapping[pipelineType] || 'Achat';
};
