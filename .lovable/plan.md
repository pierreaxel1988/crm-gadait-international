

## Améliorations prioritaires pour "Ma Journée"

Après analyse du code actuel, voici les problèmes et manques les plus impactants :

---

### 1. Bug : détection d'inactivité cassée (critique)

Actuellement ligne 150, l'inactivité est calculée sur `created_at` au lieu de la dernière activité réelle. Un lead créé il y a 2 mois mais contacté hier apparaît comme inactif. Il faut utiliser la date de la dernière action complétée (ou `created_at` en fallback).

**Fichier** : `src/pages/MyDay.tsx` — modifier le calcul `lastUpdate` pour parcourir `action_history` et prendre le `completedDate` le plus récent.

---

### 2. Section "Actions à venir (7 jours)" 

Les agents ne voient que le jour J et le retard. Ajouter une carte "Cette semaine" avec les actions planifiées dans les 7 prochains jours, groupées par jour. Permet d'anticiper la charge.

**Fichier** : `src/pages/MyDay.tsx` — nouveau state `upcomingActions`, filtrer les actions avec `scheduledDate` entre demain et J+7, nouvelle carte avec regroupement par jour.

---

### 3. Leads non assignés (admin only)

Un admin ne voit pas les leads orphelins (sans `assigned_to`). Ajouter une carte "Leads non assignés" visible uniquement par les admins.

**Fichier** : `src/pages/MyDay.tsx` — requête supplémentaire `assigned_to IS NULL`, nouveau state `unassignedLeads`, carte conditionnelle `isAdmin`.

---

### 4. Nombre total de leads actifs dans le portfolio

Ajouter un StatCard "Portfolio" affichant le nombre total de leads actifs. Donne un repère de charge de travail.

**Fichier** : `src/pages/MyDay.tsx` — compter `leads.length` et l'afficher dans un StatCard supplémentaire.

---

### 5. Marquer une action comme faite depuis le dashboard

Actuellement il faut naviguer vers la fiche lead. Ajouter un bouton check sur chaque `ActionRow` pour marquer l'action complète directement, avec mise à jour optimiste.

**Fichier** : `src/pages/MyDay.tsx` — ajouter un bouton `CheckCircle` sur `ActionRow`, appeler `addActionToLead` pour mettre à jour le `completedDate`, puis rafraîchir les données localement.

---

### Résumé des changements

Tout dans `src/pages/MyDay.tsx` :
- Corriger le calcul d'inactivité (bug)
- Ajouter state + carte "Actions à venir (7j)"
- Ajouter state + carte "Leads non assignés" (admin)
- Ajouter StatCard "Portfolio" (total leads actifs)
- Ajouter bouton check sur ActionRow pour complétion rapide

Grille stats : 6 colonnes desktop (ou 2 rangées de 3). Grille cards : 3 colonnes desktop pour les plus importantes.

