
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner, LeadSource, LeadTag, MauritiusRegion } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import MultiSelectButtons from '../../MultiSelectButtons';
import { User, Mail, Phone, Globe, Tag, MapPin } from 'lucide-react';

interface OptimizedOwnerInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OptimizedOwnerInfoSection: React.FC<OptimizedOwnerInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);

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
          description: "Impossible de mettre à jour les informations."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const salutationOptions = [
    { value: 'M.', label: 'M.' },
    { value: 'Mme', label: 'Mme' }
  ];

  const sources: LeadSource[] = [
    "Site web", "Réseaux sociaux", "Portails immobiliers", "Network", 
    "Repeaters", "Recommandations", "Apporteur d'affaire", "Idealista",
    "Le Figaro", "Properstar", "Property Cloud", "L'express Property",
    "James Edition", "Annonce", "Email", "Téléphone", "Autre", "Recommendation"
  ];

  const availableTags: LeadTag[] = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

  const mauritiusRegions: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-futura uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          Informations personnelles
        </h4>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="salutation" className="text-sm font-futura">Civilité</Label>
            <StyledSelect
              id="salutation"
              value={ownerData?.salutation || ''}
              onChange={e => updateOwnerData({ salutation: e.target.value as 'M.' | 'Mme' })}
              placeholder="Civilité"
              options={salutationOptions}
              disabled={loading}
            />
          </div>
          
          <div className="col-span-2 space-y-2">
            <Label htmlFor="full_name" className="text-sm font-futura">Nom complet *</Label>
            <Input 
              id="full_name" 
              value={ownerData?.full_name || ''}
              onChange={e => updateOwnerData({ full_name: e.target.value })}
              className="font-futura"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-futura flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Email
          </Label>
          <Input 
            id="email" 
            type="email"
            value={ownerData?.email || ''}
            onChange={e => updateOwnerData({ email: e.target.value })}
            className="font-futura"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-futura flex items-center gap-1">
            <Phone className="h-3 w-3" />
            Téléphone *
          </Label>
          <Input 
            id="phone" 
            type="tel"
            value={ownerData?.phone || ''}
            onChange={e => updateOwnerData({ phone: e.target.value })}
            className="font-futura"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm font-futura flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Nationalité
          </Label>
          <Input 
            id="nationality" 
            value={ownerData?.nationality || ''}
            onChange={e => updateOwnerData({ nationality: e.target.value })}
            className="font-futura"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_language" className="text-sm font-futura">Langue préférée</Label>
          <StyledSelect
            id="preferred_language"
            value={ownerData?.preferred_language || ''}
            onChange={e => updateOwnerData({ preferred_language: e.target.value })}
            placeholder="Langue de communication"
            options={[
              { value: 'français', label: 'Français' },
              { value: 'english', label: 'English' },
              { value: 'español', label: 'Español' },
              { value: 'italiano', label: 'Italiano' },
              { value: 'deutsch', label: 'Deutsch' },
              { value: 'português', label: 'Português' }
            ]}
            disabled={loading}
          />
        </div>
      </div>

      {/* Source & Classification */}
      <div className="space-y-4">
        <h4 className="text-sm font-futura uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Source & Classification
        </h4>

        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm font-futura">Source du contact</Label>
          <StyledSelect
            id="source"
            value={ownerData?.source || ''}
            onChange={e => updateOwnerData({ source: e.target.value as LeadSource })}
            placeholder="Sélectionner une source"
            options={sources.map(source => ({ value: source, label: source }))}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_reference" className="text-sm font-futura">Référence du bien</Label>
          <Input 
            id="property_reference" 
            value={ownerData?.property_reference || ''}
            onChange={e => updateOwnerData({ property_reference: e.target.value })}
            placeholder="REF-XXXX"
            className="font-futura"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-futura">URL du bien</Label>
          <Input 
            id="url" 
            type="url"
            value={ownerData?.url || ''}
            onChange={e => updateOwnerData({ url: e.target.value })}
            placeholder="https://..."
            className="font-futura"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-futura">Tags</Label>
          <MultiSelectButtons
            options={availableTags}
            selectedValues={ownerData?.tags || []}
            onToggle={(tag) => {
              const currentTags = ownerData?.tags || [];
              const updatedTags = currentTags.includes(tag)
                ? currentTags.filter(t => t !== tag)
                : [...currentTags, tag];
              updateOwnerData({ tags: updatedTags });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-futura flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Régions (Maurice)
          </Label>
          <MultiSelectButtons
            options={mauritiusRegions}
            selectedValues={ownerData?.regions || []}
            onToggle={(region) => {
              const currentRegions = ownerData?.regions || [];
              const updatedRegions = currentRegions.includes(region)
                ? currentRegions.filter(r => r !== region)
                : [...currentRegions, region];
              updateOwnerData({ regions: updatedRegions });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OptimizedOwnerInfoSection;
