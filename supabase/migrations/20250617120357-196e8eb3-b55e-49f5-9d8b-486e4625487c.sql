
-- Ajouter les champs de mobilier à la table owners
ALTER TABLE public.owners 
ADD COLUMN furnished boolean DEFAULT false,
ADD COLUMN furniture_included_in_price boolean DEFAULT false,
ADD COLUMN furniture_price text;

-- Ajouter un commentaire pour documenter ces nouveaux champs
COMMENT ON COLUMN public.owners.furnished IS 'Indique si la propriété est meublée';
COMMENT ON COLUMN public.owners.furniture_included_in_price IS 'Indique si le mobilier est inclus dans le prix';
COMMENT ON COLUMN public.owners.furniture_price IS 'Valorisation du mobilier si non inclus dans le prix';
