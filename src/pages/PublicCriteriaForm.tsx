
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, MapPin, Home, Building, Crown, Mountain, TreePine, Crown as ChateauIcon, Store, Hotel, Grape, MoreHorizontal, Bed, Eye, Star, Clock, CreditCard, Target } from 'lucide-react';
import { getPublicCriteriaLink, updateLeadCriteriaFromPublicForm } from '@/services/publicCriteriaService';
import { countries } from '@/utils/countries';
import { locationsByCountry } from '@/utils/locationsByCountry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PublicCriteriaForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);

  // États du formulaire
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

  // Gestion spécifique pour les boutons de sélection multiple
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

  // Composant pour les boutons de sélection multiple avec design simplifié
  const SelectionButton = ({ 
    icon: Icon, 
    label, 
    isSelected, 
    onClick 
  }: { 
    icon?: React.ComponentType<any>, 
    label: string, 
    isSelected: boolean, 
    onClick: () => void 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center px-3 py-2 rounded-md border text-xs font-medium transition-all ${
        isSelected 
          ? 'bg-blue-600 text-white border-blue-600' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      <span>{label}</span>
    </button>
  );

  // Composant pour les boutons numériques (chambres)
  const NumberButton = ({ 
    number, 
    isSelected, 
    onClick 
  }: { 
    number: string, 
    isSelected: boolean, 
    onClick: () => void 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-md font-medium text-xs transition-all ${
        isSelected 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {number}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-sm">Chargement...</p>
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
            <h1 className="text-xl font-semibold text-gray-900 mb-4">Merci !</h1>
            <p className="text-gray-600 text-sm mb-6">
              Vos critères de recherche ont été enregistrés avec succès. Notre équipe va maintenant pouvoir vous proposer des propriétés correspondant parfaitement à vos attentes.
            </p>
            <p className="text-xs text-gray-500">
              Nous vous contacterons très prochainement avec une sélection personnalisée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Options pour les composants
  const propertyTypeOptions = [
    { value: 'Villa', icon: Home, label: 'Villa' },
    { value: 'Appartement', icon: Building, label: 'Appartement' },
    { value: 'Penthouse', icon: Crown, label: 'Penthouse' },
    { value: 'Maison', icon: Home, label: 'Maison' },
    { value: 'Duplex', icon: Building, label: 'Duplex' },
    { value: 'Chalet', icon: Mountain, label: 'Chalet' },
    { value: 'Terrain', icon: TreePine, label: 'Terrain' },
    { value: 'Manoir', icon: Crown, label: 'Manoir' },
    { value: 'Maison de ville', icon: Building, label: 'Maison de ville' },
    { value: 'Château', icon: ChateauIcon, label: 'Château' },
    { value: 'Local commercial', icon: Store, label: 'Local commercial' },
    { value: 'Commercial', icon: Building, label: 'Commercial' },
    { value: 'Hotel', icon: Hotel, label: 'Hotel' },
    { value: 'Vignoble', icon: Grape, label: 'Vignoble' },
    { value: 'Autres', icon: MoreHorizontal, label: 'Autres' }
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];

  const viewOptions = [
    { value: 'Mer', label: 'Mer' },
    { value: 'Montagne', label: 'Montagne' },
    { value: 'Golf', label: 'Golf' },
    { value: 'Autres', label: 'Autres' }
  ];

  const amenityOptions = [
    { value: 'Piscine', label: 'Piscine' },
    { value: 'Terrasse', label: 'Terrasse' },
    { value: 'Balcon', label: 'Balcon' },
    { value: 'Jardin', label: 'Jardin' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Ascenseur', label: 'Ascenseur' },
    { value: 'Sécurité', label: 'Sécurité' },
    { value: 'Climatisation', label: 'Climatisation' }
  ];

  const languageOptions = [
    'Français', 'English', 'Deutsch', 'Italiano', 'Español', 'العربية', '中文', 'Русский'
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="text-center border-b border-gray-200 py-8">
            <CardTitle className="text-xl font-medium text-gray-900 mb-3">
              Critères de la Propriété
            </CardTitle>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Bonjour {leadData?.name}, merci de remplir vos critères de recherche pour que nous puissions vous proposer les meilleures propriétés.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Pays et Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Pays recherché</Label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Localisation</Label>
                  <Input
                    value={formData.desired_location}
                    onChange={(e) => handleInputChange('desired_location', e.target.value)}
                    placeholder="Ville, région..."
                    className="w-full p-3 text-sm"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Budget</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Budget min</Label>
                    <Input
                      value={formData.budget_min}
                      onChange={(e) => handleInputChange('budget_min', e.target.value)}
                      placeholder="Min"
                      className="w-full p-3 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Budget max</Label>
                    <Input
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="Max"
                      className="w-full p-3 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Devise</Label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF</option>
                      <option value="AED">AED</option>
                      <option value="MUR">MUR</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Type de propriété */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Type de propriété</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {propertyTypeOptions.map((option) => (
                    <SelectionButton
                      key={option.value}
                      icon={option.icon}
                      label={option.label}
                      isSelected={formData.property_types.includes(option.value)}
                      onClick={() => handleMultiSelectToggle('property_types', option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Nombre de chambres */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Nombre de chambres</Label>
                <div className="flex flex-wrap gap-2">
                  {bedroomOptions.map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      isSelected={formData.bedrooms.includes(number)}
                      onClick={() => handleMultiSelectToggle('bedrooms', number)}
                    />
                  ))}
                </div>
              </div>

              {/* Surface habitable et Surface terrain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Surface habitable (m²)</Label>
                  <Input
                    value={formData.living_area}
                    onChange={(e) => handleInputChange('living_area', e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full p-3 text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Surface terrain (m²)</Label>
                  <Input
                    value={formData.land_area}
                    onChange={(e) => handleInputChange('land_area', e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full p-3 text-sm"
                  />
                </div>
              </div>

              {/* Vue souhaitée */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Vue souhaitée</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {viewOptions.map((option) => (
                    <SelectionButton
                      key={option.value}
                      label={option.label}
                      isSelected={formData.views.includes(option.value)}
                      onClick={() => handleMultiSelectToggle('views', option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Commodités souhaitées */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Commodités souhaitées</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {amenityOptions.map((option) => (
                    <SelectionButton
                      key={option.value}
                      label={option.label}
                      isSelected={formData.amenities.includes(option.value)}
                      onClick={() => handleMultiSelectToggle('amenities', option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Délai d'acquisition */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Délai d'acquisition</Label>
                <select
                  value={formData.purchase_timeframe}
                  onChange={(e) => handleInputChange('purchase_timeframe', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="Moins de trois mois">Moins de trois mois</option>
                  <option value="Plus de trois mois">Plus de trois mois</option>
                </select>
              </div>

              {/* Mode de financement */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Mode de financement</Label>
                <select
                  value={formData.financing_method}
                  onChange={(e) => handleInputChange('financing_method', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="Cash">Cash</option>
                  <option value="Prêt bancaire">Prêt bancaire</option>
                </select>
              </div>

              {/* Utilisation prévue */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Utilisation prévue</Label>
                <select
                  value={formData.property_use}
                  onChange={(e) => handleInputChange('property_use', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="Investissement locatif">Investissement locatif</option>
                  <option value="Résidence principale">Résidence principale</option>
                </select>
              </div>

              {/* Informations personnelles */}
              <div className="space-y-6 border-t pt-8">
                <h3 className="text-base font-medium text-gray-900">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Pays de résidence</Label>
                    <Input
                      value={formData.tax_residence}
                      onChange={(e) => handleInputChange('tax_residence', e.target.value)}
                      placeholder="Ex: France"
                      className="w-full p-3 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Nationalité</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="Ex: Française"
                      className="w-full p-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Langue préférée</Label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Sélectionner une langue</option>
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pin location */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pin Location
                </Label>
                <Input
                  value={formData.mapCoordinates}
                  onChange={(e) => handleInputChange('mapCoordinates', e.target.value)}
                  placeholder="Collez le lien Google Maps ici"
                  className="w-full p-3 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Copiez-collez le lien Google Maps de la propriété
                </p>
              </div>

              {/* URL de propriété */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">URL de propriété</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://exemple.com/propriete"
                  className="w-full p-3 text-sm"
                />
              </div>

              {/* Bouton de soumission */}
              <div className="text-center pt-8">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium min-w-[200px]"
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
