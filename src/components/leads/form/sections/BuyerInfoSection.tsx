
import React from 'react';
import { Notebook, Clock, CalendarClock } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';
import { format } from 'date-fns';

interface BuyerInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BuyerInfoSection = ({
  formData,
  handleInputChange,
}: BuyerInfoSectionProps) => {
  const lastUpdatedDate = formData.lastContactedAt 
    ? format(new Date(formData.lastContactedAt), 'dd/MM/yyyy à HH:mm')
    : 'Aucune mise à jour';

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-md border mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Dernière mise à jour: {lastUpdatedDate}
          </span>
        </div>
      </div>

      <FormInput
        label="Notes de suivi"
        name="notes"
        type="textarea"
        value={formData.notes || ''}
        onChange={handleInputChange}
        icon={Notebook}
        placeholder="Ajoutez des informations importantes pour le suivi à long terme..."
        helpText="Utilisez ce champ pour noter les informations clés, l'historique des conversations et les points importants pour assurer un suivi efficace."
      />
    </div>
  );
};

export default BuyerInfoSection;
