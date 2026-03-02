
-- Create deals table for revenue tracking
CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  lead_name text NOT NULL,
  agent_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  sale_price numeric NOT NULL DEFAULT 0,
  commission_percentage numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  lead_source text,
  pipeline_type text DEFAULT 'purchase',
  deal_date date NOT NULL DEFAULT CURRENT_DATE,
  currency text NOT NULL DEFAULT 'EUR',
  notes text,
  status text NOT NULL DEFAULT 'deposit',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can CRUD all deals (admin-level table)
CREATE POLICY "Authenticated users can view deals"
  ON public.deals FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deals"
  ON public.deals FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deals"
  ON public.deals FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete deals"
  ON public.deals FOR DELETE TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();
