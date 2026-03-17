

## Améliorations impactantes pour "Ma Journée" — immobilier de luxe

Après analyse du code actuel, voici 4 améliorations à fort impact pour le pilotage d'activité immobilière de luxe :

---

### 1. Leads VIP / Hot en priorité

**Problème** : Tous les leads sont affichés à plat, sans distinction de valeur. Un lead VIP avec un budget de 5M€ est traité comme un lead standard.

**Solution** : Ajouter une carte **"Leads prioritaires"** qui remonte les leads tagués VIP, Hot, ou avec un budget élevé (>1M€). Afficher un badge visuel (🔥 ou étoile dorée) sur les ActionRow et LeadRow concernés.

**Changements** :
- `fetchData` : récupérer `budget, pipeline_type, tags` (déjà `tags` est fetch). Filtrer les leads avec tag "VIP" ou "Hot" et les remonter dans un nouveau state `vipLeads`.
- Nouveau state `vipLeads: AlertLead[]` avec le budget affiché dans `reason`.
- Nouvelle carte en position haute dans la grille.

---

### 2. Répartition par pipeline (Achat / Location / Propriétaires)

**Problème** : Aucune visibilité sur la répartition du portefeuille par type de transaction. En luxe, c'est essentiel de savoir combien de mandats propriétaires vs acheteurs on gère.

**Solution** : Ajouter une ligne de mini-stats sous les StatCards existantes montrant la répartition : X achat / Y location / Z propriétaires.

**Changements** :
- `fetchData` : récupérer `pipeline_type` dans la requête select.
- Compter par pipeline_type dans le forEach.
- 3 petits badges/chips sous la grille de stats existante.

---

### 3. Taux de conversion rapide (admin)

**Problème** : Un admin ne voit pas la performance globale. Combien de leads "Gagné" ce mois vs total ?

**Solution** : Pour les admins, afficher un StatCard "Conversions ce mois" avec le nombre de leads passés en "Gagné" sur les 30 derniers jours. Nécessite une requête séparée car les leads "Gagné" sont exclus du dataset actuel.

**Changements** :
- `fetchData` (admin only) : requête supplémentaire `status = 'Gagné' AND updated_at > 30 jours`.
- Nouveau state `monthlyWins: number`.
- StatCard supplémentaire avec icône Trophy, visible admin only.

---

### 4. Leads sans suivi email (relance nécessaire)

**Problème** : Pas de visibilité sur les leads qu'on n'a jamais contacté par email. Dans le luxe, le premier contact email est crucial.

**Solution** : Carte "Sans email envoyé" listant les leads actifs dont `email_envoye` est false/null et qui ont été créés il y a plus de 2 jours.

**Changements** :
- `fetchData` : récupérer `email_envoye` dans le select.
- Filtrer les leads avec `!email_envoye && created_at < 2 jours`.
- Nouveau state `noEmailLeads: AlertLead[]`, nouvelle carte.

---

### Résumé des fichiers impactés

Tout dans **`src/pages/MyDay.tsx`** :
- Select étendu : ajouter `budget, pipeline_type, email_envoye`
- 4 nouveaux states : `vipLeads`, pipeline counters, `monthlyWins`, `noEmailLeads`
- 1 requête supplémentaire (conversions admin)
- 3 nouvelles cartes + 1 ligne de répartition pipeline
- Mise à jour de la grille stats (ajouter 1-2 StatCards)

Composants `StatCard`, `LeadRow`, `ActionRow` : inchangés (réutilisés tels quels).

