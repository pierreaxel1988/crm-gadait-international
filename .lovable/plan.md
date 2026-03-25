

## Ajouter Pierre en CC des emails agents (leads dormants)

### Changement unique : `supabase/functions/check-dormant-leads/index.ts`

Dans la section d'envoi des emails individuels aux agents (appel Resend API), ajouter le champ `cc` avec `pierre@gadait-international.com` au body JSON de chaque requête.

Pierre continuera aussi à recevoir le rapport résumé global via `ADMIN_EMAILS`.

