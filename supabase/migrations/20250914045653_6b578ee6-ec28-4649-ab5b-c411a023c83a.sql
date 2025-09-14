-- Supprimer TOUTES les politiques RLS existantes sur la table leads
DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Commercials see their assigned leads, admins see all" ON public.leads;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux peuvent créer des leads" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux peuvent mettre à jour leurs leads" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux peuvent modifier uniquement leurs leads" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux peuvent supprimer leurs leads" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux peuvent voir uniquement leurs leads" ON public.leads;
DROP POLICY IF EXISTS "Les commerciaux voient uniquement leurs leads" ON public.leads;
DROP POLICY IF EXISTS "Only owner or admin can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Only owner or admin can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Only owner or admin can see leads" ON public.leads;
DROP POLICY IF EXISTS "Only owner or admin can update leads" ON public.leads;
DROP POLICY IF EXISTS "Team members can delete their own leads or admins can delete an" ON public.leads;
DROP POLICY IF EXISTS "Team members can insert their own leads or admins can insert an" ON public.leads;
DROP POLICY IF EXISTS "Team members can update their own leads or admins can update an" ON public.leads;
DROP POLICY IF EXISTS "Team members can view their own leads or admins can view all" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads or admins assign" ON public.leads;
DROP POLICY IF EXISTS "Users can modify their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads they are assigned to" ON public.leads;

-- Créer des politiques RLS simples et claires pour l'isolation parfaite des données
-- 1. Politique de lecture : Commerciaux voient uniquement leurs leads, admins voient tout
CREATE POLICY "lead_select_policy" ON public.leads
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = auth.uid() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = auth.uid())
    )
  )
);

-- 2. Politique d'insertion : Seuls les admins ou la personne assignée peut créer
CREATE POLICY "lead_insert_policy" ON public.leads
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = auth.uid() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = auth.uid())
    )
  )
);

-- 3. Politique de mise à jour : Seuls les admins ou la personne assignée peut modifier
CREATE POLICY "lead_update_policy" ON public.leads
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = auth.uid() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = auth.uid())
    )
  )
);

-- 4. Politique de suppression : Seuls les admins ou la personne assignée peut supprimer
CREATE POLICY "lead_delete_policy" ON public.leads
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = auth.uid() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = auth.uid())
    )
  )
);