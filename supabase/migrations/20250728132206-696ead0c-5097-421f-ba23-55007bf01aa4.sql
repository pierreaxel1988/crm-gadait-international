-- Table pour tracker les sessions utilisateur
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- en minutes
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM team_members 
  WHERE team_members.id = auth.uid() 
  AND (team_members.role = 'admin' OR team_members.is_admin = true)
));

CREATE POLICY "System can insert sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (true);

-- Function pour calculer automatiquement la durée
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logout_time IS NOT NULL AND NEW.login_time IS NOT NULL THEN
    NEW.session_duration = EXTRACT(EPOCH FROM (NEW.logout_time - NEW.login_time)) / 60;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer la durée automatiquement
CREATE TRIGGER calculate_session_duration_trigger
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_session_duration();

-- Index pour les performances
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_time ON public.user_sessions(login_time);
CREATE INDEX idx_user_sessions_logout_time ON public.user_sessions(logout_time);

-- Function pour fermer automatiquement les sessions anciennes (plus de 8h)
CREATE OR REPLACE FUNCTION public.close_stale_sessions()
RETURNS INTEGER AS $$
DECLARE
  closed_count INTEGER;
BEGIN
  UPDATE public.user_sessions 
  SET 
    logout_time = login_time + INTERVAL '8 hours',
    session_duration = 480 -- 8 heures en minutes
  WHERE 
    logout_time IS NULL 
    AND login_time < now() - INTERVAL '8 hours';
    
  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;