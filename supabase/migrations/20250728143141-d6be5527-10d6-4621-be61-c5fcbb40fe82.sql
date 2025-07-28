-- Créer une table pour stocker les données du graphique d'acquisition avec sources et coûts
CREATE TABLE public.chart_data_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_name text NOT NULL, -- Nom de la période (Jan, Feb, etc.)
  leads_count integer NOT NULL DEFAULT 0, -- Nombre de leads
  source_name text, -- Nom de la source d'acquisition
  monthly_cost numeric(10,2) DEFAULT 0, -- Coût mensuel de cette source
  period_date date, -- Date de la période pour le tri
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_chart_data_entries_period_date ON public.chart_data_entries(period_date);
CREATE INDEX idx_chart_data_entries_source ON public.chart_data_entries(source_name);

-- Activer RLS
ALTER TABLE public.chart_data_entries ENABLE ROW LEVEL SECURITY;

-- Politique pour que seuls les admins puissent gérer ces données
CREATE POLICY "Admins can manage chart data entries" 
ON public.chart_data_entries 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = auth.uid() 
    AND (team_members.role = 'admin' OR team_members.is_admin = true)
  )
);

-- Politique pour que tous les utilisateurs authentifiés puissent voir les données
CREATE POLICY "Authenticated users can view chart data entries" 
ON public.chart_data_entries 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_chart_data_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_chart_data_entries_updated_at
  BEFORE UPDATE ON public.chart_data_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chart_data_entries_updated_at();