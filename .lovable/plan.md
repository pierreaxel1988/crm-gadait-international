

## Synchroniser le filtre agent global sur la page Chiffre d'Affaire

### Constat

- **Actions** : utilise déjà `useSelectedAgent` — le filtre pipeline se propage automatiquement.
- **Calendrier** : utilise déjà `useSelectedAgent` — le filtre pipeline se propage automatiquement.
- **Chiffre d'Affaire** (`AgentRevenue.tsx`) : utilise son propre state local (`selectedAgentId`), déconnecté du hook global. C'est le seul onglet qui ne réagit pas au filtre agent sélectionné dans Pipeline.

### Changement unique : `src/pages/AgentRevenue.tsx`

1. Importer `useSelectedAgent` et l'utiliser à la place du state local `selectedAgentId` / `selectedAgentName`.
2. Remplacer `selectedAgentId` par `selectedAgent` du hook global.
3. Calculer `selectedAgentName` à partir de `GUARANTEED_TEAM_MEMBERS` au lieu d'un state séparé.
4. Mettre à jour les boutons du filtre agent admin pour appeler `handleAgentChange` du hook global au lieu de `setSelectedAgentId`.
5. Le `useEffect` de fetch utilise `selectedAgent` au lieu de `selectedAgentId`.

Résultat : sélectionner un agent dans Pipeline pré-filtre immédiatement Actions, Calendrier et Chiffre d'Affaire.

