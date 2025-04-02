
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { COUNTRIES } from '@/utils/countries';

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  const [showContactPaste, setShowContactPaste] = useState(false);
  const [contactText, setContactText] = useState('');
  
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

  const parseContactInfo = () => {
    if (!contactText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des informations de contact",
        variant: "destructive"
      });
      return;
    }

    // Extract name, email, phone from the text
    const nameMatch = contactText.match(/Name\s*:?\s*([^\r\n]+)/i);
    const emailMatch = contactText.match(/e-?mail\s*:?\s*([^\r\n]+)/i);
    const phoneMatch = contactText.match(/Phone\s*:?\s*([^\r\n]+)/i) || 
                      contactText.match(/Tel(?:ephone)?\s*:?\s*([^\r\n]+)/i);

    let name = nameMatch?.[1]?.trim() || '';
    let email = emailMatch?.[1]?.trim() || '';
    let phone = phoneMatch?.[1]?.trim() || '';
    
    // Fallback to parse line by line if structured format not found
    if (!name && !email && !phone) {
      const lines = contactText.split('\n').filter(line => line.trim().length > 0);
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('@')) {
          email = trimmedLine;
        } 
        else if (/[\d\+]/.test(trimmedLine) && (trimmedLine.includes('+') || trimmedLine.includes(' '))) {
          phone = trimmedLine;
        } 
        else if (!name) {
          name = trimmedLine;
        }
      });
    }

    if (name) handleInputChange('name', name);
    if (email) handleInputChange('email', email);
    if (phone) handleInputChange('phone', phone);

    setShowContactPaste(false);
    setContactText('');
    
    toast({
      title: "Informations importées",
      description: "Les informations de contact ont été extraites avec succès."
    });
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Informations Générales</h2>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-futura uppercase tracking-wider">Détails de contact</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setShowContactPaste(!showContactPaste)}
          className="text-xs flex items-center gap-1 font-futura"
        >
          <Clipboard className="h-3.5 w-3.5" />
          {showContactPaste ? 'Masquer' : 'Copier/Coller contact'}
        </Button>
      </div>

      {showContactPaste && (
        <div className="space-y-2 mb-4 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <p className="text-xs text-muted-foreground font-futura">
            Collez les informations de contact (nom, téléphone, email) puis cliquez sur Extraire :
          </p>
          <textarea 
            className="w-full p-2 text-sm border rounded-md h-24 font-futura" 
            placeholder="Exemple:
Fatiha Mohamed
+34 644 15 78 61
fmohamed01@exemple.net"
            value={contactText}
            onChange={(e) => setContactText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              type="button" 
              size="sm" 
              onClick={parseContactInfo}
              className="text-xs font-futura uppercase tracking-wide"
            >
              Extraire
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nom</Label>
          <Input 
            id="name" 
            value={lead.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nom complet" 
            className="w-full font-futura"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Mail className="h-4 w-4 text-gray-500" />
            </div>
            <Input 
              id="email" 
              value={lead.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Adresse email" 
              className="w-full rounded-l-none font-futura" 
              type="email"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm">Téléphone</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Phone className="h-4 w-4 text-gray-500" />
            </div>
            <Input 
              id="phone" 
              value={lead.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Numéro de téléphone" 
              className="w-full rounded-l-none font-futura" 
              type="tel"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm">Pays de résidence</Label>
          <Select 
            value={lead.taxResidence || ''} 
            onValueChange={value => handleInputChange('taxResidence', value)}
          >
            <SelectTrigger id="country" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country} className="font-futura">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
          <Select 
            value={lead.nationality || ''} 
            onValueChange={value => handleInputChange('nationality', value)}
          >
            <SelectTrigger id="nationality" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une nationalité" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => {
                const nationality = deriveNationalityFromCountry(country);
                return (
                  <SelectItem key={country} value={nationality || country} className="font-futura">
                    {nationality || country}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm">Source</Label>
          <Select 
            value={lead.source || ''} 
            onValueChange={value => handleInputChange('source', value)}
          >
            <SelectTrigger id="source" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une source" />
            </SelectTrigger>
            <SelectContent>
              {['Site web', 'Recommandation', 'Annonce', 'Réseaux sociaux', 'Email', 'Téléphone', 'Autre'].map(source => (
                <SelectItem key={source} value={source} className="font-futura">
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
