

# Option A : Dialog de saisie de deal au changement de statut

## Principe
Quand un commercial change le statut d'un lead vers **Deposit**, **Signed** ou **Gagné**, un dialog s'ouvre automatiquement pour saisir le prix de vente et le % de commission. Un deal est alors créé/mis à jour dans la table `deals`.

## Composants impactés

### 1. Nouveau composant `DealDialog`
Créer `src/components/leads/form/DealDialog.tsx` :
- Dialog avec champs : Prix de vente, % Commission, Commission calculée (lecture seule), Notes
- Calcul auto : `commission_amount = sale_price * commission_percentage / 100`
- À la validation : upsert dans la table `deals` (si un deal existe déjà pour ce lead, on le met à jour)
- Bouton "Passer" pour permettre de fermer sans saisir (le statut change quand même)
- Props : `leadId`, `leadName`, `leadSource`, `pipelineType`, `assignedTo`, `status`, `open`, `onClose`

### 2. Modification des 3 StatusSection
Intercepter le changement de statut dans les 3 fichiers :
- `src/components/leads/form/StatusSection.tsx` (desktop)
- `src/components/leads/form/mobile/StatusSection.tsx` (mobile)
- `src/components/leads/form/mobile/components/OwnerStatusSection.tsx` (owners mobile)

Logique ajoutée :
- Quand `onValueChange` du Select de statut reçoit `'Deposit'`, `'Signed'` ou `'Gagné'` → ouvrir le `DealDialog`
- Le statut est appliqué immédiatement, le dialog est un complément
- Importer et rendre `<DealDialog />` dans chaque composant

### 3. Aucune migration SQL nécessaire
La table `deals` existe déjà avec tous les champs requis.

## Flux utilisateur
1. Commercial ouvre la fiche lead
2. Change le statut vers "Dépôt reçu" / "Signature finale" / "Conclus"
3. Le statut est sauvegardé normalement
4. Un dialog apparaît : "Félicitations ! Renseignez les détails du deal"
5. Le commercial saisit prix + % commission → commission calculée automatiquement
6. Clic "Enregistrer" → upsert dans `deals`
7. Ou clic "Passer" → le dialog se ferme, le deal pourra être saisi plus tard dans l'admin

