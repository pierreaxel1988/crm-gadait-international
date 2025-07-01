
-- Ajouter les colonnes pour le soft delete
ALTER TABLE public.leads 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID REFERENCES public.team_members(id),
ADD COLUMN deletion_reason TEXT;

-- Créer un index pour optimiser les performances des requêtes
CREATE INDEX idx_leads_deleted_at ON public.leads(deleted_at);

-- Créer un index composé pour les requêtes fréquentes (leads actifs)
CREATE INDEX idx_leads_active ON public.leads(created_at) WHERE deleted_at IS NULL;
