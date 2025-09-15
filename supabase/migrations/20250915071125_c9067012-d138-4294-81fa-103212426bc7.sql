-- Corriger les politiques RLS pour utiliser 'agent' au lieu de 'commercial'
DROP POLICY IF EXISTS "lead_select_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_update_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_delete_policy" ON public.leads;

-- Nouvelles politiques RLS corrigées avec 'agent'
CREATE POLICY "lead_select_policy" ON public.leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'agent' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_insert_policy" ON public.leads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'agent' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_update_policy" ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'agent' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_delete_policy" ON public.leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'agent' AND leads.assigned_to = team_members.id)
    )
  )
);

-- Restaurer les leads supprimés de Jade
UPDATE leads 
SET deleted_at = NULL, deleted_by = NULL, deletion_reason = NULL
WHERE assigned_to = 'acab847b-7ace-4681-989d-86f78549aa69' 
AND deleted_at IS NOT NULL;