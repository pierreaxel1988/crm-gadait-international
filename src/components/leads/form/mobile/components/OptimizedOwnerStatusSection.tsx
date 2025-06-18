
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { getRequiredFieldsForStatus } from '@/utils/ownerValidationHelper';
import { Activity, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface OptimizedOwnerStatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OptimizedOwnerStatusSection: React.FC<OptimizedOwnerStatusSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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
          checkRequiredFields(data);
        }
      } catch (error) {
        console.error('Error in fetchOwnerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [lead.id, lead.pipelineType]);

  const checkRequiredFields = (data: Owner) => {
    if (!data.status) return;
    
    const requiredFields = getRequiredFieldsForStatus(data.status);
    const missing = requiredFields.filter(field => {
      const value = data[field as keyof Owner];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    setMissingFields(missing);
  };

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
          description: "Impossible de mettre à jour le statut."
        });
        return;
      }

      const updatedData = { ...ownerData, ...updates };
      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      checkRequiredFields(updatedData as Owner);
      
      toast({
        title: "Succès",
        description: "Statut mis à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const ownerStatuses = [
    { value: "Nouveau contact", label: "Nouveau contact", color: "bg-blue-100 text-blue-800" },
    { value: "Rendez-vous programmé", label: "Rendez-vous programmé", color: "bg-yellow-100 text-yellow-800" },
    { value: "Visite effectuée", label: "Visite effectuée", color: "bg-orange-100 text-orange-800" },
    { value: "Mandat en négociation", label: "Mandat en négociation", color: "bg-purple-100 text-purple-800" },
    { value: "Mandat signé", label: "Mandat signé", color: "bg-indigo-100 text-indigo-800" },
    { value: "Bien en commercialisation", label: "Bien en commercialisation", color: "bg-teal-100 text-teal-800" },
    { value: "Offre reçue", label: "Offre reçue", color: "bg-amber-100 text-amber-800" },
    { value: "Compromis signé", label: "Compromis signé", color: "bg-emerald-100 text-emerald-800" },
    { value: "Vente finalisée", label: "Vente finalisée", color: "bg-green-100 text-green-800" },
    { value: "Perdu/Annulé", label: "Perdu/Annulé", color: "bg-red-100 text-red-800" }
  ];

  const taskTypes = [
    { value: "Call", label: "Appel téléphonique" },
    { value: "Visites", label: "Visite du bien" },
    { value: "Compromis", label: "Signature compromis" },
    { value: "Acte de vente", label: "Signature acte de vente" },
    { value: "Estimation", label: "Estimation du bien" },
    { value: "Prospection", label: "Prospection commerciale" },
    { value: "Follow up", label: "Suivi client" },
    { value: "Admin", label: "Tâche administrative" }
  ];

  const getCurrentStatus = () => {
    return ownerStatuses.find(s => s.value === ownerData?.status);
  };

  return (
    <div className="space-y-6">
      {/* Status Validation */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <div className="font-medium mb-1">Champs manquants pour ce statut :</div>
            <ul className="list-disc list-inside space-y-0.5">
              {missingFields.map(field => (
                <li key={field}>{field === 'full_name' ? 'Nom complet' : field}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Current Status Display */}
      {ownerData?.status && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <Activity className="h-5 w-5 text-gray-600" />
          <div>
            <div className="text-sm font-futura text-gray-600">Statut actuel</div>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCurrentStatus()?.color || 'bg-gray-100 text-gray-800'}`}>
              {ownerData.status}
            </div>
          </div>
        </div>
      )}

      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-futura flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Statut du propriétaire
        </Label>
        <StyledSelect
          id="status"
          value={ownerData?.status || 'Nouveau contact'}
          onChange={e => updateOwnerData({ status: e.target.value })}
          options={ownerStatuses}
          disabled={loading}
        />
      </div>

      {/* Assigned To */}
      <div className="space-y-2">
        <Label htmlFor="assigned_to" className="text-sm font-futura">Responsable du suivi</Label>
        <TeamMemberSelect
          value={ownerData?.assigned_to}
          onChange={(value) => updateOwnerData({ assigned_to: value })}
          label=""
        />
      </div>

      {/* Task Type */}
      <div className="space-y-2">
        <Label htmlFor="task_type" className="text-sm font-futura">Prochaine tâche</Label>
        <StyledSelect
          id="task_type"
          value={ownerData?.task_type || ''}
          onChange={e => updateOwnerData({ task_type: e.target.value })}
          placeholder="Sélectionner un type de tâche"
          options={taskTypes}
          disabled={loading}
        />
      </div>

      {/* Next Follow Up */}
      <div className="space-y-2">
        <Label htmlFor="next_follow_up_date" className="text-sm font-futura flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Prochain suivi prévu
        </Label>
        <Input 
          id="next_follow_up_date" 
          type="datetime-local"
          value={ownerData?.next_follow_up_date || ''} 
          onChange={e => updateOwnerData({ next_follow_up_date: e.target.value })} 
          className="font-futura"
          disabled={loading}
        />
      </div>

      {/* Last Contact Display */}
      <div className="space-y-2">
        <Label className="text-sm font-futura flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Dernière interaction
        </Label>
        <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700">
          {ownerData?.last_contacted_at 
            ? new Date(ownerData.last_contacted_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Aucune interaction enregistrée'}
        </div>
      </div>

      {/* Status Completion Indicator */}
      {missingFields.length === 0 && ownerData?.status && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-futura text-green-800">
            Toutes les informations requises sont complètes pour ce statut
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedOwnerStatusSection;
