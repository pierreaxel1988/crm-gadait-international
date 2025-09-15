-- Mettre à jour le mot de passe de Franck Fontaine
UPDATE auth.users 
SET encrypted_password = crypt('@Franck2026', gen_salt('bf'))
WHERE email = 'franck.fontaine@gadait-international.com';