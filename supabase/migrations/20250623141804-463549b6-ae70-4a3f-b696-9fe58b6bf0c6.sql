
-- Ajouter la colonne commission_ht à la table leads
ALTER TABLE public.leads 
ADD COLUMN commission_ht text;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.leads.commission_ht IS 'Commission hors taxe calculée automatiquement (prix souhaité × honoraires)';
