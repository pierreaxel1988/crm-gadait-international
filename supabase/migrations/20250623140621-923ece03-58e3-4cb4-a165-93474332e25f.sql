
-- Ajouter la colonne renovation_needed à la table leads
ALTER TABLE public.leads 
ADD COLUMN renovation_needed boolean DEFAULT false;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.leads.renovation_needed IS 'Indique si la propriété nécessite des travaux de rénovation (pour les leads propriétaires)';
