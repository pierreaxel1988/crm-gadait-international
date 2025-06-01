
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { getPublicCriteriaLink, updateLeadCriteriaFromPublicForm } from '@/services/publicCriteriaService';
import SearchCriteriaFields from '@/components/shared/SearchCriteriaFields';
import { LeadDetailed } from '@/types/lead';

const PublicCriteriaForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<LeadDetailed>>({});

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
