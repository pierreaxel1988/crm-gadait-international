
-- Ajouter les champs manquants pour l'onglet "Infos"
ALTER TABLE public.owners 
ADD COLUMN IF NOT EXISTS salutation text,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS property_reference text,
ADD COLUMN IF NOT EXISTS url text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS regions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS integration_source text,
ADD COLUMN IF NOT EXISTS imported_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS external_id text;

-- Ajouter les champs manquants pour l'onglet "Statut"
ALTER TABLE public.owners 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Nouveau contact',
ADD COLUMN IF NOT EXISTS task_type text,
ADD COLUMN IF NOT EXISTS next_follow_up_date text;

-- Ajouter les champs manquants pour l'onglet "Notes"
ALTER TABLE public.owners 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Ajouter les champs manquants pour l'onglet "Actions"
ALTER TABLE public.owners 
ADD COLUMN IF NOT EXISTS action_history jsonb DEFAULT '[]'::jsonb;

-- Ajouter des commentaires pour documenter ces nouveaux champs
COMMENT ON COLUMN public.owners.salutation IS 'Civilité (M./Mme)';
COMMENT ON COLUMN public.owners.source IS 'Source du contact';
COMMENT ON COLUMN public.owners.property_reference IS 'Référence du bien';
COMMENT ON COLUMN public.owners.url IS 'URL du bien';
COMMENT ON COLUMN public.owners.tags IS 'Tags du propriétaire';
COMMENT ON COLUMN public.owners.regions IS 'Régions d''intérêt';
COMMENT ON COLUMN public.owners.last_contacted_at IS 'Dernier contact';
COMMENT ON COLUMN public.owners.integration_source IS 'Source d''intégration';
COMMENT ON COLUMN public.owners.imported_at IS 'Date d''importation';
COMMENT ON COLUMN public.owners.external_id IS 'ID externe';
COMMENT ON COLUMN public.owners.status IS 'Statut du propriétaire';
COMMENT ON COLUMN public.owners.task_type IS 'Type de tâche';
COMMENT ON COLUMN public.owners.next_follow_up_date IS 'Date de prochain suivi';
COMMENT ON COLUMN public.owners.notes IS 'Notes générales';
COMMENT ON COLUMN public.owners.internal_notes IS 'Notes internes';
COMMENT ON COLUMN public.owners.action_history IS 'Historique des actions';
