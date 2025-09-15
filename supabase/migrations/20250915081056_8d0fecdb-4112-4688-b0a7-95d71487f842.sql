-- Supprimer les leads de test
DELETE FROM leads WHERE 
  name LIKE '%test%' 
  OR email LIKE '%test%' 
  OR name = 'test2' 
  OR name = 'test 1er juillet'
  OR email = 'thomastesti@live.com';