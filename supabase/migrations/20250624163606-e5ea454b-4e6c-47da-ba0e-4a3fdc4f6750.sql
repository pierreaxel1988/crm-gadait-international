
-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer l'ancienne tâche de scraping si elle existe
SELECT cron.unschedule('gadait-properties-sync');

-- Créer une tâche cron qui exécute la synchronisation DatoCMS toutes les 6 heures
SELECT cron.schedule(
  'gadait-datocms-sync',
  '0 */6 * * *', -- Toutes les 6 heures
  $$
  SELECT
    net.http_post(
        url:='https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/sync-datocms-properties',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Optionnel: Créer une fonction pour vérifier le statut des tâches cron
CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE(
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job;
$$;
