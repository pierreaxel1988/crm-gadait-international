# Synchronisation DatoCMS - Documentation

## Vue d'ensemble

La synchronisation DatoCMS permet d'importer automatiquement les propriétés depuis le CMS DatoCMS vers la base de données Supabase `gadait_properties`. Cette synchronisation s'exécute toutes les 6 heures via un cron job.

## Architecture

### Edge Function
- **Fichier**: `supabase/functions/sync-datocms-properties/index.ts`
- **URL**: `https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/sync-datocms-properties`
- **Méthode**: POST

### Cron Job
- **Fréquence**: Toutes les 6 heures
- **Configuration**: Table `cron.job` dans Supabase

## Structure des Champs Multilingues DatoCMS

DatoCMS retourne les champs multilingues sous forme d'objets avec les clés `en` et `fr`:

```typescript
{
  "title": {
    "en": "Luxury Villa in Mauritius",
    "fr": "Villa de Luxe à Maurice"
  },
  "description": {
    "en": "Beautiful villa description...",
    "fr": "Description de villa magnifique..."
  },
  "slug": {
    "en": "luxury-villa-in-mauritius",
    "fr": "villa-de-luxe-a-maurice"
  }
}
```

## Mapping GraphQL → Supabase

### Requête GraphQL

```graphql
query GetProperties($offset: IntType!, $limit: IntType!) {
  allProperties(first: $limit, skip: $offset) {
    id
    title        # Objet { en: string, fr: string }
    description  # Objet { en: string, fr: string }
    slug         # Objet { en: string, fr: string }
    reference
    price
    currency { code }
    surface
    bedrooms
    bathrooms
    gallery { path }  # ⚠️ path, pas url
    city {
      name
      country { name }
    }
    # ... autres champs
  }
}
```

### Extraction des Données

```typescript
// Champs multilingues
const titleEn = datoCmsProp.title?.en || '';
const titleFr = datoCmsProp.title?.fr || '';
const descriptionEn = datoCmsProp.description?.en || '';
const descriptionFr = datoCmsProp.description?.fr || '';
const slugEn = datoCmsProp.slug?.en || null;
const slugFr = datoCmsProp.slug?.fr || null;

// Images - Construction de l'URL complète
const DATOCMS_CDN = 'https://www.datocms-assets.com';
const images = datoCmsProp.gallery?.map((img: any) => 
  img.path ? `${DATOCMS_CDN}${img.path}` : ''
).filter(Boolean) || [];
```

### Table Supabase `gadait_properties`

| Colonne DatoCMS | Type | Colonne Supabase | Notes |
|-----------------|------|------------------|-------|
| `id` | string | `external_id` | Peut être une référence ou `datocms-{id}` |
| `title.en` | string | `title_en` | Titre en anglais |
| `title.fr` | string | `title_fr` | Titre en français |
| `description.en` | text | `description_en` | Description en anglais |
| `description.fr` | text | `description_fr` | Description en français |
| `slug.en` | string | `slug_en` | Slug URL en anglais |
| `slug.fr` | string | `slug_fr` | Slug URL en français |
| `title.fr \|\| title.en` | string | `title` | Fallback (FR prioritaire) |
| `slug.fr \|\| slug.en` | string | `slug` | Fallback (FR prioritaire) |
| `gallery[0].path` | string | `main_image` | URL complète avec CDN |
| `gallery[].path` | array | `images` | Array d'URLs complètes |
| `price` | number | `price` | null si `hidePrice = true` |
| `currency.code` | string | `currency` | EUR, USD, MUR, etc. |
| `surface` | number | `area` | Surface en m² |
| `bedrooms` | number | `bedrooms` | Nombre de chambres |
| `bathrooms` | number | `bathrooms` | Nombre de salles de bain |
| `city.name` | string | `location` | Ville + adresse |
| `city.country.name` | string | `country` | Pays (logique intelligente) |
| `amenities[].name` | array | `features` | Équipements |
| `propertyStatus.name` | string | `is_available` | false si "Sold" ou "Rented" |

## URL des Images

⚠️ **Important**: DatoCMS retourne les images avec un champ `path`, pas `url`.

- **Champ GraphQL**: `gallery { path }`
- **Format path**: `/33658/1760723160-s3_standard_d5ea1f22fc263fcc582241b469e0579ef855ed9a.jpg`
- **CDN DatoCMS**: `https://www.datocms-assets.com`
- **URL complète**: `https://www.datocms-assets.com/33658/1760723160-s3_standard_d5ea1f22fc263fcc582241b469e0579ef855ed9a.jpg`

