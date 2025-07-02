
import React, { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
import OwnerPriceFields from './components/OwnerPriceFields';
import OwnerLocationSection from './components/OwnerLocationSection';
import OwnerPropertySection from './components/OwnerPropertySection';
import BuyerCriteriaSection from './components/BuyerCriteriaSection';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const SearchCriteriaSection = ({
  lead,
  onDataChange
}: SearchCriteriaSectionProps) => {
  const [activeTab, setActiveTab] = useState('budget');
  
  return (
    <div className="space-y-4 px-2 pt-2">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-6">
        Critères de la Propriété
      </h2>
      
      {lead.pipelineType === 'owners' ? (
        <div className="space-y-6">
          <Tabs defaultValue="budget" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="budget">Prix</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="property">Bien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="budget" className="space-y-4">
              <OwnerPriceFields lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <OwnerLocationSection lead={lead} onDataChange={onDataChange} />
              
              {/* Champ Google Drive ajouté ici sous l'URL du bien */}
              <div className="space-y-2">
                <Label htmlFor="google_drive_link" className="text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Dossier Google Drive
                </Label>
                <Input
                  id="google_drive_link"
                  value={lead.google_drive_link || ''}
                  onChange={e => onDataChange({ google_drive_link: e.target.value })}
                  placeholder="Coller le lien Google Drive du dossier complet"
                  className="font-futura"
                />
                <p className="text-xs text-muted-foreground">
                  Lien vers le dossier Google Drive contenant tous les documents du propriétaire
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              <OwnerPropertySection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <BuyerCriteriaSection lead={lead} onDataChange={onDataChange} />
      )}
    </div>
  );
};

export default SearchCriteriaSection;
