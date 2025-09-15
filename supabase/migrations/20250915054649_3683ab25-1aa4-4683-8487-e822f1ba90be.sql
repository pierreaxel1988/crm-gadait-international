-- Restore email-based linking for leads RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "lead_select_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_update_policy" ON public.leads;
DROP POLICY IF EXISTS "lead_delete_policy" ON public.leads;

-- Create new policies using email-based linking via get_current_team_member_id()
CREATE POLICY "lead_select_policy" ON public.leads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_insert_policy" ON public.leads
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_update_policy" ON public.leads
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
    )
  )
);

CREATE POLICY "lead_delete_policy" ON public.leads
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (
      team_members.role = 'admin' 
      OR team_members.is_admin = true 
      OR (team_members.role = 'commercial' AND leads.assigned_to = team_members.id)
    )
  )
);

-- Update lead_emails policies to use email-based linking
DROP POLICY IF EXISTS "Users can insert their own emails" ON public.lead_emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON public.lead_emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON public.lead_emails;

CREATE POLICY "Users can insert their own emails" ON public.lead_emails
FOR INSERT WITH CHECK (user_id = get_current_team_member_id());

CREATE POLICY "Users can update their own emails" ON public.lead_emails
FOR UPDATE USING (user_id = get_current_team_member_id());

CREATE POLICY "Users can delete their own emails" ON public.lead_emails
FOR DELETE USING (user_id = get_current_team_member_id());

-- Update properties_backoffice policies
DROP POLICY IF EXISTS "Authenticated users can create properties" ON public.properties_backoffice;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties_backoffice;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties_backoffice;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties_backoffice;

CREATE POLICY "Authenticated users can create properties" ON public.properties_backoffice
FOR INSERT WITH CHECK (
  get_current_team_member_id() IS NOT NULL 
  AND created_by = get_current_team_member_id()
);

CREATE POLICY "Users can update their own properties" ON public.properties_backoffice
FOR UPDATE USING (
  get_current_team_member_id() IS NOT NULL 
  AND (created_by = get_current_team_member_id() OR assigned_to = get_current_team_member_id())
);

CREATE POLICY "Users can delete their own properties" ON public.properties_backoffice
FOR DELETE USING (
  get_current_team_member_id() IS NOT NULL 
  AND created_by = get_current_team_member_id()
);

CREATE POLICY "Users can view their own properties" ON public.properties_backoffice
FOR SELECT USING (
  get_current_team_member_id() IS NOT NULL 
  AND (created_by = get_current_team_member_id() OR assigned_to = get_current_team_member_id())
);

-- Update projets_backoffice policies
DROP POLICY IF EXISTS "Agents can create projects" ON public.projets_backoffice;
DROP POLICY IF EXISTS "Agents can update their projects, admins can update all" ON public.projets_backoffice;
DROP POLICY IF EXISTS "Agents can view their assigned projects and unassigned ones" ON public.projets_backoffice;

CREATE POLICY "Agents can create projects" ON public.projets_backoffice
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM team_members WHERE team_members.id = get_current_team_member_id()) 
  AND created_by = get_current_team_member_id()
);

CREATE POLICY "Agents can update their projects, admins can update all" ON public.projets_backoffice
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (team_members.role = 'admin' OR team_members.is_admin = true)
  ) 
  OR (assigned_to = get_current_team_member_id() OR created_by = get_current_team_member_id())
);

CREATE POLICY "Agents can view their assigned projects and unassigned ones" ON public.projets_backoffice
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.id = get_current_team_member_id() 
    AND (team_members.role = 'admin' OR team_members.is_admin = true)
  ) 
  OR assigned_to = get_current_team_member_id() 
  OR created_by = get_current_team_member_id() 
  OR assigned_to IS NULL
);

-- Update custom_property_elements policies
DROP POLICY IF EXISTS "Team members can create custom elements" ON public.custom_property_elements;
DROP POLICY IF EXISTS "Team members can update usage count" ON public.custom_property_elements;
DROP POLICY IF EXISTS "Team members can view all custom elements" ON public.custom_property_elements;

CREATE POLICY "Team members can create custom elements" ON public.custom_property_elements
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM team_members WHERE team_members.id = get_current_team_member_id()) 
  AND created_by = get_current_team_member_id()
);

CREATE POLICY "Team members can update usage count" ON public.custom_property_elements
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM team_members WHERE team_members.id = get_current_team_member_id())
);

CREATE POLICY "Team members can view all custom elements" ON public.custom_property_elements
FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members WHERE team_members.id = get_current_team_member_id())
);