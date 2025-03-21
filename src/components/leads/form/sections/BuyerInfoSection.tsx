
import React from 'react';
import { Notebook, Clock, CalendarClock, ListChecks } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BuyerInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BuyerInfoSection = ({
  formData,
  handleInputChange,
}: BuyerInfoSectionProps) => {
  const navigate = useNavigate();
  const lastUpdatedDate = formData.lastContactedAt 
    ? format(new Date(formData.lastContactedAt), 'dd/MM/yyyy à HH:mm')
    : 'Aucune mise à jour';

  const handleViewActions = () => {
    if (formData.id) {
      navigate(`/leads/${formData.id}`, { state: { activeTab: 'actions' } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-md border mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Dernière mise à jour: {lastUpdatedDate}
            </span>
          </div>
          {formData.id && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs"
              onClick={handleViewActions}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Voir les actions
            </Button>
          )}
        </div>
        
        {formData.taskType && (
          <div className="bg-white p-2 rounded-md border text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Action actuelle: {formData.taskType}</span>
            </div>
            {formData.nextFollowUpDate && (
              <div className="mt-1 pl-5">
                Prévue le: {format(new Date(formData.nextFollowUpDate), 'dd/MM/yyyy')}
              </div>
            )}
          </div>
        )}
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

      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm">
        <div className="flex items-start gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Suggestions pour le suivi</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700">
              <li>Utilisez l'onglet "Actions/Tâches" pour créer et suivre toutes les actions liées à ce lead</li>
              <li>Planifiez des rappels réguliers pour maintenir le contact</li>
              <li>Documentez chaque interaction dans les notes ci-dessus</li>
              <li>Mettez à jour le statut du lead après chaque action significative</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerInfoSection;
