import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { LeadDetailed } from '@/types/lead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LeadFormProps {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onChange?: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
  adminAssignedAgent?: string | undefined;
  isSubmitting?: boolean;
  hideSubmitButton?: boolean;
  currentUserTeamId?: string | undefined;
  enforceRlsRules?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  lead, 
  onSubmit, 
  onChange,
  onCancel, 
  activeTab = 'general',
  adminAssignedAgent,
  isSubmitting = false,
  hideSubmitButton = false,
  currentUserTeamId,
  enforceRlsRules = false,
}) => {
  const { isAdmin, isCommercial, user } = useAuth();
  const [formData, setFormData] = useState<LeadDetailed>({
    id: lead?.id || uuidv4(),
    name: lead?.name || '',
    salutation: lead?.salutation || undefined,
    email: lead?.email || '',
    phone: lead?.phone || '',
    phoneCountryCode: lead?.phoneCountryCode || '+33',
    phoneCountryCodeDisplay: lead?.phoneCountryCodeDisplay || '🇫🇷',
    location: lead?.location || '',
    status: lead?.status || 'New',
    tags: lead?.tags || [],
    assignedTo: lead?.assignedTo || adminAssignedAgent || undefined,
    createdAt: lead?.createdAt || new Date().toISOString(),
    lastContactedAt: lead?.lastContactedAt || undefined,
    source: lead?.source || undefined,
    country: lead?.country || undefined,
    propertyReference: lead?.propertyReference || '',
    budget: lead?.budget || '',
    budgetMin: lead?.budgetMin || '',
    currency: lead?.currency || 'EUR',
    desiredLocation: lead?.desiredLocation || '',
    propertyType: lead?.propertyType || undefined,
    propertyTypes: lead?.propertyTypes || [],
    bedrooms: lead?.bedrooms || undefined,
    views: lead?.views || [],
    amenities: lead?.amenities || [],
    purchaseTimeframe: lead?.purchaseTimeframe || undefined,
    financingMethod: lead?.financingMethod || undefined,
    propertyUse: lead?.propertyUse || undefined,
    nationality: lead?.nationality || '',
    preferredLanguage: lead?.preferredLanguage || '',
    taskType: lead?.taskType || undefined,
    notes: lead?.notes || '',
    url: lead?.url || '',
    pipelineType: lead?.pipelineType || 'purchase',
    taxResidence: lead?.taxResidence || '',
  });

  const [currentUserTeamMemberId, setCurrentUserTeamMemberId] = useState<string | undefined>(currentUserTeamId);

  useEffect(() => {
    const fetchCurrentUserTeamId = async () => {
      if ((isCommercial || enforceRlsRules) && user?.email) {
        try {
          console.log("[LeadForm] Récupération de l'ID de l'équipe pour l'utilisateur:", user.email);
          
          const { data, error } = await supabase
            .from('team_members')
            .select('id, name')
            .eq('email', user.email)
            .maybeSingle();
            
          if (error) {
            console.error("[LeadForm] Erreur lors de la récupération de l'ID de l'équipe:", error);
            return;
          }
          
          if (data) {
            console.log("[LeadForm] ID de l'équipe trouvé:", data.id, "pour", data.name);
            setCurrentUserTeamMemberId(data.id);
            
            if (enforceRlsRules && !isAdmin) {
              setFormData(prev => {
                if (!prev.assignedTo) {
                  console.log("[LeadForm] Auto-assignation au commercial actuel:", data.id);
                  return { ...prev, assignedTo: data.id };
                }
                return prev;
              });
            }
          } else {
            console.log("[LeadForm] Aucun membre d'équipe trouvé pour cet email");
          }
        } catch (error) {
          console.error("[LeadForm] Exception lors de la récupération de l'ID de l'équipe:", error);
        }
      }
    };
    
    fetchCurrentUserTeamId();
  }, [isCommercial, isAdmin, user, enforceRlsRules]);

  useEffect(() => {
    if (adminAssignedAgent !== undefined && isAdmin) {
      console.log("[LeadForm] Application de l'agent assigné par l'admin:", adminAssignedAgent);
      setFormData(prev => ({ ...prev, assignedTo: adminAssignedAgent }));
    } 
    else if (enforceRlsRules && !isAdmin && currentUserTeamMemberId) {
      console.log("[LeadForm] Auto-assignation au commercial actuel:", currentUserTeamMemberId);
      setFormData(prev => ({ ...prev, assignedTo: currentUserTeamMemberId }));
    }
  }, [adminAssignedAgent, currentUserTeamMemberId, isAdmin, isCommercial, enforceRlsRules]);

  useEffect(() => {
    if (lead) {
      setFormData(prev => ({
        ...prev,
        ...lead
      }));
    }
  }, [lead]);

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Le nom du lead est requis."
      });
      return;
    }
    
    if (enforceRlsRules && !isAdmin && currentUserTeamMemberId) {
      console.log("[LeadForm] Forçage de l'assignation au commercial actuel avant soumission:", currentUserTeamMemberId);
      const updatedData = { ...formData, assignedTo: currentUserTeamMemberId };
      
      if (!isSubmitting) {
        onSubmit(updatedData);
      }
    } else if (!isSubmitting) {
      onSubmit(formData);
    }
  };

  const handleSalutationChange = (value: string) => {
    if (value === 'M.' || value === 'Mme') {
      setFormData(prev => ({ ...prev, salutation: value }));
    }
  };

  const handleAssignedToChange = (value: string | undefined) => {
    if (enforceRlsRules && !isAdmin && value !== currentUserTeamMemberId && value !== undefined) {
      console.log("[LeadForm] Tentative d'assigner à quelqu'un d'autre avec RLS activé - bloqué");
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "Pour ce lead, l'assignation est restreinte."
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, assignedTo: value }));
  };

  console.log("[LeadForm] Render - isAdmin:", isAdmin, "isCommercial:", isCommercial);
  console.log("[LeadForm] currentUserTeamMemberId:", currentUserTeamMemberId);
  console.log("[LeadForm] formData.assignedTo:", formData.assignedTo);
  console.log("[LeadForm] enforceRlsRules:", enforceRlsRules);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salutation" className="text-sm">Titre</Label>
          <Select 
            value={formData.salutation || ''} 
            onValueChange={handleSalutationChange}
          >
            <SelectTrigger id="salutation" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un titre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M." className="font-futura">Monsieur</SelectItem>
              <SelectItem value="Mme" className="font-futura">Madame</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nom*</Label>
          <Input 
            id="name" 
            value={formData.name || ''} 
            onChange={handleInputChange}
            name="name"
            placeholder="Nom complet" 
            className="w-full font-futura"
            required
          />
        </div>

        <div className="space-y-2">
          <TeamMemberSelect
            value={formData.assignedTo}
            onChange={handleAssignedToChange}
            label="Attribuer à"
            disabled={enforceRlsRules && isCommercial && !isAdmin}
          />
        </div>
      </div>

      {!hideSubmitButton && (
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="relative bg-chocolate-dark hover:bg-chocolate-light"
          >
            {isSubmitting ? 'Sauvegarde en cours...' : (lead ? 'Sauvegarder' : 'Créer')}
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default LeadForm;
