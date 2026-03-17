

## Correction : exclure les leads supprimés dans Ma Journée

### Problème
La requête Supabase dans `src/pages/MyDay.tsx` (`fetchData`) ne filtre pas `deleted_at IS NULL`, contrairement au pipeline. Résultat : les leads soft-deleted sont comptabilisés dans toutes les sections (nouveaux, en retard, sans tag, etc.).

### Changement unique dans `src/pages/MyDay.tsx`

Ajouter `.is('deleted_at', null)` à la requête Supabase existante (ligne ~77, juste après le filtre sur le status) :

```typescript
query = query.not('status', 'in', '("Gagné","Perdu")');
query = query.is('deleted_at', null);  // ← ajouter cette ligne
```

Cela corrigera les compteurs de **toutes** les sections (nouveaux leads, actions en retard, sans tag, inactifs, sans action) d'un coup puisqu'elles utilisent toutes le même dataset `leads`.

