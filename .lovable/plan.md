

## Ajouter une section "Nouveaux leads à contacter" dans Ma Journée

### Objectif
Afficher en haut du dashboard une carte dédiée aux leads avec le statut "New" assignés à l'agent (ou filtrés par agent pour les admins), avec un CTA pour aller directement sur la fiche du lead.

### Changements dans `src/pages/MyDay.tsx`

1. **Nouveau state** : `newLeads: AlertLead[]`
2. **Dans `fetchData`** : ajouter un filtre `status = 'New'` sur les leads récupérés pour peupler cette liste (ou filtrer côté client les leads déjà fetchés qui ont `status === 'New'`)
3. **Nouvelle StatCard** : icône Bell, label "Nouveaux", count des new leads, variante "red"
4. **Nouvelle Card** en première position dans la grille : "Nouveaux leads à contacter" avec icône Bell rouge, listant les leads New avec bouton pour naviguer vers `/leads/{id}?tab=actions`
5. **Grille stats** : passer de 4 à 5 colonnes desktop (ou garder 4 et ajouter la 5e en dessous sur mobile)

### Détail technique
- Le filtre existant exclut déjà "Gagné"/"Perdu", donc les leads "New" sont déjà dans le dataset `leads`. Il suffit de filtrer `leads.filter(l => l.status === 'New')` dans la boucle `forEach` existante pour peupler `newLeads`.
- La carte affichera le nom du lead et la date de création formatée.
- Sur mobile : grille stats reste 2 colonnes, grille cards reste 1 colonne.

