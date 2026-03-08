
## Plan : Ajouter l'onglet "Chiffre d'affaire" pour chaque agent

### Objectif
Ajouter un nouvel onglet **"Chiffre d'affaire"** dans la navigation principale (SubNavigation), positionné entre "Propriétés" et "Resources". Cet onglet affichera la même interface que le `RevenueTracker` de l'Admin, mais filtré automatiquement sur les deals de l'agent connecté.

### Approche technique

#### 1. Créer une nouvelle page `AgentRevenue.tsx`
- Basée sur `RevenueTracker.tsx` mais simplifiée pour l'agent
- Récupère l'ID de l'agent connecté via `useAuth()` et la table `team_members`
- Filtre automatiquement les deals par `agent_id` de l'utilisateur
- Masque le filtre "Agent" (inutile puisque déjà filtré)
- Conserve les fonctionnalités : stats résumées, tableau des deals, export CSV

#### 2. Modifier `SubNavigation.tsx`
- Ajouter l'entrée `{ name: 'Chiffre d'affaire', path: '/revenue', icon: TrendingUp }` 
- Positionner avant "Resources"

#### 3. Modifier `App.tsx`
- Ajouter la route `/revenue` protégée avec `commercialAllowed={true}`
- Lazy load du composant `AgentRevenue`

### Fichiers à modifier/créer
| Fichier | Action |
|---------|--------|
| `src/pages/AgentRevenue.tsx` | Créer — interface CA filtrée pour l'agent |
| `src/components/layout/SubNavigation.tsx` | Modifier — ajouter l'onglet |
| `src/App.tsx` | Modifier — ajouter la route |

### Comportement attendu
- **Agent** : Voit uniquement SES deals avec ses stats personnelles
- **Admin** : Accède également à cette page (voit ses propres deals s'il en a, sinon vue vide)
- Les fonctionnalités d'ajout/modification de deal restent disponibles (pour des corrections)
