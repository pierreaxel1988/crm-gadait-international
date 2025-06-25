
-- Supprimer toutes les propriétés existantes de la table gadait_properties
DELETE FROM public.gadait_properties;

-- Optionnel: Reset de la séquence si nécessaire (pour les compteurs auto-incrémentés)
-- Note: Cette table utilise des UUID donc pas de séquence à reset
