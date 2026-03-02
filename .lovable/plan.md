

# Fix : "il y a -31j" — dates futures dans le Pipeline Chaud

## Problème
Dans `analyzeActionHistory()`, la date retenue est `completedDate || scheduledDate || createdAt`. Quand une action est planifiée dans le futur sans `completedDate`, la `scheduledDate` future est utilisée, ce qui donne un `differenceInDays` négatif → "il y a -31j".

## Correction dans `src/components/admin/HotPipelineMonitor.tsx`

### 1. Filtrer les dates futures dans `analyzeActionHistory()`
- Ne retenir que les dates **passées ou aujourd'hui** (`d <= now`) lors de la recherche de la dernière action
- Passer `now` en paramètre de la fonction

### 2. Affichage défensif
- Ajouter un garde dans le rendu : si `daysSinceLastAction` est négatif, afficher "Planifié" ou la date prévue au lieu de "il y a -Xj"

Cela corrige aussi la détection "dormant" qui ne doit se baser que sur des actions réellement effectuées, pas sur des actions futures planifiées.

