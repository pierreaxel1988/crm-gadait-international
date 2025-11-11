-- Add Fleurs Samuelson to team_members table
INSERT INTO public.team_members (id, name, email, role)
VALUES (
  gen_random_uuid(),
  'Fleurs Samuelson',
  'fleurs@gadait-international.com',
  'agent'
)
ON CONFLICT (email) DO NOTHING;