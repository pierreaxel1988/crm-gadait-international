

## Plan : Ajouter l'onglet "Pipeline Chaud" pour chaque agent

### Objectif
Ajouter un nouvel onglet **"Pipeline Chaud"** dans la SubNavigation, accessible à tous les agents. Il affichera la meme interface que le `HotPipelineMonitor` admin mais filtrée automatiquement sur les leads assignés a l'agent connecté (sans le filtre agent).

### Approche technique

#### 1. Créer `src/pages/AgentHotPipeline.tsx`
- Page wrapper avec Navbar + SubNavigation
- Récupère le `team_member.id` de l'agent connecté via `useAuth()` + requete `team_members`
- Réutilise directement le composant `HotPipelineMonitor` existant en lui passant une nouvelle prop `agentId`

#### 2. Modifier `src/components/admin/HotPipelineMonitor.tsx`
- Ajouter une prop optionnelle `agentId?: string`
- Si `agentId` est fourni : filtrer la requete Supabase avec `.eq('assigned_to', agentId)` et masquer le filtre agent

#### 3. Modifier `SubNavigation.tsx`
- Ajouter `{ name: 'Pipeline Chaud', path: '/hot-pipeline', icon: Flame }` entre "Chiffre d'affaire" et "Resources"

#### 4. Modifier `App.tsx`
- Lazy load `AgentHotPipeline`
- Route `/hot-pipeline` protégée avec `commercialAllowed={true}`

### Fichiers a modifier/créer
| Fichier | Action |
|---------|--------|
| `src/pages/AgentHotPipeline.tsx` | Créer |
| `src/components/admin/HotPipelineMonitor.tsx` | Modifier — ajouter prop `agentId` |
| `src/components/layout/SubNavigation.tsx` | Modifier — ajouter onglet |
| `src/App.tsx` | Modifier — ajouter route |

