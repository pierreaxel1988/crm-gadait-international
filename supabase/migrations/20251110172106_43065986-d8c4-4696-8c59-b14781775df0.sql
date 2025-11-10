-- Créer la table property_clicks pour tracker les consultations
CREATE TABLE IF NOT EXISTS public.property_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.gadait_properties(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_property_clicks_lead_id ON public.property_clicks(lead_id);
CREATE INDEX IF NOT EXISTS idx_property_clicks_property_id ON public.property_clicks(property_id);
CREATE INDEX IF NOT EXISTS idx_property_clicks_clicked_at ON public.property_clicks(clicked_at DESC);

-- Activer RLS
ALTER TABLE public.property_clicks ENABLE ROW LEVEL SECURITY;

-- Politique RLS : tout le monde peut voir les clics
CREATE POLICY "Anyone can view property clicks"
ON public.property_clicks
FOR SELECT
USING (true);

-- Politique RLS : le système peut insérer des clics
CREATE POLICY "System can insert property clicks"
ON public.property_clicks
FOR INSERT
WITH CHECK (true);

-- Créer la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hot_lead', 'inactive_lead', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lead_id ON public.notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;

-- Activer RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

-- Politique RLS : les utilisateurs peuvent mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- Politique RLS : le système peut créer des notifications
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Fonction pour détecter les leads chauds (plus de 3 clics)
CREATE OR REPLACE FUNCTION public.check_hot_lead()
RETURNS TRIGGER AS $$
DECLARE
  click_count INTEGER;
  lead_assigned_to UUID;
  lead_name TEXT;
BEGIN
  -- Compter le nombre total de clics pour ce lead
  SELECT COUNT(*) INTO click_count
  FROM property_clicks
  WHERE lead_id = NEW.lead_id;

  -- Si le lead atteint exactement 4 clics (devient "très chaud")
  IF click_count = 4 THEN
    -- Récupérer l'agent assigné et le nom du lead
    SELECT assigned_to, name INTO lead_assigned_to, lead_name
    FROM leads
    WHERE id = NEW.lead_id;

    -- Créer une notification si le lead est assigné
    IF lead_assigned_to IS NOT NULL THEN
      INSERT INTO notifications (user_id, lead_id, type, title, message, metadata)
      VALUES (
        lead_assigned_to,
        NEW.lead_id,
        'hot_lead',
        'Lead très chaud détecté 🔥',
        'Le lead "' || lead_name || '" a consulté ' || click_count || ' propriétés. C''est le moment idéal pour le contacter!',
        jsonb_build_object('click_count', click_count)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur property_clicks pour détecter les leads chauds
DROP TRIGGER IF EXISTS trigger_hot_lead_detection ON property_clicks;
CREATE TRIGGER trigger_hot_lead_detection
AFTER INSERT ON property_clicks
FOR EACH ROW
EXECUTE FUNCTION check_hot_lead();

-- Fonction pour nettoyer les anciennes notifications (plus de 30 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;