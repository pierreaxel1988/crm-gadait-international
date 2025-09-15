-- Générer un nouvel UUID pour Franck
INSERT INTO team_members (
  id,
  name,
  email,
  role,
  is_admin,
  created_at
) VALUES (
  gen_random_uuid(),
  'Franck Fontaine',
  'franck.fontaine@gadait-international.com',
  'agent',
  false,
  now()
);