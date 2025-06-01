import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, MapPin, Home, Building, Crown, Mountain, TreePine, Crown as ChateauIcon, Store, Hotel, Grape, MoreHorizontal, Bed, Eye, Star, Clock, CreditCard, Target } from 'lucide-react';
import { getPublicCriteriaLink, updateLeadCriteriaFromPublicForm } from '@/services/publicCriteriaService';
import { countries } from '@/utils/countries';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { formatBudget } from '@/services/utils/leadMappers';
import SmartSearch from '@/components/common/SmartSearch';

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

  // Fonction pour obtenir les localisations filtrées
  const getFilteredLocations = (searchTerm: string) => {
    if (!formData.country) {
      return getAllLocations()
        .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10);
    }
    return getLocationsByCountry(formData.country)
      .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10);
  };

  const handleLocationSelect = (location: string) => {
    handleInputChange('desired_location', location);
  };

  const handleCountrySelect = (country: string) => {
    handleInputChange('country', country);
    // Réinitialiser la localisation quand on change de pays
    handleInputChange('desired_location', '');
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  // Composant pour les boutons de sélection multiple avec design original
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
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
        isSelected 
          ? 'bg-loro-navy text-white border-loro-navy' 
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
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
      className={`flex items-center justify-center w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
        isSelected 
          ? 'bg-loro-navy text-white' 
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

  // Fonction pour formater le budget
  const getBudgetDisplay = () => {
    if (!leadData) return null;
    return formatBudget(leadData.budget_min, leadData.budget, leadData.currency);
  };

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
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
      {/* Header avec informations du lead */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full">
        <div className="bg-[#051B30] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between p-3 w-full text-white">
            <div className="flex items-center gap-2 flex-1">
              <div className="truncate">
                <h1 className="text-lg font-futura leading-tight truncate max-w-[180px] sm:max-w-[300px] md:max-w-[500px] text-white">
                  {leadData?.name || 'Lead'}
                </h1>
                <p className="text-xs text-loro-terracotta">
                  {leadData?.created_at && format(new Date(leadData.created_at), 'dd/MM/yyyy')}
                </p>
                <div className="flex flex-wrap gap-2 mt-1 max-w-[250px] sm:max-w-[350px] md:max-w-[450px]">
                  {getBudgetDisplay() && (
                    <span className="text-xs bg-[#F5F3EE] px-2 py-1 rounded-xl border border-zinc-200 text-zinc-800">
                      {getBudgetDisplay()}
                    </span>
                  )}
                  {leadData?.desired_location && (
                    <span className="text-xs bg-[#EBD5CE] px-2 py-1 rounded-xl text-zinc-800">
                      {leadData.desired_location}
                    </span>
                  )}
                  {leadData?.country && (
                    <span className="text-xs bg-[#F3E9D6] px-2 py-1 rounded-xl border border-zinc-200 text-zinc-800">
                      {leadData.country}
                    </span>
                  )}
                  {leadData?.purchase_timeframe && (
                    <span className="text-xs bg-[#DCE4E3] px-2 py-1 rounded-xl text-zinc-800">
                      {leadData.purchase_timeframe}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec padding pour le header fixe */}
      <div className="flex-1 overflow-auto pt-[120px] bg-gray-50">
        <div className="max-w-3xl mx-auto p-4">
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
                
                {/* Pays recherché */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Pays recherché</h3>
                  </div>
                  <SmartSearch
                    placeholder="Sélectionner un pays..."
                    value={formData.country}
                    onChange={(value) => handleInputChange('country', value)}
                    onSelect={handleCountrySelect}
                    results={countries.map(c => c.name).filter(c => 
                      c.toLowerCase().includes(formData.country.toLowerCase())
                    ).slice(0, 10)}
                    renderItem={renderLocationItem}
                    className="w-full"
                    inputClassName="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-loro-terracotta focus:border-transparent text-sm"
                    minChars={0}
                    searchIcon={true}
                    clearButton={true}
                  />
                </div>

                {/* Localisation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Localisation</h3>
                  </div>
                  <SmartSearch
                    placeholder="Ville, région..."
                    value={formData.desired_location}
                    onChange={(value) => handleInputChange('desired_location', value)}
                    onSelect={handleLocationSelect}
                    results={getFilteredLocations(formData.desired_location)}
                    renderItem={renderLocationItem}
                    className="w-full"
                    inputClassName="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-loro-terracotta focus:border-transparent text-sm"
                    minChars={1}
                    searchIcon={true}
                    clearButton={true}
                  />
                </div>

                {/* Budget */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-loro-terracotta text-lg font-bold">€</div>
                    <h3 className="text-sm font-semibold text-gray-800">Budget</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-600 mb-1 block text-xs">Min</Label>
                      <Input
                        value={formData.budget_min}
                        onChange={(e) => handleInputChange('budget_min', e.target.value)}
                        placeholder="Min"
                        className="w-full p-3 text-sm border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-600 mb-1 block text-xs">Max</Label>
                      <Input
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="9000000"
                        className="w-full p-3 text-sm border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 mb-1 block text-xs">Devise</Label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm"
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

                {/* Type de propriété */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Type de propriété</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                  <div className="flex items-center gap-2 mb-4">
                    <Bed className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Nombre de chambres</h3>
                  </div>
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

                {/* Surface habitable */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Surface habitable (m²)</h3>
                  </div>
                  <Input
                    value={formData.living_area}
                    onChange={(e) => handleInputChange('living_area', e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full p-3 text-sm border-gray-300"
                  />
                </div>

                {/* Vue souhaitée */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Vue souhaitée</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Commodités souhaitées</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Délai d'acquisition</h3>
                  </div>
                  <select
                    value={formData.purchase_timeframe}
                    onChange={(e) => handleInputChange('purchase_timeframe', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Moins de trois mois">Moins de trois mois</option>
                    <option value="Plus de trois mois">Plus de trois mois</option>
                  </select>
                </div>

                {/* Mode de financement */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Mode de financement</h3>
                  </div>
                  <select
                    value={formData.financing_method}
                    onChange={(e) => handleInputChange('financing_method', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Cash">Cash</option>
                    <option value="Prêt bancaire">Prêt bancaire</option>
                  </select>
                </div>

                {/* Utilisation prévue */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-4 w-4 text-loro-terracotta" />
                    <h3 className="text-sm font-semibold text-gray-800">Utilisation prévue</h3>
                  </div>
                  <select
                    value={formData.property_use}
                    onChange={(e) => handleInputChange('property_use', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Investissement locatif">Investissement locatif</option>
                    <option value="Résidence principale">Résidence principale</option>
                  </select>
                </div>

                {/* Informations personnelles */}
                <div className="space-y-6 border-t pt-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-4">Informations personnelles</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-800 mb-1 block font-medium text-xs">Pays de résidence</Label>
                      <Input
                        value={formData.tax_residence}
                        onChange={(e) => handleInputChange('tax_residence', e.target.value)}
                        placeholder="Netherlands"
                        className="w-full p-3 text-sm border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-800 mb-1 block font-medium text-xs">Nationalité</Label>
                      <Input
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        placeholder="Néerlandais"
                        className="w-full p-3 text-sm border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-800 mb-1 block font-medium text-xs">Langue préférée</Label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm"
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
    </div>
  );
};

export default PublicCriteriaForm;
