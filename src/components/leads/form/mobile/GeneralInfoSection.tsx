import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, User, MapPin, Calendar, Globe, Heart } from 'lucide-react';

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection = ({ lead, onDataChange }: GeneralInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
        Information Générale
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salutation" className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Civilité
          </Label>
          <Select
            value={lead.salutation || ''}
            onValueChange={(value) => onDataChange({ salutation: value as 'M.' | 'Mme' })}
          >
            <SelectTrigger className="font-futura">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M.">M.</SelectItem>
              <SelectItem value="Mme">Mme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Nom complet
          </Label>
          <Input
            id="name"
            value={lead.name || ''}
            onChange={e => onDataChange({ name: e.target.value })}
            placeholder="Nom et prénom"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={lead.email || ''}
            onChange={e => onDataChange({ email: e.target.value })}
            placeholder="email@exemple.com"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone
          </Label>
          <Input
            id="phone"
            value={lead.phone || ''}
            onChange={e => onDataChange({ phone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Localisation actuelle
          </Label>
          <Input
            id="location"
            value={lead.location || ''}
            onChange={e => onDataChange({ location: e.target.value })}
            placeholder="Ville, Pays"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Nationalité
          </Label>
          <Input
            id="nationality"
            value={lead.nationality || ''}
            onChange={e => onDataChange({ nationality: e.target.value })}
            placeholder="Française"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxResidence" className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Résidence fiscale
          </Label>
          <Input
            id="taxResidence"
            value={lead.taxResidence || ''}
            onChange={e => onDataChange({ taxResidence: e.target.value })}
            placeholder="Pays de résidence fiscale"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Source du lead
          </Label>
          <Select
            value={lead.source || ''}
            onValueChange={(value) => onDataChange({ source: value as any })}
          >
            <SelectTrigger className="font-futura">
              <SelectValue placeholder="Sélectionner la source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Site web">Site web</SelectItem>
              <SelectItem value="Réseaux sociaux">Réseaux sociaux</SelectItem>
              <SelectItem value="Portails immobiliers">Portails immobiliers</SelectItem>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Repeaters">Repeaters</SelectItem>
              <SelectItem value="Recommandations">Recommandations</SelectItem>
              <SelectItem value="Apporteur d'affaire">Apporteur d'affaire</SelectItem>
              <SelectItem value="Idealista">Idealista</SelectItem>
              <SelectItem value="Le Figaro">Le Figaro</SelectItem>
              <SelectItem value="Properstar">Properstar</SelectItem>
              <SelectItem value="Property Cloud">Property Cloud</SelectItem>
              <SelectItem value="L'express Property">L'express Property</SelectItem>
              <SelectItem value="James Edition">James Edition</SelectItem>
              <SelectItem value="Annonce">Annonce</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Téléphone">Téléphone</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyReference" className="text-sm">
            Référence de la propriété
          </Label>
          <Input
            id="propertyReference"
            value={lead.propertyReference || ''}
            onChange={e => onDataChange({ propertyReference: e.target.value })}
            placeholder="REF-2024-001"
            className="font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm">
            Agent assigné
          </Label>
          <Select
            value={lead.assignedTo || ''}
            onValueChange={(value) => onDataChange({ assignedTo: value })}
          >
            <SelectTrigger className="font-futura">
              <SelectValue placeholder="Sélectionner un agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jacques">Jacques</SelectItem>
              <SelectItem value="Sarah">Sarah</SelectItem>
              <SelectItem value="David">David</SelectItem>
              <SelectItem value="Marie">Marie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
