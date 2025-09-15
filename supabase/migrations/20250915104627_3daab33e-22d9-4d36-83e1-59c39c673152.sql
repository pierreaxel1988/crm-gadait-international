-- Drop the existing problematic insert policy
DROP POLICY IF EXISTS "lead_insert_policy" ON public.leads;

-- Create a new insert policy that allows admins and agents to create leads
CREATE POLICY "lead_insert_policy" ON public.leads
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin'::text 
      OR team_members.is_admin = true 
      OR team_members.role = 'agent'::text
    )
  )
);