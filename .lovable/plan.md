

# Nouvelle interface : Suivi du Chiffre d'Affaires (CA)

## Contexte
Les leads au statut "Deposit" et "Gagné" existent mais n'ont pas de données financières renseignées (`commission_ht`, `desired_price`, `fees` sont vides). Il faut une interface dédiée pour saisir et suivre le CA.

## Architecture proposée

### 1. Nouvelle table `deals` en base de données
Stocker les transactions closes séparément des leads pour un suivi financier propre :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `lead_id` | uuid | FK vers leads |
| `lead_name` | text | Nom du lead (dénormalisé) |
| `agent_id` | uuid | FK vers team_members |
| `sale_price` | numeric | Prix de vente |
| `commission_percentage` | numeric | % de commission |
| `commission_amount` | numeric | Montant de la commission (calculé ou saisi) |
| `lead_source` | text | Source du lead |
| `pipeline_type` | text | purchase/rental/owners |
| `deal_date` | date | Date du dépôt/closing |
| `currency` | text | EUR par défaut |
| `notes` | text | Commentaires |
| `status` | text | deposit / signed / won |
| `created_at` / `updated_at` | timestamptz | Timestamps |

### 2. Nouveau composant `src/components/admin/RevenueTracker.tsx`
- **Cards résumé** : CA total, nombre de deals, commission moyenne, CA par pipeline
- **Formulaire d'ajout** : Saisir un nouveau deal (sélection du lead existant au statut Deposit/Gagné, prix, commission, source)
- **Tableau des deals** : Liste triable avec toutes les colonnes demandées
- **Filtres** : Par période, par agent, par source, par pipeline type
- **Calcul auto** : commission_amount = sale_price × commission_percentage / 100

### 3. Nouvel onglet Admin
Ajouter un onglet **"💰 Chiffre d'Affaires"** dans `src/pages/Admin.tsx`, positionné après "Pipeline Chaud".

### 4. Fonctionnalités du tableau
- Colonnes : Lead | Agent | Prix de vente | % Commission | Montant commission | Source | Date | Statut
- Tri par date, montant, agent
- Total en bas du tableau
- Export CSV possible

### Détail technique
- Migration SQL pour créer la table `deals` avec RLS policies
- Le composant fetch les `team_members` pour le dropdown agent et les `leads` au statut Deposit/Signed/Gagné pour le dropdown lead
- Calcul automatique de `commission_amount` quand `sale_price` et `commission_percentage` changent

