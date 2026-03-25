

## Synchroniser le filtre agent global sur Pipeline Chaud

### Constat

`AgentHotPipeline.tsx` récupère l'ID agent uniquement via l'email de l'utilisateur connecté et le passe en prop `agentId` à `HotPipelineMonitor`. Il n'utilise pas `useSelectedAgent`, donc la sélection d'agent faite dans Pipeline/Actions/Calendrier ne se propage pas.

### Changement : `src/pages/AgentHotPipeline.tsx`

1. Importer `useSelectedAgent` et `useAuth` (pour `isAdmin`)
2. Pour les **admins** : utiliser `selectedAgent` du hook global comme `agentId` passé à `HotPipelineMonitor` (si un agent est sélectionné), sinon ne pas filtrer (passer `undefined`)
3. Pour les **agents classiques** : conserver le comportement actuel (filtrer sur leur propre `teamMemberId`)
4. Ajouter les boutons de sélection d'agent (comme sur les autres onglets) pour les admins, liés à `handleAgentChange`

Résultat : sélectionner un agent dans Pipeline pré-filtre automatiquement Pipeline Chaud, et inversement.

