

## Analyse du systeme de detection des leads dormants

### Problemes identifies

Le systeme actuel de `check-dormant-leads` presente plusieurs problemes majeurs de fiabilite :

**1. Mauvaises colonnes utilisees pour determiner la dormance**

L'Edge Function utilise `last_contact_date` et `next_action_date` (ligne 39, 60), mais :
- L'application CRM ecrit la derniere activite dans `last_contacted_at` (voir `leadActions.ts` ligne 107)
- Les actions futures sont stockees dans `next_follow_up_date` (pas `next_action_date`)
- `last_contact_date` n'est quasiment jamais mis a jour par le code applicatif
- Resultat : des leads actifs sont marques comme dormants, et des leads reellement dormants sont ignores

**2. L'action_history est ignoree**

Le `HotPipelineMonitor.tsx` (cote client) analyse correctement le champ `action_history` JSON pour determiner la derniere action et la prochaine action planifiee (lignes 61-106). L'Edge Function ne le fait pas du tout -- elle se fie uniquement a des colonnes metadata souvent desynchronisees.

**3. Pas de distinction entre action completee et action planifiee**

L'Edge Function ne verifie pas si une action future est reellement planifiee dans `action_history`. Elle regarde seulement `next_action_date`, qui peut etre vide meme si une action est planifiee dans le JSON.

### Plan de correction

#### Changement unique : `supabase/functions/check-dormant-leads/index.ts`

1. **Fetcher `action_history` et `last_contacted_at`** au lieu de `last_contact_date` et `next_action_date`
   - Ajouter `action_history, last_contacted_at` au SELECT
   
2. **Reimplementer la logique de dormance** en analysant `action_history` comme le fait `HotPipelineMonitor` :
   - Parser chaque action du JSON array
   - Filtrer les actions de type "Creation"
   - Trouver la derniere action passee (via `completedDate` ou `scheduledDate` ou `createdAt`)
   - Trouver la prochaine action future planifiee (via `scheduledDate` sans `completedDate`)
   - Un lead est dormant si : pas d'action future planifiee ET derniere activite > 7 jours

3. **Enrichir l'email avec les vraies infos** :
   - Ajouter la derniere action effectuee (type + date) dans le tableau email
   - Ajouter la colonne "Derniere action" au tableau HTML
   - Afficher le type d'action (Call, Visit, Email, etc.) et la date reelle

4. **Corriger le fallback de date** : utiliser `last_contacted_at` (la colonne reellement mise a jour) au lieu de `last_contact_date`, avec fallback sur `created_at`

5. **Redeployer** l'Edge Function apres modification

### Resultat attendu

- La detection de dormance sera basee sur les **vraies actions** enregistrees dans la base
- Les emails contiendront la **derniere action reelle** (type + date) pour chaque lead
- Les agents sauront exactement **quand et quelle** action a ete faite en dernier
- Plus de faux positifs (leads actifs marques dormants) ni de faux negatifs

