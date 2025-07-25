-- Ajouter les colonnes de coordonnées GPS à la table gadait_properties
ALTER TABLE public.gadait_properties 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Ajouter un commentaire pour documenter les colonnes
COMMENT ON COLUMN public.gadait_properties.latitude IS 'Latitude GPS de la propriété (format décimal)';
COMMENT ON COLUMN public.gadait_properties.longitude IS 'Longitude GPS de la propriété (format décimal)';