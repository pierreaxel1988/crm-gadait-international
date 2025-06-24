
-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer l'ancienne tâche si elle existe
SELECT cron.unschedule('gadait-properties-sync');

-- Créer une tâche cron qui exécute le scraping toutes les heures avec la nouvelle URL
SELECT cron.schedule(
  'gadait-properties-sync',
  '0 * * * *', -- Toutes les heures à la minute 0
  $$
  SELECT
    net.http_post(
        url:='https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/scrape-website',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
        body:='{"url": "https://gadait-international.com/en/search/", "debug": false}'::jsonb
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
