-- Créer les tables pour le système d'emails automatiques

-- Table pour les campagnes d'emails automatiques
CREATE TABLE public.automated_email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.team_members(id),
  
  -- Configuration de la séquence
  trigger_days JSONB NOT NULL DEFAULT '[7, 14, 21, 30]'::jsonb, -- Jours après dernière activité
  target_segments JSONB NOT NULL DEFAULT '["no_response", "cold_leads"]'::jsonb, -- Segments ciblés
  min_budget INTEGER DEFAULT 500000, -- Budget minimum en EUR pour être éligible
  
  -- Métriques globales
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,
  total_replied INTEGER NOT NULL DEFAULT 0
);

-- Table pour les templates d'emails
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.automated_email_campaigns(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- 7, 14, 21, 30
  template_name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  content_template TEXT NOT NULL, -- Template avec variables {{nom}}, {{budget}}, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(campaign_id, day_number)
);

-- Table pour tracker les envois individuels
CREATE TABLE public.automated_email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.automated_email_campaigns(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL, -- ID de l'action dans action_history
  
  -- Données d'envoi
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  
  -- Tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Méta-données
  personalization_data JSONB, -- Données utilisées pour la personnalisation
  ai_generated_content JSONB, -- Contenu généré par l'IA
  
  -- Status
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'replied', 'unsubscribed', 'failed')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour gérer les séquences actives par lead
CREATE TABLE public.lead_email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.automated_email_campaigns(id) ON DELETE CASCADE,
  
  -- Gestion de la séquence
  sequence_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_email_date TIMESTAMP WITH TIME ZONE,
  next_email_day INTEGER, -- 7, 14, 21, 30
  is_active BOOLEAN NOT NULL DEFAULT true,
  stopped_at TIMESTAMP WITH TIME ZONE,
  stopped_reason TEXT, -- 'manual', 'replied', 'unsubscribed', 'completed'
  stopped_by UUID REFERENCES public.team_members(id),
  
  -- Dernière activité du lead avant la séquence
  last_activity_date TIMESTAMP WITH TIME ZONE,
  last_activity_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(lead_id, campaign_id)
);

-- Enable Row Level Security
ALTER TABLE public.automated_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_email_sequences ENABLE ROW LEVEL SECURITY;

-- Policies pour les campagnes
CREATE POLICY "Team members can view email campaigns" 
ON public.automated_email_campaigns 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage email campaigns" 
ON public.automated_email_campaigns 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
));

-- Policies pour les templates
CREATE POLICY "Team members can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
));

-- Policies pour les logs d'emails
CREATE POLICY "Team members can view email logs" 
ON public.automated_email_logs 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert email logs" 
ON public.automated_email_logs 
FOR INSERT 
WITH CHECK (true);

-- Policies pour les séquences
CREATE POLICY "Team members can view email sequences" 
ON public.lead_email_sequences 
FOR SELECT 
USING (true);

CREATE POLICY "Team members can manage email sequences" 
ON public.lead_email_sequences 
FOR ALL 
USING (true);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_automated_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automated_email_campaigns_updated_at
BEFORE UPDATE ON public.automated_email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_automated_email_campaigns_updated_at();

CREATE TRIGGER update_lead_email_sequences_updated_at
BEFORE UPDATE ON public.lead_email_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_automated_email_campaigns_updated_at();

-- Insérer une campagne par défaut
INSERT INTO public.automated_email_campaigns (name, description, trigger_days, target_segments, min_budget)
VALUES (
  'Séquence de Réactivation Premium',
  'Séquence automatique pour réactiver les leads premium sans réponse',
  '[7, 14, 21, 30]'::jsonb,
  '["no_response", "cold_leads"]'::jsonb,
  500000
);

-- Insérer les templates par défaut
WITH default_campaign AS (
  SELECT id FROM public.automated_email_campaigns WHERE name = 'Séquence de Réactivation Premium' LIMIT 1
)
INSERT INTO public.email_templates (campaign_id, day_number, template_name, subject_template, content_template)
SELECT 
  dc.id,
  day_num,
  template_name,
  subject,
  content
FROM default_campaign dc,
VALUES 
  (7, 'Premier Rappel Doux', 'Votre projet immobilier {{location}} - Nouvelles opportunités', 'template_day_7'),
  (14, 'Insights Marché Premium', 'Tendances exclusives marché {{location}} - {{month}} {{year}}', 'template_day_14'), 
  (21, 'Opportunité Exclusive', 'Opportunité exclusive correspondant à vos critères', 'template_day_21'),
  (30, 'Récapitulatif Final', 'Dernière sélection premium pour votre projet {{location}}', 'template_day_30')
AS t(day_num, template_name, subject, content);