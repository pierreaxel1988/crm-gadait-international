

## Analyse et propositions d'optimisation CRM — par priorité d'impact

Après analyse de la DB leads, des rapports agents, du pipeline chaud, des analytics et de la structure action_history, voici les optimisations classées par impact business.

---

### PRIORITE 1 — Impact immédiat sur le revenu

#### 1. Alerte automatique "Lead dormant" en temps réel
**Problème** : Le Pipeline Chaud détecte les leads dormants (>10j sans action), mais uniquement quand l'agent consulte la page. Pas de notification proactive.
**Solution** : Créer une Edge Function `check-dormant-leads` (cron quotidien) qui :
- Détecte les leads Visit/Offre/Deposit sans action depuis >7 jours
- Insère une notification dans la table `notifications` pour l'agent concerné
- Envoie un email ciblé via Resend à l'agent avec le lien direct vers le lead
**Impact** : Empêche la perte de leads chauds par inaction. Chaque lead en Offre/Deposit représente potentiellement des dizaines de milliers d'euros de commission.

#### 2. Score de priorité lead dynamique visible dans le CRM
**Problème** : Le scoring existe dans `leadSortUtils.ts` mais n'est jamais affiché à l'agent. Il trie silencieusement.
**Solution** : Afficher un badge de priorité (🔴🟠🟡🟢) sur chaque lead dans le pipeline et la liste, basé sur le score combiné (stade + tag + urgence action). L'agent voit immédiatement quel lead traiter en premier.
**Impact** : Oriente l'effort de l'agent vers les leads à plus forte valeur. Coût de dev faible, gain immédiat.

#### 3. Temps de réponse moyen par agent (KPI visible)
**Problème** : `getLeadResponseTimesAll()` existe dans le rapport hebdo mais n'est pas visible dans le CRM au quotidien.
**Solution** : Ajouter un widget dans le dashboard agent montrant le temps moyen de première réponse (délai entre `created_at` et la première action non-auto). Objectif cible : <2h pour les leads Hot/VIP.
**Impact** : Selon les études immobilières, répondre dans les 5 premières minutes multiplie par 9 le taux de conversion.

---

### PRIORITE 2 — Amélioration de la productivité

#### 4. Dashboard agent personnel quotidien (dans le CRM)
**Problème** : Les agents reçoivent un email quotidien mais n'ont pas de vue "Ma journée" dans le CRM.
**Solution** : Page `/my-day` affichant :
- Actions en retard (rouge)
- Actions du jour (bleu)
- Leads sans tag (alerte)
- Leads non contactés depuis >5 jours
- Score de performance hebdo vs objectif
**Impact** : L'agent commence sa journée avec un plan clair au lieu de chercher dans le pipeline.

#### 5. Détection automatique des leads "No response" à relancer
**Problème** : La vue `v_no_response_candidates` existe en DB et le trigger `enqueue_no_response_followups` aussi, mais pas d'interface agent pour visualiser ces candidats ni leur progression.
**Solution** : Ajouter un onglet "Relances auto" dans le pipeline ou les actions, montrant les leads en séquence de relance avec le step actuel (1/3, 2/3, 3/3) et la possibilité de les convertir manuellement.
**Impact** : Récupère des leads perdus par absence de suivi systématique.

#### 6. Alertes "Lead sans action programmée"
**Problème** : Un lead peut être en statut Qualified ou Contacted sans aucune action future programmée — il tombe dans l'oubli.
**Solution** : Badge d'alerte ⚠️ sur les leads actifs (ni Gagné ni Perdu) qui n'ont aucune action future. Inclure dans le rapport quotidien.
**Impact** : Élimine les "trous" dans le suivi client.

---

### PRIORITE 3 — Optimisation analytique

#### 7. Taux de conversion par source (ROI marketing)
**Problème** : `SalesAnalytics` montre les actions par agent mais pas le taux de conversion par source (Site web, Portails, Network...).
**Solution** : Ajouter un graphique dans Admin > Analytics montrant pour chaque `source` : nombre de leads → taux de conversion vers Gagné → CA moyen. Permet de savoir où investir le budget marketing.
**Impact** : Optimise l'allocation du budget acquisition.

#### 8. Objectifs agent et progression
**Problème** : Pas d'objectifs définis par agent (nombre de leads à traiter, CA cible, nombre d'appels/semaine).
**Solution** : Table `agent_goals` avec objectifs mensuels par agent. Widget de progression dans le dashboard personnel (barre de progression vers l'objectif).
**Impact** : Gamification et motivation, visibilité management.

---

### PRIORITE 4 — Quick wins

#### 9. Compteur d'actions du jour dans la navbar
**Solution** : Badge dans la navigation montrant le nombre d'actions du jour + en retard. Clic = ouvre la page Actions filtrée.
**Impact** : Rappel constant, coût de dev minimal.

#### 10. Export automatique hebdo des KPI par email au management
**Problème** : Les rapports existent mais le management doit aller les consulter.
**Solution** : Enrichir le `weekly-activity-report` avec un tableau comparatif agents (temps de réponse, leads traités, conversion, CA) envoyé chaque lundi.
**Impact** : Pilotage sans effort.

---

### Résumé par effort/impact

```text
Impact élevé ↑
│
│  1. Alertes dormants    2. Badge priorité
│  3. Temps de réponse    
│                         4. Dashboard Ma Journée
│  7. Conversion/source   5. Relances No Response
│                         6. Lead sans action
│  8. Objectifs agent     9. Badge navbar
│                        10. Export hebdo KPI
│
└──────────────────────────────────────→ Effort croissant
```

Dites-moi lesquelles vous souhaitez implémenter en premier.

