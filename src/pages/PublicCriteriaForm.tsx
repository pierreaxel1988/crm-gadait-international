
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { getPublicCriteriaLink, updateLeadCriteriaFromPublicForm } from '@/services/publicCriteriaService';
import FormField from '@/components/leads/form/FormField';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import RadioSelectButtons from '@/components/leads/form/RadioSelectButtons';
import { countries } from '@/utils/countries';
import { locationsByCountry } from '@/utils/locationsByCountry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

const PublicCriteriaForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);

  // États du formulaire - tous les champs de BuyerCriteriaSection
  const [formData, setFormData] = useState({
    // Localisation
    country: '',
    desired_location: '',
    
    // Budget
    budget_min: '',
    budget: '',
    currency: 'EUR',
    
    // Propriété
    property_types: [] as string[],
    bedrooms: [] as string[],
    living_area: '',
    land_area: '',
    views: [] as string[],
    amenities: [] as string[],
    
    // Détails d'achat
    purchase_timeframe: '',
    financing_method: '',
    property_use: '',
    
    // Informations acheteur
    nationality: '',
    tax_residence: '',
    preferred_language: '',
    regions: [] as string[],
    
    // Pin location
    mapCoordinates: '',
    
    // URL de propriété
    url: ''
  });

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
          desired_location: result.lead.desired_location || '',
          budget_min: result.lead.budget_min || '',
          budget: result.lead.budget || '',
          currency: result.lead.currency || 'EUR',
          property_types: result.lead.property_types || [],
          bedrooms: Array.isArray(result.lead.bedrooms) 
            ? result.lead.bedrooms.map((b: number) => b >= 8 ? "8+" : b.toString())
            : result.lead.bedrooms 
            ? [result.lead.bedrooms >= 8 ? "8+" : result.lead.bedrooms.toString()]
            : [],
          living_area: result.lead.living_area || '',
          land_area: result.lead.land_area || '',
          views: result.lead.views || [],
          amenities: result.lead.amenities || [],
          purchase_timeframe: result.lead.purchase_timeframe || '',
          financing_method: result.lead.financing_method || '',
          property_use: result.lead.property_use || '',
          nationality: result.lead.nationality || '',
          tax_residence: result.lead.tax_residence || '',
          preferred_language: result.lead.preferred_language || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      // Convertir les chambres string[] vers number[] pour le backend
      const bedroomsNumbers = formData.bedrooms.map(b => b === "8+" ? 8 : parseInt(b)).filter(b => !isNaN(b));
      
      const submitData = {
        ...formData,
        bedrooms: bedroomsNumbers
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion spécifique pour MultiSelectButtons
  const handleMultiSelectToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [field]: newValues
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-loro-pearl/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-loro-terracotta" />
          <p className="text-loro-navy">Chargement...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-loro-pearl/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-loro-navy mb-4">Merci !</h1>
            <p className="text-loro-navy/70 mb-6">
              Vos critères de recherche ont été enregistrés avec succès. Notre équipe va maintenant pouvoir vous proposer des propriétés correspondant parfaitement à vos attentes.
            </p>
            <p className="text-sm text-loro-navy/60">
              Nous vous contacterons très prochainement avec une sélection personnalisée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Options pour les composants
  const propertyTypeOptions = [
    'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 'Terrain', 
    'Manoir', 'Maison de ville', 'Château', 'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];

  const viewOptions = ['Mer', 'Montagne', 'Golf', 'Autres'];

  const amenityOptions = [
    'Piscine', 'Terrasse', 'Balcon', 'Jardin', 'Parking', 'Ascenseur', 'Sécurité', 'Climatisation'
  ];

  const purchaseTimeframeOptions = [
    'Moins de trois mois', 'Plus de trois mois'
  ];

  const financingOptions = [
    'Cash', 'Prêt bancaire'
  ];

  const propertyUseOptions = [
    'Investissement locatif', 'Résidence principale'
  ];

  const mauritiusRegions = ['North', 'South', 'West', 'East'];

  const languageOptions = [
    'Français', 'English', 'Deutsch', 'Italiano', 'Español', 'العربية', '中文', 'Русский'
  ];

  return (
    <div className="min-h-screen bg-loro-pearl/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-loro-navy mb-2">
              Vos Critères de Recherche
            </CardTitle>
            <p className="text-loro-navy/70">
              Bonjour {leadData?.name}, merci de remplir vos critères de recherche pour que nous puissions vous proposer les meilleures propriétés.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="property" className="w-full">
                <TabsList className="w-full mb-4 grid grid-cols-3">
                  <TabsTrigger value="property">Propriété</TabsTrigger>
                  <TabsTrigger value="purchase">Achat</TabsTrigger>
                  <TabsTrigger value="buyer">Acheteur</TabsTrigger>
                </TabsList>
                
                <TabsContent value="property" className="space-y-6">
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-6">
                      {/* Types de propriété */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Types de bien</h3>
                        <MultiSelectButtons
                          options={propertyTypeOptions}
                          selectedValues={formData.property_types}
                          onToggle={(value) => handleMultiSelectToggle('property_types', value)}
                          className="grid grid-cols-2 md:grid-cols-3 gap-2"
                        />
                      </div>

                      {/* Localisation */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Localisation</h3>
                        
                        <FormField label="Pays">
                          <select
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                          >
                            <option value="">Sélectionner un pays</option>
                            {countries.map((country) => (
                              <option key={country.code} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        {formData.country && locationsByCountry[formData.country] && (
                          <FormField label="Région souhaitée">
                            <select
                              value={formData.desired_location}
                              onChange={(e) => handleInputChange('desired_location', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                            >
                              <option value="">Sélectionner une région</option>
                              {locationsByCountry[formData.country].map((location) => (
                                <option key={location} value={location}>
                                  {location}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        )}

                        {formData.country === 'Mauritius' && (
                          <div className="space-y-2">
                            <Label className="text-sm">Régions souhaitées</Label>
                            <MultiSelectButtons
                              options={mauritiusRegions}
                              selectedValues={formData.regions}
                              onToggle={(value) => handleMultiSelectToggle('regions', value)}
                              className="grid grid-cols-2 gap-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* URL de propriété */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">URL de la propriété</Label>
                        <Input
                          value={formData.url}
                          onChange={(e) => handleInputChange('url', e.target.value)}
                          placeholder="Lien vers la propriété qui vous intéresse"
                          className="w-full font-futura"
                        />
                      </div>

                      {/* Surfaces */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Surface habitable (m²)">
                          <Input
                            value={formData.living_area}
                            onChange={(e) => handleInputChange('living_area', e.target.value)}
                            placeholder="Ex: 150"
                            className="w-full font-futura"
                          />
                        </FormField>

                        <FormField label="Surface terrain (m²)">
                          <Input
                            value={formData.land_area}
                            onChange={(e) => handleInputChange('land_area', e.target.value)}
                            placeholder="Ex: 500"
                            className="w-full font-futura"
                          />
                        </FormField>
                      </div>

                      {/* Vue souhaitée */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Vue</h3>
                        <MultiSelectButtons
                          options={viewOptions}
                          selectedValues={formData.views}
                          onToggle={(value) => handleMultiSelectToggle('views', value)}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2"
                        />
                      </div>

                      {/* Prestations */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Prestations</h3>
                        <MultiSelectButtons
                          options={amenityOptions}
                          selectedValues={formData.amenities}
                          onToggle={(value) => handleMultiSelectToggle('amenities', value)}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2"
                        />
                      </div>

                      {/* Pin Location */}
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pin Location
                        </Label>
                        <Input
                          value={formData.mapCoordinates}
                          onChange={(e) => handleInputChange('mapCoordinates', e.target.value)}
                          placeholder="Collez le lien Google Maps ici"
                          className="font-futura"
                        />
                        <p className="text-xs text-muted-foreground">
                          Copiez-collez le lien Google Maps de la propriété
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="purchase" className="space-y-6">
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-6">
                      {/* Budget */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Budget</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField label="Budget minimum">
                            <Input
                              value={formData.budget_min}
                              onChange={(e) => handleInputChange('budget_min', e.target.value)}
                              placeholder="Ex: 500 000"
                              className="w-full font-futura"
                            />
                          </FormField>

                          <FormField label="Budget maximum">
                            <Input
                              value={formData.budget}
                              onChange={(e) => handleInputChange('budget', e.target.value)}
                              placeholder="Ex: 1 000 000"
                              className="w-full font-futura"
                            />
                          </FormField>

                          <FormField label="Devise">
                            <select
                              value={formData.currency}
                              onChange={(e) => handleInputChange('currency', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                            >
                              <option value="EUR">EUR (€)</option>
                              <option value="USD">USD ($)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="CHF">CHF</option>
                              <option value="AED">AED</option>
                              <option value="MUR">MUR</option>
                            </select>
                          </FormField>
                        </div>
                      </div>

                      {/* Nombre de chambres */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Nombre de chambres</h3>
                        <MultiSelectButtons
                          options={bedroomOptions}
                          selectedValues={formData.bedrooms}
                          onToggle={(value) => handleMultiSelectToggle('bedrooms', value)}
                          className="grid grid-cols-4 gap-2"
                        />
                      </div>

                      {/* Date d'achat souhaitée */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Date d'achat souhaitée</h3>
                        <RadioSelectButtons
                          options={purchaseTimeframeOptions}
                          selectedValue={formData.purchase_timeframe}
                          onSelect={(value) => handleInputChange('purchase_timeframe', value)}
                        />
                      </div>

                      {/* Mode de financement */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Mode de financement</h3>
                        <RadioSelectButtons
                          options={financingOptions}
                          selectedValue={formData.financing_method}
                          onSelect={(value) => handleInputChange('financing_method', value)}
                        />
                      </div>

                      {/* Type d'investissement */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-loro-navy">Type d'investissement</h3>
                        <RadioSelectButtons
                          options={propertyUseOptions}
                          selectedValue={formData.property_use}
                          onSelect={(value) => handleInputChange('property_use', value)}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="buyer" className="space-y-6">
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-6">
                      {/* Nationalité */}
                      <FormField label="Nationalité">
                        <Input
                          value={formData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          placeholder="Ex: Française"
                          className="w-full font-futura"
                        />
                      </FormField>

                      {/* Résidence fiscale */}
                      <FormField label="Résidence fiscale">
                        <Input
                          value={formData.tax_residence}
                          onChange={(e) => handleInputChange('tax_residence', e.target.value)}
                          placeholder="Ex: France"
                          className="w-full font-futura"
                        />
                      </FormField>

                      {/* Langue préférée */}
                      <FormField label="Langue préférée">
                        <select
                          value={formData.preferred_language}
                          onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                        >
                          <option value="">Sélectionner une langue</option>
                          {languageOptions.map((language) => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              {/* Bouton de soumission */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-loro-terracotta hover:bg-loro-terracotta/90 text-white px-8 py-3 rounded-md text-lg font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
