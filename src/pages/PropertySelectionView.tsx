
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Property } from '@/types/property';
import PropertyGrid from '@/components/properties/PropertyGrid';
import { supabase } from '@/integrations/supabase/client';

const PropertySelectionView = () => {
  const { token } = useParams<{ token: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelection = async () => {
      if (!token) {
        setError("Token de sélection manquant");
        setLoading(false);
        return;
      }

      try {
        // Récupérer la sélection par token
        const { data: selectionData, error: selectionError } = await supabase
          .from('property_selections')
          .select('*, leads(*)')
          .eq('link_token', token)
          .single();

        if (selectionError || !selectionData) {
          setError("Sélection introuvable");
          setLoading(false);
          return;
        }

        setSelection(selectionData);

        // Mettre à jour le statut de visite
        await supabase
          .from('property_selections')
          .update({ status: 'viewed', link_visited_at: new Date().toISOString() })
          .eq('id', selectionData.id);

        // Récupérer les propriétés de la sélection
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('id', selectionData.properties);

        if (propertiesError) {
          setError("Impossible de récupérer les propriétés");
          setLoading(false);
          return;
        }

        setProperties(propertiesData);
      } catch (err) {
        console.error('Error fetching selection:', err);
        setError("Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchSelection();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-loro-white/80">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-chocolate-dark border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-loro-white/80 p-4">
        <div className="font-futura text-3xl tracking-tight text-loro-navy uppercase mb-8">GADAIT.</div>
        <div className="luxury-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-times text-loro-navy mb-4">Sélection non disponible</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-loro-white/80 p-4 md:p-8">
      <div className="text-center mb-8">
        <div className="font-futura text-3xl tracking-tight text-loro-navy uppercase mb-2">GADAIT.</div>
        <h1 className="text-3xl md:text-4xl font-times text-loro-navy">{selection.name}</h1>
        {selection.leads && (
          <p className="text-muted-foreground mt-2">Préparé spécialement pour {selection.leads.name}</p>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="luxury-card p-6 mb-8">
          <h2 className="text-xl font-times text-loro-navy mb-4">Votre sélection personnalisée</h2>
          <p className="text-muted-foreground">
            Découvrez cette sélection de {properties.length} propriétés exceptionnelles que nous avons préparée selon vos critères.
            Pour plus d'informations ou pour organiser une visite, n'hésitez pas à nous contacter.
          </p>
        </div>
        
        <PropertyGrid properties={properties} />
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-2">Pour toute question, contactez-nous</p>
          <p className="font-medium">contact@gadait.com | +33 1 23 45 67 89</p>
        </div>
      </div>
    </div>
  );
};

export default PropertySelectionView;
