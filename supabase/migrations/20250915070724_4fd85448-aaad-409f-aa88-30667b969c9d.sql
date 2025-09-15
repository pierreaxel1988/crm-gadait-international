-- Supprimer les anciennes politiques RLS sur la table leads
DROP POLICY IF EXISTS "lead_select_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_update_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_delete_policy" ON public.leads;

-- Créer une fonction pour obtenir l'ID du membre d'équipe basé sur l'email
CREATE OR REPLACE FUNCTION public.get_team_member_id_by_email()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.team_members WHERE email = auth.email();
$$;

-- Nouvelles politiques RLS basées sur l'email
CREATE POLICY "lead_select_policy" ON public.leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.email = auth.email() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
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
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
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
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
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
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
    )
  )
);

-- Mettre à jour la fonction get_current_team_member_id pour utiliser l'email
CREATE OR REPLACE FUNCTION public.get_current_team_member_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.team_members WHERE email = auth.email();
$$;