
import React from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { LeadTag } from '@/components/common/TagBadge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StyledSelect from './StyledSelect';
import MultiSelectButtons from '../../MultiSelectButtons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface OwnerInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerInfoSection: React.FC<OwnerInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const handleTagToggle = (tag: string) => {
    const currentTags = lead.tags || [];
    const updatedTags = currentTags.includes(tag as LeadTag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag as LeadTag];
    
    onDataChange({ tags: updatedTags });
  };

  const LEAD_SOURCES: LeadSource[] = [
    "Site web", "Réseaux sociaux", "Portails immobiliers", "Network", 
    "Repeaters", "Recommandations", "Apporteur d'affaire", "Idealista",
    "Le Figaro", "Properstar", "Property Cloud", "L'express Property",
    "James Edition", "Annonce", "Email", "Téléphone", "Autre", "Recommendation"
  ];

  const LEAD_TAGS = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

  const NATIONALITIES = [
    "Française", "Britannique", "Allemande", "Italienne", "Espagnole", "Belge", 
    "Suisse", "Américaine", "Canadienne", "Australienne", "Néerlandaise", 
    "Portugaise", "Russe", "Japonaise", "Chinoise", "Indienne", "Brésilienne",
    "Argentine", "Mexicaine", "Sud-africaine", "Égyptienne", "Marocaine", 
    "Tunisienne", "Algérienne", "Mauricienne", "Seychelloise", "Maldivienne",
    "Émirati", "Saoudienne", "Qatarie", "Koweïtienne", "Libanaise", "Jordanienne",
    "Grecque", "Turque", "Norvégienne", "Suédoise", "Danoise", "Finlandaise",
    "Polonaise", "Tchèque", "Hongroise", "Roumaine", "Bulgare", "Croate",
    "Serbe", "Slovène", "Slovaque", "Estonienne", "Lettone", "Lituanienne",
    "Ukrainienne", "Biélorusse", "Moldave", "Géorgienne", "Arménienne",
    "Azerbaïdjanaise", "Kazakhe", "Ouzbèke", "Kirghize", "Tadjike", "Turkmène",
    "Iranienne", "Irakienne", "Syrienne", "Afghane", "Pakistanaise", "Bangladaise",
    "Sri-lankaise", "Népalaise", "Bhoutanaise", "Mongole", "Coréenne du Nord",
    "Coréenne du Sud", "Thaïlandaise", "Vietnamienne", "Cambodgienne", "Laotienne",
    "Birmane", "Malaisienne", "Singapourienne", "Indonésienne", "Philippine",
    "Brunéienne", "Timor-Oriental", "Papouasie-Nouvelle-Guinée", "Australienne",
    "Néo-zélandaise", "Fidjienne", "Tonguienne", "Samoane", "Vanuatuaise"
  ];

  const COUNTRIES = [
    "France", "Monaco", "Switzerland", "Italy", "Spain", "Portugal", 
    "United Kingdom", "Germany", "Belgium", "Netherlands", "Mauritius", "Dubai", "USA"
  ];

  const LANGUAGES = [
    "Français", "English", "Español", "Deutsch", "Italiano", "Nederlands", 
    "Português", "русский", "中文", "العربية", "हिन्दी", "日本語"
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Civilité</Label>
        <RadioGroup 
          value={lead.salutation || ''} 
          onValueChange={(value) => onDataChange({ salutation: value as 'M.' | 'Mme' })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="M." id="monsieur" />
            <Label htmlFor="monsieur" className="text-sm font-futura cursor-pointer">M.</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Mme" id="madame" />
            <Label htmlFor="madame" className="text-sm font-futura cursor-pointer">Mme</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm">Nom complet</Label>
        <Input 
          id="name" 
          value={lead.name || ''} 
          onChange={e => onDataChange({ name: e.target.value })} 
          placeholder="Nom et prénom" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={lead.email || ''} 
          onChange={e => onDataChange({ email: e.target.value })} 
          placeholder="exemple@email.com" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm">Téléphone</Label>
        <Input 
          id="phone" 
          type="tel"
          value={lead.phone || ''} 
          onChange={e => onDataChange({ phone: e.target.value })} 
          placeholder="+33 6 12 34 56 78" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="residenceCountry" className="text-sm">Pays de résidence</Label>
        <StyledSelect
          id="residenceCountry"
          value={lead.residenceCountry || ''}
          onChange={e => onDataChange({ residenceCountry: e.target.value })}
          placeholder="Sélectionner un pays"
          options={COUNTRIES.map(country => ({ value: country, label: country }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
        <StyledSelect
          id="nationality"
          value={lead.nationality || ''}
          onChange={e => onDataChange({ nationality: e.target.value })}
          placeholder="Sélectionner une nationalité"
          options={NATIONALITIES.map(nationality => ({ value: nationality, label: nationality }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLanguage" className="text-sm">Langue préférée</Label>
        <StyledSelect
          id="preferredLanguage"
          value={lead.preferredLanguage || ''}
          onChange={e => onDataChange({ preferredLanguage: e.target.value })}
          placeholder="Sélectionner une langue"
          options={LANGUAGES.map(language => ({ value: language, label: language }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source" className="text-sm">Source du contact</Label>
        <StyledSelect
          id="source"
          value={lead.source || ''}
          onChange={e => onDataChange({ source: e.target.value as LeadSource })}
          placeholder="Sélectionner une source"
          options={LEAD_SOURCES.map(source => ({ value: source, label: source }))}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Tags</Label>
        <MultiSelectButtons
          options={LEAD_TAGS}
          selectedValues={lead.tags || []}
          onToggle={handleTagToggle}
        />
      </div>
    </div>
  );
};

export default OwnerInfoSection;
