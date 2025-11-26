-- Create page_views table for granular activity tracking
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  tab_name TEXT,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_entered_at ON public.page_views(entered_at);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Team members can view all page views"
  ON public.page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = auth.uid()
    )
  );

CREATE POLICY "System can insert page views"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update page views"
  ON public.page_views
  FOR UPDATE
  USING (true);

-- Trigger to calculate duration when left_at is set
CREATE OR REPLACE FUNCTION public.calculate_page_view_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND NEW.entered_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.left_at - NEW.entered_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_page_view_duration_trigger
  BEFORE UPDATE ON public.page_views
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_page_view_duration();