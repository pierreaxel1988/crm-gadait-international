

## Améliorations possibles pour le système de deals

Le système actuel couvre bien le flux principal. Voici quelques ajouts utiles à considérer :

### 1. Synchronisation du statut du deal avec le statut du lead
Actuellement, quand un commercial change le statut d'un lead de "Deposit" vers "Signed" puis "Gagné", le deal garde le statut initial. On pourrait **mettre à jour automatiquement le `status` du deal** quand le lead change de statut entre les 3 paliers (deposit → signed → won).

**Fichiers impactés** : `StatusSection.tsx` (desktop + mobile + owners) — dans `handleStatusChange`, si un deal existe déjà, on update aussi son `status`.

### 2. Résumé du deal visible sur la fiche lead (lecture seule)
Afficher un petit encart récapitulatif sous le bouton "Modifier le deal" :
- Prix de vente : 1 500 000 €
- Commission : 5% → 75 000 €

Ça évite de rouvrir le dialog juste pour vérifier les montants.

**Fichiers impactés** : les 3 `StatusSection` — afficher `dealData` quand `hasDeal === true`.

### 3. Rien d'autre de critique
Le reste (filtres par devise dans le RevenueTracker admin, export CSV avec devise, etc.) sont des améliorations secondaires qui peuvent attendre.

---

**Recommandation** : implémenter les points 1 et 2 ensemble — la synchro du statut du deal + le résumé visible. Ce sont des améliorations rapides et très utiles au quotidien pour les commerciaux.

Voulez-vous que j'implémente ces deux points ?

