-- Update Fleurs Samuelson's UUID to match the one in teamMemberService.ts
UPDATE public.team_members 
SET id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE email = 'fleurs@gadait-international.com';