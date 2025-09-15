-- Activer RLS sur les tables team_members et agents
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Créer les politiques manquantes pour team_members
CREATE POLICY "Team members can view all team members" ON public.team_members
FOR SELECT USING (true);

CREATE POLICY "Team members can update their own profile" ON public.team_members
FOR UPDATE USING (id = auth.uid());

-- Créer les politiques pour agents si nécessaire
CREATE POLICY "Authenticated users can view agents" ON public.agents
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage agents" ON public.agents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR is_admin = true)
  )
);