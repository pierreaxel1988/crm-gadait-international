/**
 * Utility functions for handling property slugs and SEO-friendly URLs
 */

/**
 * Generates a SEO-friendly slug from a title
 */
export const generateSlug = (title: string): string => {
  if (!title) return '';
  
  let slug = title.toLowerCase();
  
  // Replace accents and special characters
  const accentMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
    'ç': 'c',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ñ': 'n',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y'
  };
  
  // Replace accented characters
  slug = slug.replace(/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/g, (match) => accentMap[match] || match);
  
  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Limit length to 100 characters
  slug = slug.substring(0, 100);
  
  // Remove trailing hyphen if we cut off mid-word
  slug = slug.replace(/-+$/, '');
  
  return slug;
};

/**
 * Extracts property identifier from URL params (slug or ID)
 */
export const getPropertyIdentifier = (params: { slug?: string; id?: string }) => {
  return params.slug || params.id;
};

/**
 * Checks if a string is a valid UUID (for backwards compatibility with old ID-based URLs)
 */
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Generates property URL using slug if available, otherwise falls back to ID
 */
export const getPropertyUrl = (property: { id: string; slug?: string }, options?: { returnTo?: string; leadId?: string }) => {
  const propertyPath = property.slug || `id/${property.id}`;
  
  const searchParams = new URLSearchParams();
  if (options?.returnTo) {
    searchParams.set('returnTo', options.returnTo);
  }
  if (options?.leadId) {
    searchParams.set('leadId', options.leadId);
  }
  
  const queryString = searchParams.toString();
  return `/properties/${propertyPath}${queryString ? `?${queryString}` : ''}`;
};