## Logique de Synchronisation

### 1. Pagination
- Récupération par batch de 100 propriétés
- Itération jusqu'à épuisement des données

### 2. Filtrage
- Exclusion des propriétés avec `websiteHide = true`

### 3. Détermination de l'`external_id`
```typescript
if (datoCmsProp.reference && datoCmsProp.reference.trim() !== '') {
  external_id = datoCmsProp.reference.trim(); // Ex: "GI4929-D"
} else {
  external_id = `datocms-${datoCmsProp.id}`; // Ex: "datocms-123456"
}
```

### 4. Nettoyage des Doublons
Suppression des propriétés avec `external_id` auto-généré (`datocms-*`) si une propriété avec une vraie référence et le même titre existe.

### 5. Mise à Jour
- **Condition**: `updated_at` plus récent OU `slug` manquant OU `forceUpdate = true`
- **Traitement**: Batch de 50 propriétés pour éviter les timeouts

## Génération Automatique des Slugs

Si DatoCMS ne fournit pas de slug, génération automatique:

```typescript
function generateSlug(title: string): string | null {
  if (!title) return null;
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer les caractères spéciaux par -
    .replace(/^-+|-+$/g, '');        // Retirer les - au début/fin
}
```

## Détermination du Pays

Logique intelligente via `cityToCountryUtils.ts`:
1. Utiliser le pays fourni par DatoCMS (`city.country.name`)
2. Si absent, déduire depuis le nom de la ville
3. Si absent, analyser le titre de la propriété
4. Sinon, retourner "Non spécifié"

## Utilisation

### Déclenchement Manuel

Via la console du navigateur:
```javascript
window.testDatoCmsSync()
```

Ou via HTTP:
```bash
curl -X POST https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/sync-datocms-properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Vérification des Logs

1. [Edge Function Logs](https://supabase.com/dashboard/project/hxqoqkfnhbpwzkjgukrc/functions/sync-datocms-properties/logs)
2. Console navigateur après `window.testDatoCmsSync()`

### Vérification de la Base de Données

```sql
-- Vérifier les champs multilingues
SELECT 
  external_id,
  title_en,
  title_translations,
  slug_en,
  slug_fr,
  main_image,
  status
FROM properties_backoffice
WHERE title_en IS NOT NULL 
  AND title_translations IS NOT NULL
  AND status = 'published'
LIMIT 10;

-- Compter les propriétés avec images
SELECT 
  COUNT(*) as total,
  COUNT(main_image) as with_image,
  COUNT(NULLIF(main_image, '')) as with_valid_image
FROM properties_backoffice
WHERE status = 'published';
```

## Filtrage Côté Frontend

Le composant `PropertiesTabContent.tsx` filtre les propriétés affichées:

```typescript
const isPropertyQualityValid = (property: GadaitProperty): boolean => {
  const hasValidTitle = property.title && 
    property.title.trim() !== '' && 
    property.title !== 'Propriété sans titre';
  
  return hasValidTitle;
};
```

## Dépannage

### Problème: Aucune propriété affichée

1. Vérifier les logs de l'edge function
2. Vérifier que `title_en` et `title_fr` sont remplis
3. Vérifier que `main_image` contient des URLs valides avec le CDN
4. Vérifier le filtre `isPropertyQualityValid`

### Problème: Images manquantes

Vérifier que les URLs sont construites avec le CDN:
```typescript
const DATOCMS_CDN = 'https://www.datocms-assets.com';
const fullUrl = `${DATOCMS_CDN}${img.path}`;
```

### Problème: Slugs manquants

1. Vérifier que DatoCMS retourne bien les slugs multilingues
2. Vérifier la génération automatique si slugs absents
3. Forcer une synchronisation complète

## Secrets Supabase Requis

- `DATOCMS_API_TOKEN`: Token d'API DatoCMS avec accès en lecture
- `SUPABASE_URL`: URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role pour écriture en base

## Performances

- **Temps moyen**: ~2-3 minutes pour 871 propriétés
- **Batch size**: 50 propriétés par batch
- **Rate limiting**: Respecté via les batches
- **Timeout**: Aucun grâce au traitement par batch

## Changelog

### 2025-11-11
- ✅ Correction extraction champs multilingues (objets `{en, fr}` au lieu de `_allTitleLocales`)
- ✅ Correction URLs images (`path` + CDN au lieu de `url`)
- ✅ Simplification requête GraphQL
- ✅ Amélioration logs de diagnostic
