

## Modification : Combiner Email + Téléphone dans une seule colonne "Contact"

Remplacer la colonne "Email" par une colonne **"Contact"** qui affiche l'email et le téléphone empilés verticalement en petite taille, pour gagner de l'espace et avoir les deux informations visibles.

### Changements dans `src/components/admin/HotPipelineMonitor.tsx`

1. **En-tête** : Renommer `<TableHead>Email</TableHead>` → `<TableHead>Contact</TableHead>`
2. **Cellule** : Remplacer l'affichage simple de l'email par un bloc empilé :
   - Email en `text-xs`
   - Téléphone en `text-xs` en dessous
   - Les deux cliquables (mailto / tel)

