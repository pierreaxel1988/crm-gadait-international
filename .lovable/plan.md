

## Filtre par agent sur la page Ma Journée (admin only)

### Changements dans `src/pages/MyDay.tsx`

1. **Importer** `GUARANTEED_TEAM_MEMBERS` depuis `teamMemberService` et `isAdmin` depuis `useAuth`
2. **Ajouter un state** `selectedAgentId: string | null` (default `null` = tous)
3. **Afficher un sélecteur d'agent** (boutons comme dans `AgentFilter.tsx`) entre le greeting et les stats, visible uniquement si `isAdmin`
4. **Modifier `fetchData`** : quand `isAdmin` et `selectedAgentId` est défini, filtrer par `assigned_to = selectedAgentId`. Refetch quand `selectedAgentId` change
5. **Adapter le greeting** : si un agent est sélectionné, afficher son nom au lieu de "Agent"

Pattern existant : reprend le style de `AgentFilter.tsx` (boutons inline avec "Tous" + liste des membres triés).

