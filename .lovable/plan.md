
# Optimisations CRM — Implémentation

## ✅ Implémenté

### Badge de priorité lead (Quick win #2)
- Composant `PriorityBadge` avec scoring (🔴🟠🟡🟢)
- Visible sur les KanbanCard (desktop) et LeadListItem (mobile)
- Score basé sur : stade + tags + urgence action

### Compteur d'actions navbar (Quick win #9)
- Composant `ActionsBadge` dans la navbar
- Affiche le nombre d'actions en retard + aujourd'hui
- Badge rouge si actions en retard, terracotta sinon
- Rafraîchissement toutes les 5 minutes

### Dashboard Ma Journée (#4)
- Page `/my-day` accessible via SubNavigation
- Actions en retard (rouge) et du jour (bleu)
- Leads sans action programmée
- Leads inactifs (+5 jours)
- Leads sans tag
- Greeting personnalisé par heure du jour

## 🔲 À implémenter

### PRIORITE 1
1. Alerte automatique "Lead dormant" (Edge Function cron)
3. Temps de réponse moyen par agent (KPI visible)

### PRIORITE 2
5. Interface leads "No response" en séquence de relance
6. Badge leads sans action programmée (dans rapport quotidien)

### PRIORITE 3
7. Taux de conversion par source
8. Objectifs agent et progression

### PRIORITE 4
10. Export automatique hebdo KPI management
