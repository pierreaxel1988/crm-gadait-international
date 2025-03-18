
import React from 'react';
import { CalendarClock, CalendarDays, Activity, Tag } from 'lucide-react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import FormSection from './FormSection';
import FormInput from './FormInput';
import MultiSelectButtons from './MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface StatusSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagToggle?: (tag: LeadTag) => void;
  leadStatuses?: LeadStatus[];
  leadTags?: LeadTag[];
  sources?: LeadSource[];
}

const StatusSection = ({
  formData,
  handleInputChange,
  handleTagToggle,
  leadStatuses = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost", "Archived"] as LeadStatus[],
  leadTags = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"] as LeadTag[],
  sources
}: StatusSectionProps) => {
  // Use provided sources or default sources list
  const leadSources: LeadSource[] = sources || [
    "Site web", 
    "Réseaux sociaux", 
    "Portails immobiliers", 
    "Network", 
    "Repeaters", 
    "Recommandations",
    "Apporteur d'affaire",
    "Idealista",
    "Le Figaro",
    "Properstar",
    "Property Cloud",
    "L'express Property"
  ];

  // Regroupement des sources de portail immobilier pour l'affichage
  const isPortalSource = (source: string): boolean => {
    return [
      "Idealista",
      "Le Figaro",
      "Properstar",
      "Property Cloud",
      "L'express Property"
    ].includes(source);
  };

  // Fonction pour obtenir la source parent (pour les statistiques)
  const getParentSource = (source: string): string => {
    if (isPortalSource(source)) {
      return "Portails immobiliers";
    }
    return source;
  };

  // Traitement de la valeur de source pour les statistiques
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // La source originale est sauvegardée telle quelle
    handleInputChange(e);
    
    // Dans une application réelle, vous pourriez ici enregistrer 
    // l'information de catégorisation dans un champ séparé ou via une logique côté serveur
    console.log(`Source sélectionnée: ${value}, Catégorie parent: ${getParentSource(value)}`);
  };

  // Handle tag toggle if provided, otherwise create an empty handler
  const handleTagToggleInternal = handleTagToggle || ((tag: LeadTag) => {
    // Create a new array with the updated tags
    const updatedTags = formData.tags?.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...(formData.tags || []), tag];
    
    // Create a custom event-like object that conforms to the expected structure
    const syntheticEvent = {
      target: {
        name: 'tags',
        value: updatedTags
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    // Pass this synthetic event to the handleInputChange function
    handleInputChange(syntheticEvent);
  });

  return (
    <FormSection title="Statut et Suivi">
      <FormInput
        label="Statut du lead"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleInputChange}
        required
        icon={Activity}
        options={leadStatuses.map(status => ({ value: status, label: status }))}
      />

      <FormInput
        label="Source du lead"
        name="source"
        type="select"
        value={formData.source || ''}
        onChange={handleSourceChange}
        icon={Tag}
        options={leadSources.map(source => ({ value: source, label: source }))}
        placeholder="Sélectionner une source"
      />

      <FormInput
        label="Tags"
        name="tags"
        value=""
        onChange={() => {}}
        icon={Activity}
        renderCustomField={() => (
          <MultiSelectButtons
            options={leadTags}
            selectedValues={formData.tags || []}
            onToggle={handleTagToggleInternal}
          />
        )}
      />

      <FormInput
        label="Responsable du suivi"
        name="assignedTo"
        value={formData.assignedTo || ''}
        onChange={() => {}}
        renderCustomField={() => (
          <TeamMemberSelect
            value={formData.assignedTo}
            onChange={(value) => {
              const event = {
                target: {
                  name: 'assignedTo',
                  value: value || ''
                }
              } as React.ChangeEvent<HTMLInputElement>;
              handleInputChange(event);
            }}
          />
        )}
      />

      <FormInput
        label="Date du dernier contact"
        name="lastContactedAt"
        type="date"
        value={formData.lastContactedAt || ''}
        onChange={handleInputChange}
        icon={CalendarClock}
      />

      <FormInput
        label="Prochain suivi prévu"
        name="nextFollowUpDate"
        type="date"
        value={formData.nextFollowUpDate || ''}
        onChange={handleInputChange}
        icon={CalendarDays}
      />
    </FormSection>
  );
};

export default StatusSection;
