
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type LeadStatus =
  // Statuts pour les pipelines Achat/Location
  | 'New'              // Nouveaux
  | 'Contacted'        // Contactés
  | 'Qualified'        // Qualifiés
  | 'Proposal'         // Propositions
  | 'Visit'            // Visites en cours
  | 'Offer'            // Offre en cours (English/Purchase)
  | 'Offre'            // Offre en cours (French/Rental)
  | 'Deposit'          // Dépôt reçu
  | 'Signed'           // Signature finale
  | 'Gagné'            // Conclus
  | 'Perdu'            // Perdu
  // Statuts pour le pipeline Propriétaires
  | 'NouveauContact'   // Nouveau contact
  | 'Qualification'    // En cours de qualification
  | 'MandatPropose'    // Mandat proposé
  | 'MandatSigne'      // Mandat signé
  | 'MandatExpire'     // Mandat expiré
  | 'Inactif';         // Inactif / En pause

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = (status: LeadStatus) => {
    switch (status) {
      // Statuts pour les pipelines Achat/Location
      case 'New':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Qualified':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'Proposal':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'Visit':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'Offer':
      case 'Offre':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Deposit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Gagné':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Perdu':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        
      // Statuts pour le pipeline Propriétaires
      case 'NouveauContact':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Qualification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'MandatPropose':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'MandatSigne':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'MandatExpire':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Inactif':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Traduction française des statuts
  const getStatusLabel = (status: LeadStatus): string => {
    switch (status) {
      // Statuts pour les pipelines Achat/Location
      case 'New': return 'Nouveau';
      case 'Contacted': return 'Contacté';
      case 'Qualified': return 'Qualifié';
      case 'Proposal': return 'Proposition';
      case 'Visit': return 'Visite';
      case 'Offer': return 'Offre';
      case 'Offre': return 'Offre';
      case 'Deposit': return 'Dépôt';
      case 'Signed': return 'Signé';
      case 'Gagné': return 'Gagné';
      case 'Perdu': return 'Perdu';
      
      // Statuts pour le pipeline Propriétaires
      case 'NouveauContact': return 'Nouveau contact';
      case 'Qualification': return 'En qualification';
      case 'MandatPropose': return 'Mandat proposé';
      case 'MandatSigne': return 'Mandat signé';
      case 'MandatExpire': return 'Mandat expiré';
      case 'Inactif': return 'Inactif / Pause';
      
      default: return status;
    }
  };

  return (
    <Badge
      weight="normal"
      className={cn(
        'luxury-badge font-futuraLight',
        getStatusStyles(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
