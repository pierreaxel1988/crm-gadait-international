-- Migration pour corriger les IDs d'authentification avec gestion des contraintes
-- Approche sécurisée pour mettre à jour les IDs Auth et leurs références

-- Créer une table temporaire pour stocker les correspondances
CREATE TEMP TABLE id_mappings (
    old_id UUID,
    new_id UUID,
    email TEXT
);

-- Insérer les correspondances d'IDs
INSERT INTO id_mappings (old_id, new_id, email) VALUES
    ((SELECT id FROM auth.users WHERE email = 'pierre@gadait-international.com'), '3b3797a4-2fba-452d-a259-c593f02cdaaa', 'pierre@gadait-international.com'),
    ((SELECT id FROM auth.users WHERE email = 'christelle@gadait-international.com'), '01927f62-2a89-4a10-b98a-e8f33c2b1e9f', 'christelle@gadait-international.com'),
    ((SELECT id FROM auth.users WHERE email = 'admin@gadait-international.com'), '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1', 'admin@gadait-international.com'),
    ((SELECT id FROM auth.users WHERE email = 'jade@gadait-international.com'), '01927f62-2a89-4a10-b98a-e8f33c2b1e98', 'jade@gadait-international.com'),
    ((SELECT id FROM auth.users WHERE email = 'jeanmarc@gadait-international.com'), '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2', 'jeanmarc@gadait-international.com'),
    ((SELECT id FROM auth.users WHERE email = 'chloe@gadait-international.com'), '01927f62-2a89-4a10-b98a-e8f33c2b1ea0', 'chloe@gadait-international.com');

-- Temporairement désactiver les contraintes de clés étrangères
ALTER TABLE auth.identities DISABLE TRIGGER ALL;
ALTER TABLE auth.sessions DISABLE TRIGGER ALL;
ALTER TABLE auth.refresh_tokens DISABLE TRIGGER ALL;

-- Mettre à jour les identities
UPDATE auth.identities 
SET user_id = m.new_id
FROM id_mappings m
WHERE auth.identities.user_id = m.old_id;

-- Mettre à jour les sessions
UPDATE auth.sessions 
SET user_id = m.new_id
FROM id_mappings m
WHERE auth.sessions.user_id = m.old_id;

-- Mettre à jour les refresh_tokens
UPDATE auth.refresh_tokens 
SET user_id = m.new_id
FROM id_mappings m
WHERE auth.refresh_tokens.user_id = m.old_id;

-- Maintenant mettre à jour les users
UPDATE auth.users 
SET id = m.new_id
FROM id_mappings m
WHERE auth.users.id = m.old_id;

-- Réactiver les contraintes
ALTER TABLE auth.identities ENABLE TRIGGER ALL;
ALTER TABLE auth.sessions ENABLE TRIGGER ALL;
ALTER TABLE auth.refresh_tokens ENABLE TRIGGER ALL;