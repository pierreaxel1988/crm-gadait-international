
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LeadDetailed } from '@/types/lead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { useAuth } from '@/hooks/useAuth';

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
  currentUserTeamId
}) => {
  const { isAdmin } = useAuth();
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
    assignedTo: lead?.assignedTo || undefined,
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

  useEffect(() => {
    // Si un agent est spécifié par l'admin, mettre à jour le formulaire
    if (isAdmin && adminAssignedAgent !== undefined) {
      setFormData(prev => ({ ...prev, assignedTo: adminAssignedAgent }));
    } 
    // Si l'utilisateur est un commercial non-admin, forcer l'auto-assignation
    else if (!isAdmin && currentUserTeamId) {
      setFormData(prev => ({ ...prev, assignedTo: currentUserTeamId }));
    }
  }, [adminAssignedAgent, isAdmin, currentUserTeamId]);

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
    
    // Pour les commerciaux (non-admin), on vérifie que le lead est bien auto-assigné
    if (!isAdmin && currentUserTeamId && formData.assignedTo !== currentUserTeamId) {
      console.log("Setting assignedTo to current user before submit:", currentUserTeamId);
      const updatedData = { ...formData, assignedTo: currentUserTeamId };
      
      if (!isSubmitting) {
        onSubmit(updatedData);
      }
    } else if (!isSubmitting) {
      onSubmit(formData);
    }
  };

  // The key fix: ensure salutation is correctly typed
  const handleSalutationChange = (value: string) => {
    // Only set the value if it matches the expected type
    if (value === 'M.' || value === 'Mme') {
      setFormData(prev => ({ ...prev, salutation: value }));
    }
  };

  // Handle assignedTo changes
  const handleAssignedToChange = (value: string | undefined) => {
    // Si l'utilisateur n'est pas admin, on force l'assignation à lui-même
    if (!isAdmin && currentUserTeamId && value !== currentUserTeamId) {
      console.log("Non-admin trying to change assignedTo in form. Ignoring.");
      return;
    }
    
    setFormData(prev => ({ ...prev, assignedTo: value }));
  };

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
            enforceRlsRules={true}
            disabled={!isAdmin}
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
