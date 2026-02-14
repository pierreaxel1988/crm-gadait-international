
# Ajout du bouton "Mot de passe oublié" sur la page de connexion

## Fonctionnalité
Ajouter un lien "Mot de passe oublié ?" sur la page de connexion qui permet à l'utilisateur de saisir son email et de recevoir un lien de réinitialisation via Supabase.

## Comportement
1. Un lien "Mot de passe oublié ?" apparait sous le champ mot de passe
2. Au clic, le formulaire bascule en mode "reset" : seul le champ email est affiché avec un bouton "Envoyer le lien de réinitialisation"
3. Appel à `supabase.auth.resetPasswordForEmail()` avec `redirectTo` vers `/auth`
4. Un toast de confirmation s'affiche pour informer l'utilisateur de vérifier ses emails
5. Un lien "Retour à la connexion" permet de revenir au formulaire classique

## Détails techniques

### Fichier modifié : `src/pages/Auth.tsx`

- Ajouter un state `isForgotPassword` (boolean)
- Quand `isForgotPassword` est true :
  - Masquer le champ mot de passe
  - Changer le titre en "Réinitialiser le mot de passe"
  - Changer la description en "Entrez votre email pour recevoir un lien de réinitialisation"
  - Le bouton submit appelle `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth' })`
  - Masquer les boutons Google et création de compte
  - Afficher un lien "Retour à la connexion" qui remet `isForgotPassword` à false
- Ajouter un lien "Mot de passe oublié ?" sous le champ mot de passe (visible uniquement en mode connexion, pas en mode inscription)
