import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed, PropertyType, ViewType, Currency } from '@/types/lead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Home, Building, Clock, CreditCard, Euro, Bed, Camera, Star } from 'lucide-react';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';

const PublicCriteriaForm = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<LeadDetailed | null>(null);
  
  const [formData, setFormData] = useState({
    country: '',
    desiredLocation: '',
    budgetMin: '',
    budget: '',
    currency: 'EUR' as Currency,
    propertyTypes: [] as PropertyType[],
    bedrooms: [] as number[],
    views: [] as ViewType[],
    amenities: [] as string[],
    purchaseTimeframe: '',
    financingMethod: '',
    propertyUse: ''
  });

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      if (data) {
        // Map database fields to LeadDetailed interface
        const leadData: LeadDetailed = {
          ...data,
          createdAt: data.created_at,
          lastContactedAt: data.last_contacted_at,
          desiredLocation: data.desired_location,
          budgetMin: data.budget_min,
          propertyTypes: data.property_types || [],
          propertyType: data.property_type,
          livingArea: data.living_area,
          condoFees: data.condo_fees,
          purchaseTimeframe: data.purchase_timeframe,
          financingMethod: data.financing_method,
          propertyUse: data.property_use,
          nextFollowUpDate: data.next_follow_up_date,
          pipelineType: data.pipeline_type,
          actionHistory: data.action_history || []
        };

        setLead(leadData);
        
        // Pre-fill form with existing data
        setFormData({
          country: leadData.country || '',
          desiredLocation: leadData.desiredLocation || '',
          budgetMin: leadData.budgetMin || '',
          budget: leadData.budget || '',
          currency: (leadData.currency as Currency) || 'EUR',
          propertyTypes: (leadData.propertyTypes as PropertyType[]) || [],
          bedrooms: Array.isArray(leadData.bedrooms) ? leadData.bedrooms : leadData.bedrooms ? [leadData.bedrooms] : [],
          views: (leadData.views as ViewType[]) || [],
          amenities: leadData.amenities || [],
          purchaseTimeframe: leadData.purchaseTimeframe || '',
          financingMethod: leadData.financingMethod || '',
          propertyUse: leadData.propertyUse || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du lead:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos informations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    setFormData(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(numValue)
        ? prev.bedrooms.filter(b => b !== numValue)
        : [...prev.bedrooms, numValue]
    }));
  };

  const handleViewToggle = (view: ViewType) => {
    setFormData(prev => ({
      ...prev,
      views: prev.views.includes(view)
        ? prev.views.filter(v => v !== view)
        : [...prev.views, view]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type === 'min' ? 'budgetMin' : 'budget']: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    try {
      setSubmitting(true);

      const updateData = {
        country: formData.country,
        desired_location: formData.desiredLocation,
        budget_min: formData.budgetMin,
        budget: formData.budget,
        currency: formData.currency,
        property_types: formData.propertyTypes,
        bedrooms: formData.bedrooms.length === 1 ? formData.bedrooms[0] : formData.bedrooms[0] || null,
        views: formData.views,
        amenities: formData.amenities,
        purchase_timeframe: formData.purchaseTimeframe,
        financing_method: formData.financingMethod,
        property_use: formData.propertyUse,
        status: 'Qualifié'
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Critères enregistrés !",
        description: "Vos critères de recherche ont été mis à jour avec succès.",
      });

      navigate(`/criteria-confirmation/${leadId}`);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos critères.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const propertyTypesList: PropertyType[] = [
    "Villa", "Appartement", "Penthouse", "Maison", "Duplex", "Chalet", 
    "Terrain", "Manoir", "Maison de ville", "Château", "Local commercial", 
    "Commercial", "Hotel", "Vignoble", "Autres"
  ];

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  const viewTypesList: ViewType[] = ["Mer", "Montagne", "Golf", "Autres"];
  const amenitiesList = ["Piscine", "Terrasse", "Balcon", "Jardin", "Parking", "Ascenseur", "Sécurité", "Climatisation"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-loro-pearl to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loro-terracotta mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-loro-pearl to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Lead introuvable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-loro-pearl to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-futura text-loro-terracotta mb-2">
              Définissez vos critères de recherche
            </CardTitle>
            <p className="text-gray-600">
              Bonjour {lead.name}, merci de remplir vos critères pour nous permettre de vous proposer les meilleures propriétés.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pays et localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-loro-terracotta" />
                    Pays recherché
                  </Label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg font-futura"
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="France">France</option>
                    <option value="Spain">Espagne</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Italy">Italie</option>
                    <option value="Switzerland">Suisse</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mauritius">Île Maurice</option>
                    <option value="UAE">Émirats Arabes Unis</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <LocationFilter 
                    location={formData.desiredLocation} 
                    onLocationChange={(location) => setFormData(prev => ({ ...prev, desiredLocation: location }))}
                    country={formData.country}
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Euro className="h-5 w-5 text-loro-terracotta" />
                  Budget
                </h3>
                <BudgetFilter 
                  minBudget={formData.budgetMin} 
                  maxBudget={formData.budget} 
                  onBudgetChange={handleBudgetChange} 
                  currency={formData.currency} 
                  onCurrencyChange={(currency) => setFormData(prev => ({ ...prev, currency: currency as Currency }))} 
                />
              </div>

              {/* Type de propriété */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="h-5 w-5 text-loro-terracotta" />
                  Type de propriété
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypesList.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handlePropertyTypeToggle(type)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        formData.propertyTypes.includes(type)
                          ? 'bg-loro-terracotta text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de chambres */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Bed className="h-5 w-5 text-loro-terracotta" />
                  Nombre de chambres
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {bedroomOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleBedroomToggle(option)}
                      className={`p-3 rounded-lg text-center font-medium transition-colors ${
                        formData.bedrooms.includes(option === "8+" ? 8 : parseInt(option))
                          ? 'bg-loro-terracotta text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vue souhaitée */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Camera className="h-5 w-5 text-loro-terracotta" />
                  Vue souhaitée
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {viewTypesList.map(view => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => handleViewToggle(view)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        formData.views.includes(view)
                          ? 'bg-loro-terracotta text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commodités */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Star className="h-5 w-5 text-loro-terracotta" />
                  Commodités souhaitées
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        formData.amenities.includes(amenity)
                          ? 'bg-loro-terracotta text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Délai et financement */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-loro-terracotta" />
                    Délai d'acquisition
                  </Label>
                  <select
                    value={formData.purchaseTimeframe}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseTimeframe: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg font-futura"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Immédiat">Immédiat</option>
                    <option value="1-3 mois">1-3 mois</option>
                    <option value="3-6 mois">3-6 mois</option>
                    <option value="6-12 mois">6-12 mois</option>
                    <option value="+12 mois">+12 mois</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-loro-terracotta" />
                    Mode de financement
                  </Label>
                  <select
                    value={formData.financingMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, financingMethod: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg font-futura"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Cash">Cash</option>
                    <option value="Crédit">Crédit</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-loro-terracotta" />
                    Utilisation prévue
                  </Label>
                  <select
                    value={formData.propertyUse}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyUse: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg font-futura"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Résidence principale">Résidence principale</option>
                    <option value="Résidence secondaire">Résidence secondaire</option>
                    <option value="Investissement">Investissement</option>
                  </select>
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-loro-terracotta hover:bg-loro-terracotta/90 text-white font-medium py-3 text-lg"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer mes critères"}
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
