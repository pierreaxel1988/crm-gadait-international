-- Supprimer Franck Fontaine de la table team_members
DELETE FROM team_members WHERE email LIKE '%franck%' OR name LIKE '%Franck%';