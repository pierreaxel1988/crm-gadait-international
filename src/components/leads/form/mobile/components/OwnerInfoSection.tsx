
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import StyledSelect from './StyledSelect';

interface OwnerInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerInfoSection: React.FC<OwnerInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const SOURCES = [
    'Site Web', 'Référence', 'Publicité Facebook', 'Google Ads', 
    'Email Marketing', 'Événement', 'Appel Entrant', 'Autre'
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Nom complet *
        </Label>
        <Input 
          id="name" 
          value={lead.name || ''} 
          onChange={e => onDataChange({ name: e.target.value })} 
          placeholder="Nom et prénom du propriétaire" 
          className="w-full font-futura"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Téléphone
        </Label>
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
        <Label htmlFor="email" className="text-sm flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
        </Label>
        <Input 
          id="email" 
          type="email"
          value={lead.email || ''} 
          onChange={e => onDataChange({ email: e.target.value })} 
          placeholder="email@exemple.com" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationality" className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Nationalité
        </Label>
        <Input 
          id="nationality" 
          value={lead.nationality || ''} 
          onChange={e => onDataChange({ nationality: e.target.value })} 
          placeholder="Ex: Française" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source" className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Source du lead
        </Label>
        <StyledSelect
          id="source"
          value={lead.source || ''}
          onChange={e => onDataChange({ source: e.target.value as any })}
          placeholder="Sélectionner une source"
          options={SOURCES.map(source => ({ value: source, label: source }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Notes initiales
        </Label>
        <Textarea 
          id="notes" 
          value={lead.notes || ''} 
          onChange={e => onDataChange({ notes: e.target.value })} 
          placeholder="Notes concernant ce propriétaire..." 
          rows={3}
          className="w-full font-futura resize-none"
        />
      </div>
    </div>
  );
};

export default OwnerInfoSection;
