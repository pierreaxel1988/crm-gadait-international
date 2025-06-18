
-- Ajouter le champ google_drive_link à la table leads
ALTER TABLE public.leads 
ADD COLUMN google_drive_link text;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.leads.google_drive_link IS 'Lien Google Drive pour accéder au dossier complet du lead propriétaire';
