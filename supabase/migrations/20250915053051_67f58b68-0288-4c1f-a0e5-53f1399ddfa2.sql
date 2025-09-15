-- Migration sécurisée avec gestion des contraintes
-- Mise à jour progressive pour éviter les violations de contraintes

-- Étape 1: Créer des IDs temporaires pour éviter les conflits
DO $$
DECLARE
    pierre_auth_id UUID;
    jade_auth_id UUID;
    jeanmarc_auth_id UUID;
    christelle_auth_id UUID;
    admin_auth_id UUID;
    chloe_auth_id UUID;
BEGIN
    -- Récupérer les IDs auth
    SELECT id INTO pierre_auth_id FROM auth.users WHERE email = 'pierre@gadait-international.com';
    SELECT id INTO jade_auth_id FROM auth.users WHERE email = 'jade@gadait-international.com';
    SELECT id INTO jeanmarc_auth_id FROM auth.users WHERE email = 'jeanmarc@gadait-international.com';
    SELECT id INTO christelle_auth_id FROM auth.users WHERE email = 'christelle@gadait-international.com';
    SELECT id INTO admin_auth_id FROM auth.users WHERE email = 'admin@gadait-international.com';
    SELECT id INTO chloe_auth_id FROM auth.users WHERE email = 'chloe@gadait-international.com';

    -- Mettre à jour les références dans toutes les tables AVANT de changer team_members
    
    -- 1. Leads - assigned_to
    UPDATE leads SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE leads SET assigned_to = jade_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE leads SET assigned_to = jeanmarc_auth_id WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE leads SET assigned_to = christelle_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE leads SET assigned_to = admin_auth_id WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE leads SET assigned_to = chloe_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 2. Leads - deleted_by
    UPDATE leads SET deleted_by = pierre_auth_id WHERE deleted_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE leads SET deleted_by = jade_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE leads SET deleted_by = jeanmarc_auth_id WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE leads SET deleted_by = christelle_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE leads SET deleted_by = admin_auth_id WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE leads SET deleted_by = chloe_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 3. lead_emails
    UPDATE lead_emails SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_emails SET user_id = jade_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE lead_emails SET user_id = jeanmarc_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE lead_emails SET user_id = christelle_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE lead_emails SET user_id = admin_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE lead_emails SET user_id = chloe_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 4. user_sessions
    UPDATE user_sessions SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE user_sessions SET user_id = jade_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE user_sessions SET user_id = jeanmarc_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE user_sessions SET user_id = christelle_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE user_sessions SET user_id = admin_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE user_sessions SET user_id = chloe_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 5. lead_ai_history
    UPDATE lead_ai_history SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_ai_history SET user_id = jade_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE lead_ai_history SET user_id = jeanmarc_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE lead_ai_history SET user_id = christelle_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE lead_ai_history SET user_id = admin_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE lead_ai_history SET user_id = chloe_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 6. lead_ai_conversations
    UPDATE lead_ai_conversations SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_ai_conversations SET user_id = jade_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE lead_ai_conversations SET user_id = jeanmarc_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE lead_ai_conversations SET user_id = christelle_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE lead_ai_conversations SET user_id = admin_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE lead_ai_conversations SET user_id = chloe_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 7. properties_backoffice
    UPDATE properties_backoffice SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE properties_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE properties_backoffice SET created_by = jade_auth_id WHERE created_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE properties_backoffice SET assigned_to = jade_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';

    -- 8. projets_backoffice
    UPDATE projets_backoffice SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE projets_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- 9. automated_email_campaigns
    UPDATE automated_email_campaigns SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- 10. chart_data_entries
    UPDATE chart_data_entries SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- 11. custom_property_elements
    UPDATE custom_property_elements SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- 12. lead_email_sequences
    UPDATE lead_email_sequences SET stopped_by = pierre_auth_id WHERE stopped_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- MAINTENANT mettre à jour team_members
    UPDATE team_members SET id = pierre_auth_id WHERE email = 'pierre@gadait-international.com';
    UPDATE team_members SET id = jade_auth_id WHERE email = 'jade@gadait-international.com';
    UPDATE team_members SET id = jeanmarc_auth_id WHERE email = 'jeanmarc@gadait-international.com';
    UPDATE team_members SET id = christelle_auth_id WHERE email = 'christelle@gadait-international.com';
    UPDATE team_members SET id = admin_auth_id WHERE email = 'admin@gadait-international.com';
    UPDATE team_members SET id = chloe_auth_id WHERE email = 'chloe@gadait-international.com';

END $$;