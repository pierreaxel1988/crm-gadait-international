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
  trigger_days JSONB NOT NULL DEFAULT '[7, 14, 21, 30]'::jsonb,
  target_segments JSONB NOT NULL DEFAULT '["no_response", "cold_leads"]'::jsonb,
  min_budget INTEGER DEFAULT 500000,
  
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
  day_number INTEGER NOT NULL,
  template_name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
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
  action_id TEXT NOT NULL,
  
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
  personalization_data JSONB,
  ai_generated_content JSONB,
  
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
  next_email_day INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stopped_at TIMESTAMP WITH TIME ZONE,
  stopped_reason TEXT,
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