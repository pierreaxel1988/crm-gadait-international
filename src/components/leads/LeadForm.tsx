import React, { useState } from 'react';
import { 
  Banknote, Building, CalendarClock, CalendarDays, Clipboard, Flag, HelpCircle, 
  Home, MapPin, Phone, PlusCircle, Tag, User, Mail, Check, Building2 
} from 'lucide-react';
import { LeadDetailed, LeadSource, PropertyType, ViewType, Amenity, 
  PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import CustomButton from '@/components/ui/CustomButton';
import { cn } from '@/lib/utils';

type LeadFormProps = {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
};

const LeadForm = ({ lead, onSubmit, onCancel }: LeadFormProps) => {
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

  const leadSources: LeadSource[] = [
    'Site web', 'Réseaux sociaux', 'Portails immobiliers', 
    'Network', 'Repeaters', 'Recommandations', 'Apporteur d\'affaire'
  ];

  const propertyTypes: PropertyType[] = [
    'Villa', 'Appartement', 'Penthouse', 'Terrain', 
    'Commercial', 'Hotel', 'Vignoble', 'Autres'
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
      <div className="grid gap-6 md:grid-cols-2">
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
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Statut et Suivi</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Statut du lead*
              </label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="luxury-input w-full"
              >
                {leadStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {leadTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                      formData.tags?.includes(tag)
                        ? "bg-primary text-white"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    )}
                  >
                    {formData.tags?.includes(tag) && <Check className="h-3 w-3" />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Responsable du suivi
              </label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo || ''}
                onChange={handleInputChange}
                className="luxury-input w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <span className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-1" /> Date du dernier contact
                </span>
              </label>
              <input
                type="date"
                name="lastContactedAt"
                value={formData.lastContactedAt || ''}
                onChange={handleInputChange}
                className="luxury-input w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <span className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" /> Prochain suivi prévu
                </span>
              </label>
              <input
                type="date"
                name="nextFollowUpDate"
                value={formData.nextFollowUpDate || ''}
                onChange={handleInputChange}
                className="luxury-input w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Critères de Recherche</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Banknote className="h-4 w-4 mr-1" /> Budget
              </span>
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
              placeholder="ex: 1.500.000€ - 2.000.000€"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> Localisation souhaitée
              </span>
            </label>
            <input
              type="text"
              name="desiredLocation"
              value={formData.desiredLocation || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Building className="h-4 w-4 mr-1" /> Type de bien
              </span>
            </label>
            <select
              name="propertyType"
              value={formData.propertyType || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
            >
              <option value="">Sélectionner un type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" /> Surface habitable
              </span>
            </label>
            <input
              type="text"
              name="livingArea"
              value={formData.livingArea || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
              placeholder="ex: 200-300m²"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Home className="h-4 w-4 mr-1" /> Nombre de chambres
              </span>
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms || ''}
              onChange={handleNumberChange}
              className="luxury-input w-full"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Vue souhaitée
            </label>
            <div className="flex flex-wrap gap-2">
              {viewTypes.map(view => (
                <button
                  key={view}
                  type="button"
                  onClick={() => handleMultiSelectToggle('views', view)}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                    formData.views?.includes(view)
                      ? "bg-primary text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {formData.views?.includes(view) && <Check className="h-3 w-3" />}
                  {view}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Prestations souhaitées
            </label>
            <div className="flex flex-wrap gap-2">
              {amenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleMultiSelectToggle('amenities', amenity)}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                    formData.amenities?.includes(amenity)
                      ? "bg-primary text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {formData.amenities?.includes(amenity) && <Check className="h-3 w-3" />}
                  {amenity}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Date d'achat souhaitée
            </label>
            <div className="flex gap-2">
              {purchaseTimeframes.map(timeframe => (
                <button
                  key={timeframe}
                  type="button"
                  onClick={() => setFormData({...formData, purchaseTimeframe: timeframe})}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                    formData.purchaseTimeframe === timeframe
                      ? "bg-primary text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {formData.purchaseTimeframe === timeframe && <Check className="h-3 w-3" />}
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Mode de financement
            </label>
            <div className="flex gap-2">
              {financingMethods.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({...formData, financingMethod: method})}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                    formData.financingMethod === method
                      ? "bg-primary text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {formData.financingMethod === method && <Check className="h-3 w-3" />}
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Type d'investissement
            </label>
            <div className="flex gap-2">
              {propertyUses.map(use => (
                <button
                  key={use}
                  type="button"
                  onClick={() => setFormData({...formData, propertyUse: use})}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                    formData.propertyUse === use
                      ? "bg-primary text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {formData.propertyUse === use && <Check className="h-3 w-3" />}
                  {use}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Flag className="h-4 w-4 mr-1" /> Nationalité
              </span>
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <Flag className="h-4 w-4 mr-1" /> Résidence fiscale
              </span>
            </label>
            <input
              type="text"
              name="taxResidence"
              value={formData.taxResidence || ''}
              onChange={handleInputChange}
              className="luxury-input w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" /> Notes
              </span>
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              className="luxury-input w-full min-h-[100px]"
            />
          </div>
        </div>
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
