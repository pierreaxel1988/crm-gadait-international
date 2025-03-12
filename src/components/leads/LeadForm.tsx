import React, { useState } from 'react';
import { LeadDetailed, LeadSource, PropertyType, ViewType, Amenity, 
  PurchaseTimeframe, FinancingMethod, PropertyUse, Country } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';

// Import refactored form sections
import GeneralInfoSection from './form/GeneralInfoSection';
import SearchCriteriaSection from './form/SearchCriteriaSection';
import StatusSection from './form/StatusSection';

type LeadFormProps = {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
};

const LeadForm = ({ lead, onSubmit, onCancel, activeTab = 'informations' }: LeadFormProps) => {
  const [formData, setFormData] = useState<LeadDetailed>(
    lead || {
      id: '',
      name: '',
      email: '',
      status: 'New',
      tags: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  const handleTagToggle = (tag: LeadTag) => {
    setFormData(prev => {
      const tags = prev.tags || [];
      return {
        ...prev,
        tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
      };
    });
  };

  const handleMultiSelectToggle = <T extends string>(name: keyof LeadDetailed, value: T) => {
    setFormData(prev => {
      const currentValues = prev[name] as T[] || [];
      return {
        ...prev,
        [name]: currentValues.includes(value) 
          ? currentValues.filter(v => v !== value) 
          : [...currentValues, value]
      };
    });
  };

  // Define constants for form options
  const leadSources: LeadSource[] = [
    'Site web', 'Réseaux sociaux', 'Portails immobiliers', 
    'Network', 'Repeaters', 'Recommandations', 'Apporteur d\'affaire',
    'Idealista', 'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property'
  ];

  const taskTypes: TaskType[] = [
    'Call', 'Visites', 'Compromis', 'Acte de vente', 'Contrat de Location',
    'Propositions', 'Follow up', 'Estimation', 'Prospection', 'Admin'
  ];

  const propertyTypes: PropertyType[] = [
    'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 
    'Chalet', 'Terrain', 'Manoir', 'Maison de ville', 'Château', 
    'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  const countries: Country[] = [
    'Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 
    'Portugal', 'Seychelles', 'Spain', 'Switzerland', 
    'United Arab Emirates', 'United Kingdom', 'United States'
  ];

  const viewTypes: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
  const amenities: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité'];
  const purchaseTimeframes: PurchaseTimeframe[] = ['Moins de trois mois', 'Plus de trois mois'];
  const financingMethods: FinancingMethod[] = ['Cash', 'Prêt bancaire'];
  const propertyUses: PropertyUse[] = ['Investissement locatif', 'Résidence principale'];
  
  const leadTags: LeadTag[] = ['Vip', 'Hot', 'Serious', 'Cold', 'No response', 'No phone', 'Fake'];
  
  const leadStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 
    'Offer', 'Deposit', 'Signed'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        {activeTab === 'informations' && (
          <GeneralInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
            leadSources={leadSources}
            countries={countries}
          />
        )}
        
        {activeTab === 'criteres' && (
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
          />
        )}
        
        {activeTab === 'statut' && (
          <StatusSection 
            formData={formData}
            handleInputChange={handleInputChange}
            handleTagToggle={handleTagToggle}
            leadStatuses={leadStatuses}
            leadTags={leadTags}
          />
        )}
      </div>

      <div className="flex justify-end gap-3">
        <CustomButton 
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </CustomButton>
        <CustomButton type="submit">
          Enregistrer
        </CustomButton>
      </div>
    </form>
  );
};

export default LeadForm;
