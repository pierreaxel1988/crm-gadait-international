
-- Ajouter le champ video_urls à la table gadait_properties
ALTER TABLE public.gadait_properties 
ADD COLUMN video_urls text[] DEFAULT '{}';

-- Créer un index pour optimiser les recherches sur les propriétés avec vidéos
CREATE INDEX idx_gadait_properties_video_urls ON public.gadait_properties USING GIN (video_urls);
