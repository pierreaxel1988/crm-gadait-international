
-- Ajouter tous les champs manquants à la table owners pour les sections Prix, Localisation et Bien
ALTER TABLE public.owners 
ADD COLUMN desired_price text,
ADD COLUMN fees text,
ADD COLUMN currency text DEFAULT 'EUR',
ADD COLUMN country text,
ADD COLUMN location text,
ADD COLUMN desired_location text,
ADD COLUMN map_coordinates text,
ADD COLUMN property_type text,
ADD COLUMN bedrooms integer,
ADD COLUMN bathrooms integer,
ADD COLUMN living_area text,
ADD COLUMN land_area text,
ADD COLUMN construction_year text,
ADD COLUMN property_state text,
ADD COLUMN property_description text,
ADD COLUMN assets text[],
ADD COLUMN equipment text[];

-- Ajouter des commentaires pour documenter ces nouveaux champs
COMMENT ON COLUMN public.owners.desired_price IS 'Prix souhaité par le propriétaire';
COMMENT ON COLUMN public.owners.fees IS 'Honoraires';
COMMENT ON COLUMN public.owners.currency IS 'Devise utilisée';
COMMENT ON COLUMN public.owners.country IS 'Pays du bien';
COMMENT ON COLUMN public.owners.location IS 'Adresse du bien';
COMMENT ON COLUMN public.owners.desired_location IS 'Localisation souhaitée';
COMMENT ON COLUMN public.owners.map_coordinates IS 'Coordonnées Google Maps';
COMMENT ON COLUMN public.owners.property_type IS 'Type de propriété';
COMMENT ON COLUMN public.owners.bedrooms IS 'Nombre de chambres';
COMMENT ON COLUMN public.owners.bathrooms IS 'Nombre de salles de bain';
COMMENT ON COLUMN public.owners.living_area IS 'Surface habitable en m²';
COMMENT ON COLUMN public.owners.land_area IS 'Surface terrain en m²';
COMMENT ON COLUMN public.owners.construction_year IS 'Année de construction';
COMMENT ON COLUMN public.owners.property_state IS 'État du bien';
COMMENT ON COLUMN public.owners.property_description IS 'Description du bien';
COMMENT ON COLUMN public.owners.assets IS 'Atouts du bien';
COMMENT ON COLUMN public.owners.equipment IS 'Équipements du bien';
