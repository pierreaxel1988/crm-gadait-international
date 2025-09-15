-- Migration finale pour corriger les IDs Auth avec gestion complète des références
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

    -- Mettre à jour TOUTES les références dans leads d'abord
    
    -- 1. assigned_to avec tous les anciens IDs possibles
    UPDATE leads SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE leads SET assigned_to = pierre_auth_id WHERE assigned_to = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';
    UPDATE leads SET assigned_to = jade_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE leads SET assigned_to = jeanmarc_auth_id WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE leads SET assigned_to = christelle_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE leads SET assigned_to = christelle_auth_id WHERE assigned_to = '06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9';
    UPDATE leads SET assigned_to = admin_auth_id WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE leads SET assigned_to = admin_auth_id WHERE assigned_to = 'af1c9117-f94f-44d0-921f-776dd5fd6f96';
    UPDATE leads SET assigned_to = chloe_auth_id WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 2. deleted_by avec tous les anciens IDs possibles
    UPDATE leads SET deleted_by = pierre_auth_id WHERE deleted_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE leads SET deleted_by = pierre_auth_id WHERE deleted_by = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';
    UPDATE leads SET deleted_by = jade_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE leads SET deleted_by = jeanmarc_auth_id WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE leads SET deleted_by = christelle_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE leads SET deleted_by = christelle_auth_id WHERE deleted_by = '06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9';
    UPDATE leads SET deleted_by = admin_auth_id WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE leads SET deleted_by = admin_auth_id WHERE deleted_by = 'af1c9117-f94f-44d0-921f-776dd5fd6f96';
    UPDATE leads SET deleted_by = chloe_auth_id WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- 3. Mettre à jour les autres tables
    -- lead_emails
    UPDATE lead_emails SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_emails SET user_id = pierre_auth_id WHERE user_id = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';
    UPDATE lead_emails SET user_id = jade_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';
    UPDATE lead_emails SET user_id = jeanmarc_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';
    UPDATE lead_emails SET user_id = christelle_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';
    UPDATE lead_emails SET user_id = christelle_auth_id WHERE user_id = '06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9';
    UPDATE lead_emails SET user_id = admin_auth_id WHERE user_id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';
    UPDATE lead_emails SET user_id = admin_auth_id WHERE user_id = 'af1c9117-f94f-44d0-921f-776dd5fd6f96';
    UPDATE lead_emails SET user_id = chloe_auth_id WHERE user_id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

    -- user_sessions
    UPDATE user_sessions SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE user_sessions SET user_id = pierre_auth_id WHERE user_id = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';

    -- lead_ai_history
    UPDATE lead_ai_history SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_ai_history SET user_id = pierre_auth_id WHERE user_id = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';

    -- lead_ai_conversations
    UPDATE lead_ai_conversations SET user_id = pierre_auth_id WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_ai_conversations SET user_id = pierre_auth_id WHERE user_id = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';

    -- properties_backoffice
    UPDATE properties_backoffice SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE properties_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE properties_backoffice SET created_by = pierre_auth_id WHERE created_by = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';
    UPDATE properties_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';

    -- projets_backoffice
    UPDATE projets_backoffice SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE projets_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE projets_backoffice SET created_by = pierre_auth_id WHERE created_by = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';
    UPDATE projets_backoffice SET assigned_to = pierre_auth_id WHERE assigned_to = 'ccbc635f-0282-427b-b130-82c1f0fbbdf9';

    -- autres tables
    UPDATE automated_email_campaigns SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE chart_data_entries SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE custom_property_elements SET created_by = pierre_auth_id WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';
    UPDATE lead_email_sequences SET stopped_by = pierre_auth_id WHERE stopped_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

    -- SUPPRIMER les anciens team_members qui peuvent causer des conflits
    DELETE FROM team_members WHERE id IN (
        '3b3797a4-2fba-452d-a259-c593f02cdaaa',
        'ccbc635f-0282-427b-b130-82c1f0fbbdf9',
        '01927f62-2a89-4a10-b98a-e8f33c2b1e98',
        '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2',
        '01927f62-2a89-4a10-b98a-e8f33c2b1e9f',
        '06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9',
        '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1',
        'af1c9117-f94f-44d0-921f-776dd5fd6f96',
        '01927f62-2a89-4a10-b98a-e8f33c2b1ea0'
    );

    -- CRÉER les nouveaux team_members avec les bons IDs
    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (pierre_auth_id, 'Pierre-Axel Gadait', 'pierre@gadait-international.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (jade_auth_id, 'Jade Diouane', 'jade@gadait-international.com', 'commercial', false)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (jeanmarc_auth_id, 'Jean-Marc Perrissol', 'jeanmarc@gadait-international.com', 'commercial', false)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (christelle_auth_id, 'Christelle Gadait', 'christelle@gadait-international.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (admin_auth_id, 'Christine Francoise', 'admin@gadait-international.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

    INSERT INTO team_members (id, name, email, role, is_admin) VALUES 
    (chloe_auth_id, 'Chloe', 'chloe@gadait-international.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_admin = EXCLUDED.is_admin;

END $$;