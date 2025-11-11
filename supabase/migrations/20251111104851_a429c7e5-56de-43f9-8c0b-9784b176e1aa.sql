-- Phase 1: Corriger le cron job pour utiliser la bonne edge function
-- Supprimer tous les anciens jobs de synchronisation s'ils existent
DO $$
BEGIN
  PERFORM cron.unschedule('daily-properties-sync');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('gadait-datocms-sync');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('datocms-sync');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Créer le nouveau job qui appelle sync-datocms-properties toutes les 6 heures
SELECT cron.schedule(
  'datocms-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/sync-datocms-properties',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Phase 2: Ajouter les colonnes multilingues à gadait_properties
ALTER TABLE gadait_properties 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_fr TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS slug_fr TEXT;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_gadait_properties_slug_en ON gadait_properties(slug_en);
CREATE INDEX IF NOT EXISTS idx_gadait_properties_slug_fr ON gadait_properties(slug_fr);
CREATE INDEX IF NOT EXISTS idx_gadait_properties_country ON gadait_properties(country);
CREATE INDEX IF NOT EXISTS idx_gadait_properties_is_available ON gadait_properties(is_available);

-- Ajouter des commentaires pour documenter la structure
COMMENT ON COLUMN gadait_properties.title_en IS 'Property title in English from DatoCMS';
COMMENT ON COLUMN gadait_properties.title_fr IS 'Property title in French from DatoCMS';
COMMENT ON COLUMN gadait_properties.description_en IS 'Property description in English from DatoCMS';
COMMENT ON COLUMN gadait_properties.description_fr IS 'Property description in French from DatoCMS';
COMMENT ON COLUMN gadait_properties.slug_en IS 'URL slug in English for SEO-friendly URLs';
COMMENT ON COLUMN gadait_properties.slug_fr IS 'URL slug in French for SEO-friendly URLs';