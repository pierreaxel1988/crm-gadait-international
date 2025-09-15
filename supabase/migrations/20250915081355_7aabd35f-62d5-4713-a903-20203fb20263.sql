-- Supprimer Franck Fontaine de team_members et auth.users
DELETE FROM team_members WHERE id = '14688125-e994-4841-b130-765610d6ac22';

-- Désassigner tous les leads qui pourraient être assignés à Franck
UPDATE leads SET assigned_to = NULL WHERE assigned_to = '14688125-e994-4841-b130-765610d6ac22';