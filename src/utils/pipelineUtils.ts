import { LeadStatus, PipelineType } from '@/types/lead';
import { addActionToLead } from '@/services/leadActions';
import { toast } from '@/hooks/use-toast';

// Define specific status sets for different pipeline types
export const PURCHASE_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Proposal", "Visit", 
  "Offer", "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

export const RENTAL_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Visit", 
  "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

export const OWNER_STATUSES: LeadStatus[] = [
  "NouveauContact", "Qualification", "MandatPropose", 
  "MandatSigne", "MandatExpire", "Inactif"
];

/**
 * Checks if a status is valid for a given pipeline type
 */
export const isStatusValidForPipeline = (status: LeadStatus, pipelineType: PipelineType): boolean => {
  if (pipelineType === 'purchase') {
    return PURCHASE_STATUSES.includes(status);
  } else if (pipelineType === 'rental') {
    return RENTAL_STATUSES.includes(status);
  } else if (pipelineType === 'owner') {
    return OWNER_STATUSES.includes(status);
  }
  return false;
};

/**
 * Returns the available statuses for a given pipeline type
 */
export const getStatusesForPipeline = (pipelineType: PipelineType): LeadStatus[] => {
  if (pipelineType === 'purchase') {
    return PURCHASE_STATUSES;
  } else if (pipelineType === 'rental') {
    return RENTAL_STATUSES;
  } else if (pipelineType === 'owner') {
    return OWNER_STATUSES;
  }
  return PURCHASE_STATUSES; // Default
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
  
  // Otherwise return an appropriate default status based on the target pipeline
  if (targetPipelineType === 'owner') {
    return "NouveauContact";
  } else {
    return "New";
  }
};

/**
 * Helper function to get a description of the pipeline type in French
 */
export const getPipelineTypeLabel = (pipelineType: PipelineType): string => {
  const mapping: Record<PipelineType, string> = {
    purchase: 'Achat',
    rental: 'Location',
    owner: 'Propriétaire'
  };
  
  return mapping[pipelineType] || 'Achat';
};

/**
 * Returns the translated pipeline type
 */
export const getPipelineTypeFrench = (pipelineType: PipelineType): string => {
  const mapping: Record<PipelineType, string> = {
    purchase: 'Achat',
    rental: 'Location',
    owner: 'Propriétaire'
  };
  
  return mapping[pipelineType] || 'Achat';
};

/**
 * Handles the transition between pipeline types
 * Creates a requalification action when lead changes pipeline type
 */
export const handlePipelineTypeTransition = async (
  leadId: string,
  currentStatus: LeadStatus,
  currentPipelineType: PipelineType, 
  targetPipelineType: PipelineType,
  handleStatusChange: (newStatus: LeadStatus) => void
): Promise<void> => {
  // Skip if no change in pipeline type
  if (currentPipelineType === targetPipelineType) return;
  
  // Check if status needs adjustment
  const shouldChangeStatus = !isStatusValidForPipeline(currentStatus, targetPipelineType);
  let newStatus: LeadStatus;
  
  if (shouldChangeStatus) {
    if (targetPipelineType === 'owner') {
      newStatus = "NouveauContact";
    } else {
      newStatus = "New";
    }
    
    handleStatusChange(newStatus);
    
    toast({
      title: "Statut réinitialisé",
      description: `Le statut a été réinitialisé à "${newStatus}" car "${currentStatus}" n'est pas valide pour un dossier de ${getPipelineTypeFrench(targetPipelineType).toLowerCase()}.`
    });
  }
  
  // Create a requalification action for the lead
  try {
    const fromType = getPipelineTypeFrench(currentPipelineType);
    const toType = getPipelineTypeFrench(targetPipelineType);
    
    await addActionToLead(leadId, {
      actionType: "Call",
      scheduledDate: new Date().toISOString(),
      notes: `À requalifier : Le lead est passé d'un pipeline ${fromType} à ${toType}. Veuillez requalifier le lead selon ses nouveaux besoins.`
    });
    
    toast({
      title: "Action de requalification créée",
      description: `Une action "Appel" a été ajoutée pour requalifier le lead suite au changement de pipeline.`
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'action de requalification:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de créer l'action de requalification."
    });
  }
};
