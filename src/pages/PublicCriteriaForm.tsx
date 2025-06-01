
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, MapPin, Search, ChevronDown, X } from 'lucide-react';
import { getPublicCriteriaLink, updateLeadCriteriaFromPublicForm } from '@/services/publicCriteriaService';
import SearchCriteriaFields from '@/components/shared/SearchCriteriaFields';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { countryToFlag } from '@/utils/countryUtils';

// Liste complète des pays du monde
const ALL_COUNTRIES: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", 
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", 
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", 
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const PublicCriteriaForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<LeadDetailed>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const result = await getPublicCriteriaLink(token);
        if (!result) {
          toast({
            variant: "destructive",
            title: "Lien invalide",
            description: "Ce lien n'est pas valide ou a expiré."
          });
          navigate('/');
          return;
        }

        setLinkData(result.link);
        setLeadData(result.lead);

        // Préremplir le formulaire avec les données existantes
        setFormData({
          country: result.lead.country || '',
          desiredLocation: result.lead.desired_location || '',
          budgetMin: result.lead.budget_min || '',
          budget: result.lead.budget || '',
          currency: result.lead.currency || 'EUR',
          propertyTypes: result.lead.property_types || [],
          bedrooms: Array.isArray(result.lead.bedrooms) 
            ? result.lead.bedrooms
            : result.lead.bedrooms 
            ? [result.lead.bedrooms]
            : [],
          livingArea: result.lead.living_area || '',
          landArea: result.lead.land_area || '',
          views: result.lead.views || [],
          amenities: result.lead.amenities || [],
          purchaseTimeframe: result.lead.purchase_timeframe || '',
          financingMethod: result.lead.financing_method || '',
          propertyUse: result.lead.property_use || '',
          nationality: result.lead.nationality || '',
          taxResidence: result.lead.tax_residence || '',
          preferredLanguage: result.lead.preferred_language || '',
          regions: result.lead.regions || [],
          mapCoordinates: result.lead.mapCoordinates || '',
          url: result.lead.url || ''
        });
      } catch (error) {
        console.error('Error loading public criteria form:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le formulaire."
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate]);

  const filteredCountries = searchTerm
    ? ALL_COUNTRIES.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ALL_COUNTRIES;

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country: country
    }));
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      // Convertir les données pour correspondre à l'API
      const submitData = {
        country: formData.country,
        desired_location: formData.desiredLocation,
        budget_min: formData.budgetMin,
        budget: formData.budget,
        currency: formData.currency,
        property_types: formData.propertyTypes,
        bedrooms: formData.bedrooms,
        living_area: formData.livingArea,
        land_area: formData.landArea,
        views: formData.views,
        amenities: formData.amenities,
        purchase_timeframe: formData.purchaseTimeframe,
        financing_method: formData.financingMethod,
        property_use: formData.propertyUse,
        nationality: formData.nationality,
        tax_residence: formData.taxResidence,
        preferred_language: formData.preferredLanguage,
        regions: formData.regions,
        mapCoordinates: formData.mapCoordinates,
        url: formData.url
      };
      
      await updateLeadCriteriaFromPublicForm(token, submitData);
      setSubmitted(true);
      toast({
        title: "Critères enregistrés",
        description: "Vos critères de recherche ont été enregistrés avec succès."
      });
    } catch (error) {
      console.error('Error submitting criteria:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDataChange = (data: Partial<LeadDetailed>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-loro-terracotta" />
          <p className="text-loro-navy text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-loro-navy mb-4">Merci !</h1>
            <p className="text-loro-navy/70 text-sm mb-6">
              Vos critères de recherche ont été enregistrés avec succès. Notre équipe va maintenant pouvoir vous proposer des propriétés correspondant parfaitement à vos attentes.
            </p>
            <p className="text-xs text-loro-navy/60">
              Nous vous contacterons très prochainement avec une sélection personnalisée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-sm">
          <CardHeader className="text-center border-b border-gray-200 py-6">
            <CardTitle className="text-lg font-semibold text-loro-navy mb-2">
              CRITÈRES DE LA PROPRIÉTÉ
            </CardTitle>
            <p className="text-loro-navy/70 text-sm">
              Bonjour {leadData?.name}, merci de remplir vos critères de recherche pour que nous puissions vous proposer les meilleures propriétés.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pays recherché avec dropdown personnalisé */}
              <div className="space-y-3" ref={countryDropdownRef}>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-loro-terracotta" />
                  Pays recherché
                </Label>
                <div 
                  className="flex items-center justify-between px-3 py-2 h-10 w-full border border-gray-300 rounded-lg bg-background text-sm cursor-pointer focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                >
                  {formData.country ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryToFlag(formData.country)}</span>
                      <span>{formData.country}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner un pays</span>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isCountryDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
                    <div className="sticky top-0 p-2 bg-background border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Rechercher un pays..."
                          className="pl-8 h-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        {searchTerm && (
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm('');
                            }}
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-auto p-1">
                      {filteredCountries.map(country => (
                        <div
                          key={country}
                          className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.country === country ? 'bg-accent/50' : ''}`}
                          onClick={() => handleCountrySelect(country)}
                        >
                          <span className="text-lg mr-2">{countryToFlag(country)}</span>
                          <span>{country}</span>
                        </div>
                      ))}
                      
                      {filteredCountries.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          Aucun résultat
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Autres critères de recherche */}
              <SearchCriteriaFields
                formData={formData}
                onDataChange={handleDataChange}
                isPublicForm={true}
              />

              {/* Bouton de soumission */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-loro-navy hover:bg-loro-navy/90 text-white px-8 py-3 rounded-lg text-sm font-medium min-w-[180px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer mes critères'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicCriteriaForm;
