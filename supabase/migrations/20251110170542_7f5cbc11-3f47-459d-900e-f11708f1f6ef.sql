-- Create property click tracking table
CREATE TABLE IF NOT EXISTS public.property_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selection_id UUID REFERENCES public.property_selections(id) ON DELETE CASCADE,
  property_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  redirect_url TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_property_click_tracking_selection_id ON public.property_click_tracking(selection_id);
CREATE INDEX IF NOT EXISTS idx_property_click_tracking_lead_id ON public.property_click_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_property_click_tracking_clicked_at ON public.property_click_tracking(clicked_at);

-- Enable RLS
ALTER TABLE public.property_click_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admins and commercials can view their own leads' clicks)
CREATE POLICY "Team members can view click tracking"
  ON public.property_click_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.email = auth.email()
      AND (
        tm.role = 'admin' 
        OR EXISTS (
          SELECT 1 FROM public.leads l
          WHERE l.id = property_click_tracking.lead_id
          AND l.assigned_to = tm.id
        )
      )
    )
  );

-- Create policy for the edge function to insert (using service role)
CREATE POLICY "Service role can insert click tracking"
  ON public.property_click_tracking
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.property_click_tracking IS 'Tracks clicks on properties sent via email to leads';
COMMENT ON COLUMN public.property_click_tracking.selection_id IS 'Reference to the property selection email sent';
COMMENT ON COLUMN public.property_click_tracking.property_id IS 'The property that was clicked';
COMMENT ON COLUMN public.property_click_tracking.lead_id IS 'The lead who clicked (from the selection)';
COMMENT ON COLUMN public.property_click_tracking.redirect_url IS 'The URL the user was redirected to';