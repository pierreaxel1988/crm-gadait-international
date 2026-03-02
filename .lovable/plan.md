

# Tableau de suivi des stades chauds du pipeline achat

## Objectif
Créer un nouveau tab admin "Suivi Pipeline Chaud" qui affiche un tableau de bord détaillé des leads dans les 3 statuts les plus critiques du pipeline achat : **Visites en cours** (Visit), **Offre en cours** (Offre), **Dépôt reçu** (Deposit), ventilé par agent.

## Ce qui sera affiché

Pour chaque statut (Visit / Offre / Deposit), un tableau par agent avec :
- **Nombre total de leads** dans ce statut
- **Leads sans aucune action** (action_history vide ou uniquement "Creation")
- **Leads dormants** : dernière action (completedDate) date de plus de 10 jours → lead "endormi"
- **Liste des leads concernés** (nom cliquable vers la fiche)

En haut : 3 cartes de synthèse globale (une par statut) avec total / alertes.

## Fichiers impactés

### 1. Nouveau fichier : `src/components/admin/HotPipelineMonitor.tsx`
- Composant principal qui fetch les leads purchase avec statut IN ('Visit', 'Offre', 'Deposit')
- Joint avec `team_members` pour le nom de l'agent
- Analyse le `action_history` (JSONB) côté client pour calculer :
  - Date de la dernière action complétée (max `completedDate`)
  - Si aucune action réelle (hors "Creation")
  - Si dernière action > 10 jours
- Affiche 3 sections (une par statut) avec un tableau agent → métriques
- Filtre optionnel par agent (dropdown)
- Code couleur : rouge pour leads dormants, orange pour sans action

### 2. Modifié : `src/pages/Admin.tsx`
- Ajouter un TabsTrigger "Pipeline Chaud" 
- Ajouter le TabsContent correspondant avec le composant `HotPipelineMonitor`
- Import du nouveau composant

## Données utilisées
- Table `leads` : `id`, `name`, `status`, `assigned_to`, `action_history`, `pipeline_type`, `deleted_at`, `budget`, `email`, `phone`
- Table `team_members` : `id`, `name`
- Pas de migration nécessaire, tout existe déjà

