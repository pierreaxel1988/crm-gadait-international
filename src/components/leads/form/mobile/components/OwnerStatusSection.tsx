import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/components/common/StatusBadge';

interface OwnerStatusSectionProps {
  status: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
}

const OwnerStatusSection: React.FC<OwnerStatusSectionProps> = ({ status, onStatusChange }) => {
  const statuses: LeadStatus[] = [
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Visit',
    'Signed',
    'Offre',
    'Deposit',
    'Gagné',
    'Perdu',
    'Deleted'
  ];

  const statusLabels: Record<LeadStatus, string> = {
    'New': 'Premier contact',
    'Contacted': 'Rendez-vous programmé',
    'Qualified': 'Visite effectuée',
    'Proposal': 'Mandat en négociation',
    'Visit': 'Bien en commercialisation',
    'Offre': 'Offre reçue',
    'Deposit': 'Compromis signé',
    'Signed': 'Mandat signé',
    'Gagné': 'Vente finalisée',
    'Perdu': 'Perdu/Annulé',
    'Deleted': 'Supprimé'
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="status">Statut</Label>
      <Select onValueChange={(value) => onStatusChange(value as LeadStatus)} defaultValue={status}>
        <SelectTrigger id="status">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((statusValue) => (
            <SelectItem key={statusValue} value={statusValue}>
              {statusLabels[statusValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OwnerStatusSection;
