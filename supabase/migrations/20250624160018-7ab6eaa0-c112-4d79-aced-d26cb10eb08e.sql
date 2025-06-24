
-- Supprimer l'ancienne table de test si elle existe
DROP TABLE IF EXISTS public.Gadait_Listings_Buy;

-- Créer la nouvelle table gadait_properties optimisée
CREATE TABLE public.gadait_properties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id text UNIQUE, -- ID unique de la propriété sur le site Gadait
  title text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'EUR',
  location text,
  country text,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  area numeric,
  area_unit text DEFAULT 'm²',
  main_image text,
  images text[], -- Array des URLs d'images
  features text[], -- Array des caractéristiques
  amenities text[], -- Array des équipements
  url text NOT NULL, -- URL de la propriété sur gadait-international.com
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  scraped_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer des index pour optimiser les requêtes
CREATE INDEX idx_gadait_properties_external_id ON public.gadait_properties(external_id);
CREATE INDEX idx_gadait_properties_location ON public.gadait_properties(location);
CREATE INDEX idx_gadait_properties_property_type ON public.gadait_properties(property_type);
CREATE INDEX idx_gadait_properties_price ON public.gadait_properties(price);
CREATE INDEX idx_gadait_properties_bedrooms ON public.gadait_properties(bedrooms);
CREATE INDEX idx_gadait_properties_is_available ON public.gadait_properties(is_available);
CREATE INDEX idx_gadait_properties_scraped_at ON public.gadait_properties(scraped_at);

-- Ajouter un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_gadait_properties_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gadait_properties_updated_at
  BEFORE UPDATE ON public.gadait_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_gadait_properties_updated_at();

-- Activer RLS (Row Level Security) si nécessaire pour la sécurité
ALTER TABLE public.gadait_properties ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour les emails automatiques)
CREATE POLICY "Allow public read access to gadait_properties" 
  ON public.gadait_properties 
  FOR SELECT 
  TO public 
  USING (true);

-- Politique pour permettre les modifications aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to modify gadait_properties" 
  ON public.gadait_properties 
  FOR ALL 
  TO authenticated 
  USING (true);
