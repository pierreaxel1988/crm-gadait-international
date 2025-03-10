
import React from 'react';
import { User, Mail, Phone, MapPin, Tag, Clipboard, Globe } from 'lucide-react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';

interface GeneralInformationFieldsProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const GeneralInformationFields: React.FC<GeneralInformationFieldsProps> = ({
  formData,
  handleInputChange
}) => {
  const leadSources: LeadSource[] = [
    'Site web', 'Réseaux sociaux', 'Portails immobiliers', 
    'Network', 'Repeaters', 'Recommandations', 'Apporteur d\'affaire'
  ];

  const countries: Country[] = [
    'Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 
    'Portugal', 'Seychelles', 'Spain', 'Switzerland', 
    'United Arab Emirates', 'United Kingdom', 'United States'
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Informations Générales</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <User className="h-4 w-4 mr-1" /> Nom complet*
          </span>
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Mail className="h-4 w-4 mr-1" /> Adresse email*
          </span>
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Phone className="h-4 w-4 mr-1" /> Numéro de téléphone
          </span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> Localisation
          </span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Tag className="h-4 w-4 mr-1" /> Source du lead
          </span>
        </label>
        <select
          name="source"
          value={formData.source || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner une source</option>
          {leadSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Clipboard className="h-4 w-4 mr-1" /> Référence du bien
          </span>
        </label>
        <input
          type="text"
          name="propertyReference"
          value={formData.propertyReference || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Globe className="h-4 w-4 mr-1" /> Pays
          </span>
        </label>
        <select
          name="country"
          value={formData.country || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner un pays</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GeneralInformationFields;
