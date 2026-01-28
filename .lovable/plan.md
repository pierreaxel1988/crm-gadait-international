
# Refonte du template email - Design Minimaliste Noir/Blanc/Gris

## Objectif
Transformer le design actuel de l'email de sélection de propriétés vers un style épuré et élégant inspiré de ChatGPT et Apple - palette noir/blanc/gris uniquement.

## Problème actuel
L'email utilise actuellement :
- Fond gradient violet/bleu (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
- Boutons colorés (vert pour appel, violet pour email)
- Bouton WhatsApp vert (#25D366)
- Ombres colorées (`rgba(72, 187, 120, 0.3)`, `rgba(102, 126, 234, 0.3)`)

## Nouveau design proposé

### Palette de couleurs
| Élément | Couleur actuelle | Nouvelle couleur |
|---------|-----------------|------------------|
| Fond principal | Gradient violet | Blanc pur `#FFFFFF` |
| Fond secondaire | Gradient gris clair | Gris très clair `#F9FAFB` |
| Texte principal | `#1a202c` | Noir `#111827` |
| Texte secondaire | `#4a5568` | Gris `#6B7280` |
| Boutons principaux | Gradient violet/vert | Noir `#111827` |
| Bordures | `#e2e8f0` | Gris clair `#E5E7EB` |
| Bouton WhatsApp | Vert WhatsApp | Gris foncé `#374151` |

### Modifications visuelles

#### 1. En-tête et structure globale
- Fond blanc pur sans gradient
- Logo GADAIT centré sur fond blanc
- Séparateur subtil gris clair

#### 2. Cartes de propriétés
- Bordures grises fines (`#E5E7EB`)
- Ombres légères neutres (`rgba(0,0,0,0.05)`)
- Badges avec fond gris très clair
- Prix sur fond blanc avec bordure grise

#### 3. Boutons CTA
- **"Voir sur GADAIT"** : Fond noir `#111827`, texte blanc
- **"Discuter sur WhatsApp"** : Fond gris foncé `#374151`, texte blanc
- Effet hover avec opacité légère

#### 4. Section "Prêt pour la suite"
- Fond gris très clair `#F9FAFB`
- Bordure grise subtile
- Boutons d'action en noir/gris

#### 5. Pied de page
- Texte gris moyen
- Séparateur fin gris

## Fichier à modifier
`supabase/functions/send-property-selection/index.ts`

### Détails techniques des changements

**Container principal (lignes 565-570)**
```typescript
// Avant
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Après  
background: #FFFFFF;
```

**Fond body (ligne 591)**
```typescript
// Avant
background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);

// Après
background: #F9FAFB;
```

**Boutons CTA propriétés (lignes 497-536)**
```typescript
// Bouton "Voir sur GADAIT" - Avant
background: white; color: #1e293b;

// Après
background: #111827; color: white;

// Bouton WhatsApp - Avant
background: #25D366;

// Après
background: #374151;
```

**Section "Prêt pour la suite" (lignes 622-678)**
```typescript
// Boutons - Avant
background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Après
background: #111827; // pour les deux boutons
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```

## Résultat attendu
Un email élégant et professionnel avec :
- Apparence premium et minimaliste
- Meilleure lisibilité
- Cohérence avec les codes visuels Apple/ChatGPT
- Focus sur le contenu (les propriétés)
