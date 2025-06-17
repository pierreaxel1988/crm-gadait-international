
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner, LeadSource, MauritiusRegion } from '@/types/lead';
import { LeadTag } from '@/components/common/TagBadge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupérer les données du propriétaire associé au lead
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

  // Mettre à jour les données du propriétaire
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
      toast({
        title: "Succès",
        description: "Informations mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = ownerData?.tags || [];
    const updatedTags = currentTags.includes(tag as LeadTag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag as LeadTag];
    
    updateOwnerData({ tags: updatedTags });
  };

  const LEAD_SOURCES: LeadSource[] = [
    "Site web", "Réseaux sociaux", "Portails immobiliers", "Network", 
    "Repeaters", "Recommandations", "Apporteur d'affaire", "Idealista",
    "Le Figaro", "Properstar", "Property Cloud", "L'express Property",
    "James Edition", "Annonce", "Email", "Téléphone", "Autre", "Recommendation"
  ];

  const LEAD_TAGS = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

  const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Civilité</Label>
        <RadioGroup 
          value={ownerData?.salutation || ''} 
          onValueChange={(value) => updateOwnerData({ salutation: value as 'M.' | 'Mme' })}
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
        <Label htmlFor="full_name" className="text-sm">Nom complet</Label>
        <Input 
          id="full_name" 
          value={ownerData?.full_name || ''} 
          onChange={e => updateOwnerData({ full_name: e.target.value })} 
          placeholder="Nom et prénom" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={ownerData?.email || ''} 
          onChange={e => updateOwnerData({ email: e.target.value })} 
          placeholder="exemple@email.com" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm">Téléphone</Label>
        <Input 
          id="phone" 
          type="tel"
          value={ownerData?.phone || ''} 
          onChange={e => updateOwnerData({ phone: e.target.value })} 
          placeholder="+33 6 12 34 56 78" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
        <Input 
          id="nationality" 
          value={ownerData?.nationality || ''} 
          onChange={e => updateOwnerData({ nationality: e.target.value })} 
          placeholder="Ex : Française" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source" className="text-sm">Source du contact</Label>
        <StyledSelect
          id="source"
          value={ownerData?.source || ''}
          onChange={e => updateOwnerData({ source: e.target.value as LeadSource })}
          placeholder="Sélectionner une source"
          options={LEAD_SOURCES.map(source => ({ value: source, label: source }))}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_reference" className="text-sm">Référence du bien</Label>
        <Input 
          id="property_reference" 
          value={ownerData?.property_reference || ''} 
          onChange={e => updateOwnerData({ property_reference: e.target.value })} 
          placeholder="Ex : REF-2024-001" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url" className="text-sm">URL du bien</Label>
        <Input 
          id="url" 
          type="url"
          value={ownerData?.url || ''} 
          onChange={e => updateOwnerData({ url: e.target.value })} 
          placeholder="https://..." 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Tags</Label>
        <MultiSelectButtons
          options={LEAD_TAGS}
          selectedValues={ownerData?.tags || []}
          onToggle={handleTagToggle}
        />
      </div>

      {ownerData?.country === 'Mauritius' && (
        <div className="space-y-2">
          <Label className="text-sm">Régions (Île Maurice)</Label>
          <MultiSelectButtons
            options={MAURITIUS_REGIONS}
            selectedValues={ownerData?.regions || []}
            onToggle={(region) => {
              const currentRegions = ownerData?.regions || [];
              const updatedRegions = currentRegions.includes(region as MauritiusRegion)
                ? currentRegions.filter(r => r !== region)
                : [...currentRegions, region as MauritiusRegion];
              updateOwnerData({ regions: updatedRegions });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OwnerInfoSection;
