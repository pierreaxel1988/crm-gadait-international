
-- Ajouter la colonne slug à la table gadait_properties
ALTER TABLE public.gadait_properties 
ADD COLUMN slug text;

-- Créer un index sur la colonne slug pour optimiser les requêtes
CREATE INDEX idx_gadait_properties_slug ON public.gadait_properties(slug);
