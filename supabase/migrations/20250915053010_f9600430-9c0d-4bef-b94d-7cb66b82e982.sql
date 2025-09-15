-- Migration correcte : Mise à jour des team_members et références pour correspondre aux auth.users
-- APPROCHE SÉCURISÉE : On garde les auth.users IDs et on met à jour team_members + références

-- 1. Mettre à jour les IDs dans team_members pour correspondre aux auth.users
UPDATE team_members 
SET id = '3b3797a4-2fba-452d-a259-c593f02cdaaa'
WHERE email = 'pierre@gadait-international.com';

UPDATE team_members 
SET id = 'b9677c18-ef9b-417e-a3a6-4ef3744a0c90'
WHERE email = 'pierre@gadait-international.com' AND id != '3b3797a4-2fba-452d-a259-c593f02cdaaa';

UPDATE team_members 
SET id = (SELECT id FROM auth.users WHERE email = 'jade@gadait-international.com')
WHERE email = 'jade@gadait-international.com';

UPDATE team_members 
SET id = (SELECT id FROM auth.users WHERE email = 'jeanmarc@gadait-international.com')
WHERE email = 'jeanmarc@gadait-international.com';

UPDATE team_members 
SET id = (SELECT id FROM auth.users WHERE email = 'christelle@gadait-international.com')
WHERE email = 'christelle@gadait-international.com';

UPDATE team_members 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@gadait-international.com')
WHERE email = 'admin@gadait-international.com';

UPDATE team_members 
SET id = (SELECT id FROM auth.users WHERE email = 'chloe@gadait-international.com')
WHERE email = 'chloe@gadait-international.com';

-- 2. Mettre à jour les références dans leads (assigned_to, deleted_by)
-- Pierre
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE deleted_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- Jade
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'jade@gadait-international.com')
WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'jade@gadait-international.com')
WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e98';

-- Jean-Marc
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'jeanmarc@gadait-international.com')
WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'jeanmarc@gadait-international.com')
WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2';

-- Christelle
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'christelle@gadait-international.com')
WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'christelle@gadait-international.com')
WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f';

-- Admin
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'admin@gadait-international.com')
WHERE assigned_to = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'admin@gadait-international.com')
WHERE deleted_by = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1';

-- Chloe
UPDATE leads 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'chloe@gadait-international.com')
WHERE assigned_to = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

UPDATE leads 
SET deleted_by = (SELECT id FROM auth.users WHERE email = 'chloe@gadait-international.com')
WHERE deleted_by = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0';

-- 3. Mettre à jour les autres tables
-- lead_emails
UPDATE lead_emails 
SET user_id = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- user_sessions
UPDATE user_sessions 
SET user_id = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- lead_ai_history
UPDATE lead_ai_history 
SET user_id = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- lead_ai_conversations
UPDATE lead_ai_conversations 
SET user_id = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE user_id = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- properties_backoffice
UPDATE properties_backoffice 
SET created_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

UPDATE properties_backoffice 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- projets_backoffice
UPDATE projets_backoffice 
SET created_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

UPDATE projets_backoffice 
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE assigned_to = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- automated_email_campaigns
UPDATE automated_email_campaigns 
SET created_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- chart_data_entries
UPDATE chart_data_entries 
SET created_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- custom_property_elements
UPDATE custom_property_elements 
SET created_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE created_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';

-- lead_email_sequences
UPDATE lead_email_sequences 
SET stopped_by = (SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com')
WHERE stopped_by = '3b3797a4-2fba-452d-a259-c593f02cdaaa';