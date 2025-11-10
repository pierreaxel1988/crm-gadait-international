# Configuration des Notifications Automatiques

Ce système envoie des notifications automatiques aux agents pour :
- **Leads chauds** : Alertes lorsqu'un lead consulte 4 propriétés ou plus
- **Leads inactifs** : Alertes pour les leads qui n'ont pas consulté de propriétés depuis 7 jours

## 🔥 Détection des Leads Chauds (Automatique)

La détection des leads chauds est **automatique** grâce à un trigger de base de données.

Chaque fois qu'un lead clique sur une propriété via la fonction `track-property-click`, le système vérifie automatiquement :
- Le nombre total de clics du lead
- Si le lead atteint exactement 4 clics, une notification est créée pour l'agent assigné

**Aucune configuration supplémentaire nécessaire !**

## ⏰ Détection des Leads Inactifs (Cron Job)

La détection des leads inactifs nécessite la configuration d'un cron job dans Supabase.

### Étapes de Configuration

1. **Activer les extensions nécessaires**

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Activer l'extension pg_cron si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Activer l'extension pg_net pour les appels HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
```

2. **Créer le cron job**

Exécutez ce SQL pour créer un job qui s'exécute tous les jours à 9h00 :

```sql
SELECT cron.schedule(
  'check-inactive-leads-daily',
  '0 9 * * *', -- Tous les jours à 9h00
  $$
  SELECT
    net.http_post(
        url := 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/check-inactive-leads',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);
```

3. **Vérifier le cron job**

Pour vérifier que le cron job a bien été créé :

```sql
SELECT * FROM cron.job WHERE jobname = 'check-inactive-leads-daily';
```

4. **Tester manuellement (optionnel)**

Pour tester la fonction sans attendre le cron :

```sql
SELECT
  net.http_post(
      url := 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/check-inactive-leads',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
      body := '{}'::jsonb
  ) as request_id;
```

### Modifier la Fréquence du Cron Job

Pour changer la fréquence d'exécution, modifiez le deuxième paramètre (format cron) :

- `'0 9 * * *'` : Tous les jours à 9h00
- `'0 */6 * * *'` : Toutes les 6 heures
- `'0 0 * * 1'` : Tous les lundis à minuit
- `'*/30 * * * *'` : Toutes les 30 minutes

Pour mettre à jour :

```sql
-- D'abord, supprimer l'ancien job
SELECT cron.unschedule('check-inactive-leads-daily');

-- Puis créer le nouveau avec la nouvelle fréquence
SELECT cron.schedule(
  'check-inactive-leads-daily',
  '0 */6 * * *', -- Nouvelle fréquence
  $$
  SELECT
    net.http_post(
        url := 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/check-inactive-leads',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);
```

## 📊 Paramètres Configurables

Dans l'edge function `check-inactive-leads`, vous pouvez modifier :

- **Période d'inactivité** : Ligne 23 (`const inactivityDays = 7;`)
- **Seuil de leads chauds** : Dans la migration SQL, ligne qui vérifie `IF click_count = 4`

## 🔍 Logs et Monitoring

Pour consulter les logs de l'edge function :
1. Allez dans Supabase Dashboard > Edge Functions
2. Sélectionnez `check-inactive-leads`
3. Consultez l'onglet "Logs"

## 🗑️ Nettoyage Automatique

Les notifications de plus de 30 jours sont automatiquement supprimées lors de chaque exécution de la fonction `check-inactive-leads`.

## 🚨 Résolution de Problèmes

### Le cron job ne s'exécute pas

1. Vérifiez que pg_cron est installé :
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

2. Vérifiez les logs du cron :
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'check-inactive-leads-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

### Pas de notifications créées

1. Vérifiez qu'il y a des leads avec des clics :
```sql
SELECT COUNT(DISTINCT lead_id) FROM property_clicks;
```

2. Vérifiez les logs de l'edge function dans le Dashboard Supabase

3. Testez manuellement la fonction (voir section "Tester manuellement")
