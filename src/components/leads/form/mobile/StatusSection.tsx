import React, { useState, useEffect } from 'react';
import { LeadDetailed, Status } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_OPTIONS: Status[] = [
  'Nouveau',
  'Contacté',
  'Planifié',
  'Visite',
  'Offre',
  'Sous compromis',
  'Signé',
  'Refusé',
  'En attente',
  'A rappeler',
  'Faux numéro',
  'Ne souhaite plus',
  'Injoignable',
  'Vendu',
  'A archiver'
];

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-6">Statut et Suivi</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm">Statut</Label>
          <Select 
            value={lead.status || ''} 
            onValueChange={(value) => handleInputChange('status', value as Status)}
          >
            <SelectTrigger id="status" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status} className="font-futura">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm">Priorité</Label>
          <Select 
            value={lead.priority || ''} 
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <SelectTrigger id="priority" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Haute" className="font-futura">Haute</SelectItem>
              <SelectItem value="Moyenne" className="font-futura">Moyenne</SelectItem>
              <SelectItem value="Basse" className="font-futura">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="probability" className="text-sm">Probabilité de succès (%)</Label>
          <Input
            id="probability"
            type="number"
            value={lead.probability || ''}
            onChange={(e) => handleInputChange('probability', e.target.value)}
            placeholder="Pourcentage de probabilité"
            className="w-full font-futura"
          />
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
