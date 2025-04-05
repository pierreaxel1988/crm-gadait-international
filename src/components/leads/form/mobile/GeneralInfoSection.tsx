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
import { Textarea } from '@/components/ui/textarea';

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
  const [phoneCountryCode, setPhoneCountryCode] = useState('+33');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  
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

  const updatePhoneCodeInUI = (code: string) => {
    setPhoneCountryCode(code);
    // Trouver le sélecteur de code pays dans le DOM et le mettre à jour
    const phoneCodeSelect = document.querySelector('select[name="phoneCountryCode"]') as HTMLSelectElement;
    if (phoneCodeSelect) {
      phoneCodeSelect.value = code;
      phoneCodeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
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

    // Variables pour stocker les informations extraites
    let name = '';
    let email = '';
    let phone = '';
    let country = '';
    let language = '';
    let phoneCountryCode = '';

    // Rechercher des patterns spécifiques
    const namePatterns = [
      /[À|A] propos de\s+([^\n]+)/i,
      /Name\s*:?\s*([^\r\n]+)/i,
      /Nom\s*:?\s*([^\r\n]+)/i
    ];
    
    const emailPatterns = [
      /e-?mail\s*:?\s*([^\r\n]+)/i,
      /courriel\s*:?\s*([^\r\n]+)/i,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ];
    
    const phonePatterns = [
      /t[ée]l[ée]phone\s*:?\s*([^\r\n]+)/i,
      /phone\s*:?\s*([^\r\n]+)/i,
      /\(?\+?[0-9][0-9()\-\s.]{7,}\d/
    ];
    
    const countryPatterns = [
      /pays\s*:?\s*([^\r\n]+)/i,
      /country\s*:?\s*([^\r\n]+)/i
    ];
    
    const languagePatterns = [
      /langue\s*:?\s*([^\r\n]+)/i,
      /language\s*:?\s*([^\r\n]+)/i
    ];

    // Extraire le nom
    for (const pattern of namePatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    // Extraire l'email
    for (const pattern of emailPatterns) {
      const match = contactText.match(pattern);
      if (match) {
        // Si c'est un pattern avec capture, utiliser le groupe capturé
        if (match[1]) {
          email = match[1].trim();
        } else {
          // Sinon, c'est probablement le pattern d'email lui-même
          email = match[0].trim();
        }
        break;
      }
    }

    // Extraire le téléphone
    for (const pattern of phonePatterns) {
      const match = contactText.match(pattern);
      if (match) {
        if (match[1]) {
          phone = match[1].trim();
        } else {
          phone = match[0].trim();
        }
        break;
      }
    }

    // Extraire le pays
    for (const pattern of countryPatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        country = match[1].trim();
        break;
      }
    }

    // Extraire la langue
    for (const pattern of languagePatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        language = match[1].trim();
        break;
      }
    }

    // Fallback - analyse ligne par ligne si les patterns spécifiques n'ont pas fonctionné
    if (!name || !email || !phone) {
      const lines = contactText.split('\n').filter(line => line.trim().length > 0);
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (!email && trimmedLine.includes('@')) {
          email = trimmedLine;
        } 
        else if (!phone && /[\d\+]/.test(trimmedLine) && (trimmedLine.includes('+') || trimmedLine.includes(' '))) {
          phone = trimmedLine;
        } 
        else if (!name && !trimmedLine.toLowerCase().includes('phone') && 
                !trimmedLine.toLowerCase().includes('mail') && 
                !trimmedLine.toLowerCase().includes('pays') && 
                !trimmedLine.toLowerCase().includes('langue')) {
          name = trimmedLine;
        }
      });
    }

    // Traitement du numéro de téléphone pour extraire le code pays
    let detectedCountryCode = '+33'; // Par défaut: France
    let phoneNumberWithoutCode = '';
    
    if (phone) {
      // Rechercher un code pays international au format +XX ou (+XX)
      const countryCodeMatch = phone.match(/\(\+(\d+)\)|\+(\d+)/);
      
      if (countryCodeMatch) {
        // Prendre le premier groupe non-undefined
        const codeDigits = countryCodeMatch[1] || countryCodeMatch[2];
        console.log("Code pays détecté:", codeDigits);
        
        if (codeDigits) {
          // Extraire les premiers chiffres pour le code pays (1, 2 ou 3 chiffres)
          let code = '';
          if (codeDigits.startsWith('1')) {
            // Code pays +1 pour USA/Canada
            code = '1';
          } else if (codeDigits.startsWith('7')) {
            // Code pays +7 pour Russie
            code = '7';
          } else if (codeDigits.startsWith('33')) {
            // Code pays +33 pour France
            code = '33';
          } else if (codeDigits.startsWith('44')) {
            // Code pays +44 pour UK
            code = '44';
          } else if (codeDigits.startsWith('49')) {
            // Code pays +49 pour Allemagne
            code = '49';
          } else if (codeDigits.startsWith('34')) {
            // Code pays +34 pour Espagne
            code = '34';
          } else if (codeDigits.startsWith('39')) {
            // Code pays +39 pour Italie
            code = '39';
          } else if (codeDigits.startsWith('41')) {
            // Code pays +41 pour Suisse
            code = '41';
          } else if (codeDigits.startsWith('971')) {
            // Code pays +971 pour UAE
            code = '971';
          } else if (codeDigits.startsWith('351')) {
            // Code pays +351 pour Portugal
            code = '351';
          } else if (codeDigits.startsWith('30')) {
            // Code pays +30 pour Grèce
            code = '30';
          } else if (codeDigits.startsWith('385')) {
            // Code pays +385 pour Croatie
            code = '385';
          } else if (codeDigits.startsWith('230')) {
            // Code pays +230 pour Mauritius
            code = '230';
          } else if (codeDigits.startsWith('960')) {
            // Code pays +960 pour Maldives
            code = '960';
          } else if (codeDigits.startsWith('248')) {
            // Code pays +248 pour Seychelles
            code = '248';
          } else {
            // Pour les autres codes, prendre les 1-3 premiers chiffres
            code = codeDigits.substring(0, Math.min(3, codeDigits.length));
          }
          
          detectedCountryCode = '+' + code;
          
          // Mettre à jour le sélecteur de code pays dans l'interface
          updatePhoneCodeInUI(detectedCountryCode);
          
          // Extraire le numéro sans le code pays
          if (phone.includes('(+')) {
            // Format (+XX) XXXXX
            phoneNumberWithoutCode = phone.replace(/\(\+\d+\)\s*/, '').trim();
          } else if (phone.includes('+')) {
            // Format +XX XXXXX
            phoneNumberWithoutCode = phone.replace(/\+\d+\s*/, '').trim();
          } else {
            phoneNumberWithoutCode = phone;
          }
        }
      } else {
        // Si aucun code pays n'est détecté, utiliser le numéro tel quel
        phoneNumberWithoutCode = phone;
      }

      // Nettoyer le numéro de téléphone (enlever les parenthèses, tirets et caractères spéciaux)
      phoneNumberWithoutCode = phoneNumberWithoutCode.replace(/[()]/g, '').trim();
    }

    // Mapper les codes pays aux pays
    const countryCodeMap: Record<string, string> = {
      '+1': 'United States',
      '+33': 'France',
      '+34': 'Spain',
      '+44': 'United Kingdom',
      '+49': 'Germany',
      '+39': 'Italy',
      '+41': 'Switzerland',
      '+32': 'Belgium',
      '+31': 'Netherlands',
      '+7': 'Russia',
      '+971': 'United Arab Emirates',
      '+966': 'Saudi Arabia',
      '+965': 'Kuwait',
      '+974': 'Qatar',
      '+973': 'Bahrain',
      '+230': 'Mauritius',
      '+212': 'Morocco',
      '+216': 'Tunisia',
      '+213': 'Algeria',
      '+20': 'Egypt',
      '+351': 'Portugal',
      '+30': 'Greece',
      '+385': 'Croatia',
      '+960': 'Maldives',
      '+248': 'Seychelles'
    };
    
    // Si on a un code pays mais pas de pays détecté, utiliser le code pays pour déduire le pays
    if (detectedCountryCode && !country && countryCodeMap[detectedCountryCode]) {
      country = countryCodeMap[detectedCountryCode];
    }

    setDetectedCountry(country);

    console.log("Informations extraites:", { 
      name, 
      email, 
      phoneNumberWithoutCode, 
      country, 
      language, 
      detectedCountryCode 
    });

    // Mettre à jour les champs du lead
    if (name) handleInputChange('name', name);
    if (email) handleInputChange('email', email);
    
    // Mettre à jour le téléphone
    if (phoneNumberWithoutCode) {
      // Pour le numéro de téléphone, on laisse juste le numéro sans le code pays
      handleInputChange('phone', phoneNumberWithoutCode);
    }
    
    if (country) {
      handleInputChange('taxResidence', country);
      
      // Dériver automatiquement la nationalité à partir du pays
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }

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
          <Textarea 
            className="w-full p-2 text-sm border rounded-md h-24 font-futura" 
            placeholder="Exemple:
