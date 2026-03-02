

# Amélioration : Distinguer "Dormant" vs "Dormant avec action prévue"

## Problème
Un lead avec une action planifiée dans les prochains jours est quand même affiché en rouge "Dormant", ce qui est alarmant alors que l'agent a déjà programmé un suivi.

## Solution dans `src/components/admin/HotPipelineMonitor.tsx`

### 1. Ajouter un état intermédiaire
- Nouveau booléen `hasUpcomingAction` dans `AnalyzedLead` : `true` si `nextActionDate` existe et est dans les 7 prochains jours
- Nouveau statut visuel : **"Dormant (action prévue)"** en orange au lieu de rouge

### 2. Modifier l'affichage conditionnel
- Lead dormant **sans** action prévue → rouge (`bg-red-50`) + "🔴 Dormant"
- Lead dormant **avec** action prévue prochainement → orange clair (`bg-amber-50`) + "⏳ Action prévue" 
- Lead sans action → orange comme actuellement

### 3. Mettre à jour les compteurs des summary cards
- Séparer le compteur dormant en deux : "dormants critiques" (sans action prévue) vs "dormants suivis" (action prévue)

Cela permet au manager de se concentrer sur les vrais problèmes sans être noyé par de faux positifs.

