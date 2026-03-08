

## Plan : Bouton retour intelligent vers Pipeline Chaud

### Problème
Actuellement, `navigate(-1)` est utilisé dans les pages de détail lead. Cela fonctionne avec l'historique du navigateur, donc le retour vers Pipeline Chaud devrait déjà fonctionner si l'utilisateur vient de `/hot-pipeline`. 

Cependant, `navigate(-1)` peut être imprévisible (si l'utilisateur a navigué entre plusieurs onglets dans la fiche). Une approche plus fiable : passer un paramètre `from` dans l'URL lors de la navigation depuis le Pipeline Chaud, et utiliser ce paramètre pour le bouton retour.

### Approche

#### 1. Modifier `HotPipelineMonitor.tsx`
- Les liens vers les fiches leads incluront `?from=hot-pipeline` dans l'URL (ex: `/leads/123?from=hot-pipeline`)

#### 2. Modifier `LeadDetailDesktop.tsx`
- Lire le paramètre `from` depuis `searchParams`
- Si `from === 'hot-pipeline'`, le bouton retour navigue vers `/hot-pipeline` au lieu de `navigate(-1)`
- Afficher "Retour au Pipeline Chaud" comme texte

#### 3. Modifier `LeadDetailMobile.tsx`
- Même logique avec le paramètre `from`

### Fichiers à modifier
| Fichier | Action |
|---------|--------|
| `src/components/admin/HotPipelineMonitor.tsx` | Ajouter `?from=hot-pipeline` aux liens |
| `src/pages/LeadDetailDesktop.tsx` | Retour conditionnel vers `/hot-pipeline` |
| `src/pages/LeadDetailMobile.tsx` | Retour conditionnel vers `/hot-pipeline` |