À propos de David
Téléphone
(+1) 4185093022
E-mail
laura.luna@yahoo.ca
Langue
français
Pays
France"
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
            <Select 
              value={phoneCountryCode} 
              onValueChange={(value) => setPhoneCountryCode(value)}
              name="phoneCountryCode"
            >
              <SelectTrigger className="flex-shrink-0 w-20 rounded-r-none font-futura">
                <SelectValue placeholder="+33" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+33">+33</SelectItem>
                <SelectItem value="+1">+1</SelectItem>
                <SelectItem value="+44">+44</SelectItem>
                <SelectItem value="+34">+34</SelectItem>
                <SelectItem value="+39">+39</SelectItem>
                <SelectItem value="+41">+41</SelectItem>
                <SelectItem value="+32">+32</SelectItem>
                <SelectItem value="+49">+49</SelectItem>
                <SelectItem value="+31">+31</SelectItem>
                <SelectItem value="+7">+7</SelectItem>
                <SelectItem value="+971">+971</SelectItem>
                <SelectItem value="+966">+966</SelectItem>
                <SelectItem value="+965">+965</SelectItem>
                <SelectItem value="+974">+974</SelectItem>
                <SelectItem value="+973">+973</SelectItem>
                <SelectItem value="+230">+230</SelectItem>
                <SelectItem value="+212">+212</SelectItem>
                <SelectItem value="+216">+216</SelectItem>
                <SelectItem value="+213">+213</SelectItem>
                <SelectItem value="+20">+20</SelectItem>
                <SelectItem value="+351">+351</SelectItem>
                <SelectItem value="+30">+30</SelectItem>
                <SelectItem value="+385">+385</SelectItem>
                <SelectItem value="+960">+960</SelectItem>
                <SelectItem value="+248">+248</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              id="phone" 
              value={lead.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Numéro de téléphone" 
              className="w-full rounded-l-none font-futura" 
              type="tel"
            />
          </div>
          {detectedCountry && (
            <p className="text-xs text-muted-foreground font-futura mt-1">
              Pays détecté: {detectedCountry}
            </p>
          )}
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
              {[
                'Site web', 
                'Réseaux sociaux', 
                'Portails immobiliers', 
                'Network', 
                'Repeaters', 
                'Recommandations',
                'Apporteur d\'affaire',
                'Idealista',
                'Le Figaro',
                'Properstar',
                'Property Cloud',
                'L\'express Property',
                'James Edition',
                'Annonce',
                'Email',
                'Téléphone',
                'Autre',
                'Recommendation'
              ].map(source => (
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
