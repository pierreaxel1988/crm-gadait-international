-- D'abord désassigner tous les leads de Franck, puis le supprimer
UPDATE leads SET assigned_to = NULL WHERE assigned_to = '14688125-e994-4841-b130-765610d6ac22';

-- Maintenant supprimer Franck de team_members
DELETE FROM team_members WHERE id = '14688125-e994-4841-b130-765610d6ac22';