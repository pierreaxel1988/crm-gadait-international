

# Ajouter un accès "Pipeline Chaud" dans le menu utilisateur

## Constat
Le screenshot montre le menu déroulant utilisateur (icône profil en haut à droite). L'utilisateur veut un accès direct au tableau de bord "Pipeline Chaud" depuis ce menu.

## Modification

### Fichier : `src/components/layout/navbar/UserMenu.tsx`
- Ajouter un nouveau `DropdownMenuItem` avec l'icône `Flame` (lucide-react) et le label **"🔥 Pipeline Chaud"**
- Au clic, naviguer vers `/admin?tab=hot-pipeline`
- Placer cet item en première position dans le menu (avant "Analytics des leads")
- Visible uniquement pour les admins (`isAdmin`), comme les autres items admin

