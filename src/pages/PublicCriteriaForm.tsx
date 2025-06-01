
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
    country: '',
    desired_location: '',
    budget_min: '',
    budget: '',
    currency: 'EUR',
    property_types: [] as string[],
    bedrooms: [] as number[],
    living_area: '',
    views: [] as string[],
    amenities: [] as string[],
    purchase_timeframe: '',
    financing_method: '',
    property_use: ''
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
          bedrooms: Array.isArray(result.lead.bedrooms) ? result.lead.bedrooms : result.lead.bedrooms ? [result.lead.bedrooms] : [],
          living_area: result.lead.living_area || '',
          views: result.lead.views || [],
          amenities: result.lead.amenities || [],
          purchase_timeframe: result.lead.purchase_timeframe || '',
          financing_method: result.lead.financing_method || '',
          property_use: result.lead.property_use || ''
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
      await updateLeadCriteriaFromPublicForm(token, formData);
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
              Vos critères de recherche ont été enregistrés avec succès. Notre équipe va maintenant pouvoir vous proposer des propriétés correspondant à vos attentes.
            </p>
            <p className="text-sm text-loro-navy/60">
              Nous vous contacterons très prochainement avec une sélection personnalisée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const propertyTypeOptions = [
    { value: 'Appartement', label: 'Appartement', icon: '🏢' },
    { value: 'Villa', label: 'Villa', icon: '🏡' },
    { value: 'Maison', label: 'Maison', icon: '🏠' },
    { value: 'Penthouse', label: 'Penthouse', icon: '🏙️' },
    { value: 'Terrain', label: 'Terrain', icon: '🌳' },
    { value: 'Bureau', label: 'Bureau', icon: '🏢' },
    { value: 'Commerce', label: 'Commerce', icon: '🏪' },
    { value: 'Entrepôt', label: 'Entrepôt', icon: '🏭' }
  ];

  const bedroomOptions = [
    { value: 1, label: '1 chambre' },
    { value: 2, label: '2 chambres' },
    { value: 3, label: '3 chambres' },
    { value: 4, label: '4 chambres' },
    { value: 5, label: '5+ chambres' }
  ];

  const viewOptions = [
    { value: 'Mer', label: 'Vue mer' },
    { value: 'Montagne', label: 'Vue montagne' },
    { value: 'Golf', label: 'Vue golf' },
    { value: 'Jardin', label: 'Vue jardin' },
    { value: 'Ville', label: 'Vue ville' }
  ];

  const amenityOptions = [
    { value: 'Piscine', label: 'Piscine' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Terrasse', label: 'Terrasse' },
    { value: 'Balcon', label: 'Balcon' },
    { value: 'Jardin', label: 'Jardin' },
    { value: 'Climatisation', label: 'Climatisation' },
    { value: 'Ascenseur', label: 'Ascenseur' },
    { value: 'Sécurité', label: 'Sécurité 24h/24' }
  ];

  const purchaseTimeframeOptions = [
    { value: 'Immédiatement', label: 'Immédiatement' },
    { value: '1-3 mois', label: '1-3 mois' },
    { value: '3-6 mois', label: '3-6 mois' },
    { value: '6-12 mois', label: '6-12 mois' },
    { value: 'Plus de 12 mois', label: 'Plus de 12 mois' }
  ];

  const financingOptions = [
    { value: 'Comptant', label: 'Paiement comptant' },
    { value: 'Prêt bancaire', label: 'Prêt bancaire' },
    { value: 'Mixte', label: 'Mixte (comptant + prêt)' }
  ];

  const propertyUseOptions = [
    { value: 'Résidence principale', label: 'Résidence principale' },
    { value: 'Résidence secondaire', label: 'Résidence secondaire' },
    { value: 'Investissement locatif', label: 'Investissement locatif' },
    { value: 'Commercial', label: 'Usage commercial' }
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
              {/* Localisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Localisation recherchée</h3>
                
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
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Budget</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Budget minimum">
                    <input
                      type="text"
                      value={formData.budget_min}
                      onChange={(e) => handleInputChange('budget_min', e.target.value)}
                      placeholder="Ex: 500 000"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                    />
                  </FormField>

                  <FormField label="Budget maximum">
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="Ex: 1 000 000"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
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
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Type de propriété */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Type de propriété</h3>
                <MultiSelectButtons
                  options={propertyTypeOptions}
                  value={formData.property_types}
                  onChange={(value) => handleInputChange('property_types', value)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                />
              </div>

              {/* Nombre de chambres */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Nombre de chambres</h3>
                <MultiSelectButtons
                  options={bedroomOptions}
                  value={formData.bedrooms}
                  onChange={(value) => handleInputChange('bedrooms', value)}
                  className="grid grid-cols-2 md:grid-cols-5 gap-2"
                />
              </div>

              {/* Surface */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Surface</h3>
                <FormField label="Surface habitable souhaitée">
                  <input
                    type="text"
                    value={formData.living_area}
                    onChange={(e) => handleInputChange('living_area', e.target.value)}
                    placeholder="Ex: 150 m²"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
                  />
                </FormField>
              </div>

              {/* Vue */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Vue souhaitée</h3>
                <MultiSelectButtons
                  options={viewOptions}
                  value={formData.views}
                  onChange={(value) => handleInputChange('views', value)}
                  className="grid grid-cols-2 md:grid-cols-5 gap-2"
                />
              </div>

              {/* Commodités */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Commodités souhaitées</h3>
                <MultiSelectButtons
                  options={amenityOptions}
                  value={formData.amenities}
                  onChange={(value) => handleInputChange('amenities', value)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                />
              </div>

              {/* Délai et financement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-loro-navy">Délai d'acquisition</h3>
                  <RadioSelectButtons
                    options={purchaseTimeframeOptions}
                    value={formData.purchase_timeframe}
                    onChange={(value) => handleInputChange('purchase_timeframe', value)}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-loro-navy">Mode de financement</h3>
                  <RadioSelectButtons
                    options={financingOptions}
                    value={formData.financing_method}
                    onChange={(value) => handleInputChange('financing_method', value)}
                  />
                </div>
              </div>

              {/* Utilisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-loro-navy">Utilisation prévue</h3>
                <RadioSelectButtons
                  options={propertyUseOptions}
                  value={formData.property_use}
                  onChange={(value) => handleInputChange('property_use', value)}
                />
              </div>

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
