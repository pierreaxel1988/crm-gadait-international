

## Synchroniser le filtre agent global sur MyDay

### Constat

Le hook `useSelectedAgent` synchronise déjà le filtre agent via `localStorage` + événements custom entre :
- ✅ Pipeline
- ✅ Actions  
- ✅ Calendrier  
- ✅ Chiffre d'Affaire  
- ❌ **Ma Journée** — utilise un state local `selectedAgentId` / `setSelectedAgentId`, déconnecté du hook global

### Changement unique : `src/pages/MyDay.tsx`

1. Importer `useSelectedAgent` depuis `@/hooks/useSelectedAgent`
2. Remplacer le state local `selectedAgentId` / `setSelectedAgentId` par `selectedAgent` / `handleAgentChange` du hook
3. Dériver `selectedAgentName` depuis `selectedAgent` au lieu de `selectedAgentId`
4. Mettre à jour toutes les références : `fetchData`, boutons filtre admin, greeting
5. Supprimer le `useState<string | null>(null)` devenu inutile

Résultat : sélectionner un agent dans n'importe quel onglet (Pipeline, Actions, etc.) pré-filtre automatiquement Ma Journée, et inversement.

