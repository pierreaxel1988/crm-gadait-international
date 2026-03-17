

## Supprimer la carte "Sans email envoyé"

Retirer la section non fiable de Ma Journée : le state `noEmailLeads`, le StatCard associé, la carte, et la référence à `email_envoye` dans la requête et le handler.

### Changements dans `src/pages/MyDay.tsx`
- Supprimer le state `noEmailLeads`
- Retirer `email_envoye` du select Supabase
- Retirer `email_envoye: false` du update dans `handleCompleteAction`
- Supprimer le StatCard "Sans email"
- Supprimer la carte "Sans email envoyé"
- Supprimer le filtre `noEmail` dans le forEach
- Retirer l'import `Mail` de lucide-react

