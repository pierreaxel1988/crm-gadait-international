-- Migration pour corriger les IDs d'authentification
-- Mettre à jour les IDs Auth pour correspondre aux IDs team_members

-- Mettre à jour Pierre-Axel Gadait
UPDATE auth.users 
SET id = '3b3797a4-2fba-452d-a259-c593f02cdaaa'
WHERE email = 'pierre@gadait-international.com';

-- Mettre à jour Christelle Chung Tung Sim
UPDATE auth.users 
SET id = '01927f62-2a89-4a10-b98a-e8f33c2b1e9f'
WHERE email = 'christelle@gadait-international.com';

-- Mettre à jour Admin
UPDATE auth.users 
SET id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb1'
WHERE email = 'admin@gadait-international.com';

-- Mettre à jour Jade Diouane
UPDATE auth.users 
SET id = '01927f62-2a89-4a10-b98a-e8f33c2b1e98'
WHERE email = 'jade@gadait-international.com';

-- Mettre à jour Jean-Marc Perrissol
UPDATE auth.users 
SET id = '01927f62-2a89-49ba-bd1b-6e2e14ed1fb2'
WHERE email = 'jeanmarc@gadait-international.com';

-- Mettre à jour Chloé Morat
UPDATE auth.users 
SET id = '01927f62-2a89-4a10-b98a-e8f33c2b1ea0'
WHERE email = 'chloe@gadait-international.com';