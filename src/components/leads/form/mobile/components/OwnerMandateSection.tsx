
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import { validateMandateFields } from '@/utils/ownerValidationHelper';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface OwnerMandateSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerMandateSection: React.FC<OwnerMandateSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(validateMandateFields({}));

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (lead.pipelineType !== 'owners' || !lead.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', lead.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching owner data:', error);
          return;
        }

        if (data) {
          setOwnerData(data as Owner);
          setValidationResult(validateMandateFields(data));
        }
      } catch (error) {
        console.error('Error in fetchOwnerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [lead.id, lead.pipelineType]);

  const updateOwnerData = async (updates: Partial<Owner>) => {
    if (!lead.id || lead.pipelineType !== 'owners') return;

    try {
      const { error } = await supabase
        .from('owners')
        .update(updates)
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating owner data:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour les informations du mandat."
        });
        return;
      }

      const updatedData = { ...ownerData, ...updates };
      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      setValidationResult(validateMandateFields(updatedData));
      
      toast({
        title: "Succès",
        description: "Informations du mandat mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const relationshipStatuses = [
    { value: "Nouveau contact", label: "Nouveau contact" },
    { value: "Contact établi", label: "Contact établi" },
    { value: "Relation de confiance", label: "Relation de confiance" },
    { value: "Client fidèle", label: "Client fidèle" },
    { value: "Relation difficile", label: "Relation difficile" }
  ];

  const mandateTypes = [
    { value: "Simple", label: "Mandat simple" },
    { value: "Semi-exclusif", label: "Mandat semi-exclusif" },
    { value: "Exclusif", label: "Mandat exclusif" }
  ];

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {!validationResult.isValid && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <div className="text-sm text-amber-800">
            {validationResult.errors.join(', ')}
          </div>
        </div>
      )}

      {validationResult.warnings.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <div className="text-sm text-blue-800">
            {validationResult.warnings.join(', ')}
          </div>
        </div>
      )}

      {/* Relationship Status */}
      <div className="space-y-2">
        <Label htmlFor="relationship_status" className="text-sm font-futura">
          Statut de la relation
        </Label>
        <StyledSelect
          id="relationship_status"
          value={ownerData?.relationship_status || 'Nouveau contact'}
          onChange={e => updateOwnerData({ relationship_status: e.target.value })}
          options={relationshipStatuses}
          disabled={loading}
        />
      </div>

      {/* Mandate Type */}
      <div className="space-y-2">
        <Label htmlFor="mandate_type" className="text-sm font-futura">
          Type de mandat
        </Label>
        <StyledSelect
          id="mandate_type"
          value={ownerData?.mandate_type || ''}
          onChange={e => updateOwnerData({ mandate_type: e.target.value })}
          placeholder="Sélectionner un type de mandat"
          options={mandateTypes}
          disabled={loading}
        />
      </div>

      {/* Mandate Dates */}
      {ownerData?.mandate_type && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mandate_start_date" className="text-sm font-futura flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date de début
            </Label>
            <Input 
              id="mandate_start_date" 
              type="date"
              value={ownerData?.mandate_start_date ? new Date(ownerData.mandate_start_date).toISOString().split('T')[0] : ''}
              onChange={e => updateOwnerData({ mandate_start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="font-futura"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mandate_end_date" className="text-sm font-futura flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date de fin
            </Label>
            <Input 
              id="mandate_end_date" 
              type="date"
              value={ownerData?.mandate_end_date ? new Date(ownerData.mandate_end_date).toISOString().split('T')[0] : ''}
              onChange={e => updateOwnerData({ mandate_end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="font-futura"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Mandate Conditions */}
      {ownerData?.mandate_type && (
        <div className="space-y-2">
          <Label htmlFor="mandate_conditions" className="text-sm font-futura">
            Conditions du mandat
          </Label>
          <Textarea 
            id="mandate_conditions" 
            value={ownerData?.mandate_conditions || ''}
            onChange={e => updateOwnerData({ mandate_conditions: e.target.value })}
            placeholder="Détails des conditions du mandat, commission, exclusivités..."
            className="font-futura min-h-[100px]"
            disabled={loading}
          />
        </div>
      )}

      {/* Relationship Details */}
      <div className="space-y-2">
        <Label htmlFor="relationship_details" className="text-sm font-futura">
          Détails de la relation
        </Label>
        <Textarea 
          id="relationship_details" 
          value={ownerData?.relationship_details || ''}
          onChange={e => updateOwnerData({ relationship_details: e.target.value })}
          placeholder="Historique de la relation, préférences du client, points d'attention..."
          className="font-futura min-h-[80px]"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OwnerMandateSection;
