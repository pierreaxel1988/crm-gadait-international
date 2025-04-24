
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LeadDetailed } from '@/types/lead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import ContactSection from './form/sections/ContactSection';
import StatusSection from './form/StatusSection';
import SearchCriteriaSection from './form/SearchCriteriaSection';
import NotesSection from './form/sections/NotesSection';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { LeadSource, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { COUNTRIES } from '@/utils/countries';
import TeamMemberSelect from './TeamMemberSelect';

interface LeadFormProps {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onChange?: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
  adminAssignedAgent?: string | undefined;
  isSubmitting?: boolean;
  hideSubmitButton?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  lead, 
  onSubmit, 
  onChange,
  onCancel, 
  activeTab = 'general',
  adminAssignedAgent,
  isSubmitting = false,
  hideSubmitButton = false
}) => {
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

  const [activeFormTab, setActiveFormTab] = useState(activeTab);
  
  // Statuts de lead disponibles
  const leadStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];
  
  // Tags disponibles
  const leadTags: LeadTag[] = [
    'Vip', 'Hot', 'Serious', 'Cold', 'No response', 'No phone', 'Fake'
  ];
  
  // Sources de lead disponibles
  const leadSources: LeadSource[] = [
    'Site web', 'Réseaux sociaux', 'Portails immobiliers', 'Network', 'Repeaters', 'Recommandations',
    'Apporteur d\'affaire', 'Idealista', 'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property',
    'James Edition', 'Annonce', 'Email', 'Téléphone', 'Autre'
  ];
  
  // Types de propriété
  const propertyTypes: PropertyType[] = [
    'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 'Terrain', 'Manoir', 
    'Maison de ville', 'Château', 'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];
  
  // Types de vue
  const viewTypes: ViewType[] = [
    'Mer', 'Montagne', 'Golf', 'Autres'
  ];
  
  // Prestations
  const amenities: Amenity[] = [
    'Piscine', 'Jardin', 'Terrasse', 'Parking', 'Ascenseur', 'Vue mer', 'Climatisation', 'Sécurité'
  ];
  
  // Délai d'achat
  const purchaseTimeframes: PurchaseTimeframe[] = [
    'Moins de trois mois', 'Plus de trois mois'
  ];
  
  // Méthode de financement
  const financingMethods: FinancingMethod[] = [
    'Cash', 'Prêt bancaire'
  ];
  
  // Utilisation de la propriété
  const propertyUses: PropertyUse[] = [
    'Investissement locatif', 'Résidence principale'
  ];

  useEffect(() => {
    if (adminAssignedAgent !== undefined) {
      setFormData(prev => ({ ...prev, assignedTo: adminAssignedAgent }));
    }
  }, [adminAssignedAgent]);

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseInt(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleMultiSelectToggle = <T extends string>(name: keyof LeadDetailed, value: T) => {
    setFormData(prev => {
      const currentValues = prev[name] as T[] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [name]: newValues };
    });
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
    
    if (!isSubmitting) {
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

  const handleTagToggle = (tag: LeadTag) => {
    const updatedTags = formData.tags?.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...(formData.tags || []), tag];
    
    setFormData(prev => ({ ...prev, tags: updatedTags }));
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, desiredLocation: '' }));
  };

  const handleAgentChange = (value: string | undefined) => {
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
        
        {/* Agent select */}
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm">Commercial assigné</Label>
          <TeamMemberSelect
            value={formData.assignedTo}
            onChange={handleAgentChange}
            label="Commercial assigné"
          />
        </div>
      </div>

      <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="pt-4">
        <TabsContent value="general" className="space-y-6 mt-0">
          <ContactSection formData={formData} handleInputChange={handleInputChange} />
          <StatusSection 
            formData={formData} 
            handleInputChange={handleInputChange}
            handleTagToggle={handleTagToggle}
            leadStatuses={leadStatuses}
            leadTags={leadTags}
            sources={leadSources}
          />
        </TabsContent>
        <TabsContent value="criteria" className="mt-0">
          <SearchCriteriaSection 
            formData={formData}
            handleInputChange={handleInputChange}
            handleNumberChange={handleNumberChange}
            handleMultiSelectToggle={handleMultiSelectToggle}
            propertyTypes={propertyTypes}
            viewTypes={viewTypes}
            amenities={amenities}
            purchaseTimeframes={purchaseTimeframes}
            financingMethods={financingMethods}
            propertyUses={propertyUses}
            countries={COUNTRIES}
            handleCountryChange={handleCountryChange}
          />
        </TabsContent>
        <TabsContent value="notes" className="mt-0">
          <NotesSection formData={formData} handleInputChange={handleInputChange} />
        </TabsContent>
      </Tabs>

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
