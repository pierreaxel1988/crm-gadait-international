
// Language translations for the public criteria form
export const translations = {
  fr: {
    headerTitle: "CRITÈRES DE LA PROPRIÉTÉ",
    headerSubtitle: "merci de remplir vos critères de recherche pour que nous puissions vous proposer les meilleures propriétés.",
    greeting: "Bonjour",
    countryLabel: "Pays recherché",
    selectCountry: "Sélectionner un pays",
    searchCountry: "Rechercher un pays...",
    noResults: "Aucun résultat",
    saveButton: "Enregistrer mes critères",
    saving: "Enregistrement...",
    thankYou: "Merci !",
    successMessage: "Vos critères de recherche ont été enregistrés avec succès. Notre équipe va maintenant pouvoir vous proposer des propriétés correspondant parfaitement à vos attentes.",
    contactSoon: "Nous vous contacterons très prochainement avec une sélection personnalisée.",
    loading: "Chargement...",
    savedTitle: "Critères enregistrés",
    savedDescription: "Vos critères de recherche ont été enregistrés avec succès.",
    errorTitle: "Erreur",
    invalidLink: "Ce lien n'est pas valide ou a expiré.",
    loadError: "Impossible de charger le formulaire.",
    saveError: "Une erreur est survenue lors de l'enregistrement."
  },
  en: {
    headerTitle: "PROPERTY CRITERIA",
    headerSubtitle: "please fill in your search criteria so we can offer you the best properties.",
    greeting: "Hello",
    countryLabel: "Desired country",
    selectCountry: "Select a country",
    searchCountry: "Search for a country...",
    noResults: "No results",
    saveButton: "Save my criteria",
    saving: "Saving...",
    thankYou: "Thank you!",
    successMessage: "Your search criteria have been successfully saved. Our team can now offer you properties that perfectly match your expectations.",
    contactSoon: "We will contact you very soon with a personalized selection.",
    loading: "Loading...",
    savedTitle: "Criteria saved",
    savedDescription: "Your search criteria have been successfully saved.",
    errorTitle: "Error",
    invalidLink: "This link is invalid or has expired.",
    loadError: "Unable to load the form.",
    saveError: "An error occurred while saving."
  }
};

export const detectLanguageFromData = (leadData: any): 'fr' | 'en' => {
  // Check preferred language
  if (leadData?.preferred_language) {
    const lang = leadData.preferred_language.toLowerCase();
    if (lang.includes('en') || lang.includes('english')) return 'en';
    if (lang.includes('fr') || lang.includes('french') || lang.includes('français')) return 'fr';
  }
  
  // Check nationality
  if (leadData?.nationality) {
    const nationality = leadData.nationality.toLowerCase();
    const englishSpeakingCountries = [
      'united states', 'usa', 'united kingdom', 'uk', 'canada', 'australia', 
      'new zealand', 'ireland', 'south africa', 'american', 'british', 
      'canadian', 'australian', 'anglais', 'américain', 'britannique'
    ];
    
    if (englishSpeakingCountries.some(country => nationality.includes(country))) {
      return 'en';
    }
  }
  
  // Check country
  if (leadData?.country) {
    const country = leadData.country.toLowerCase();
    const englishSpeakingCountries = [
      'united states', 'united kingdom', 'canada', 'australia', 
      'new zealand', 'ireland', 'south africa'
    ];
    
    if (englishSpeakingCountries.some(c => country.includes(c))) {
      return 'en';
    }
  }
  
  // Default to French
  return 'fr';
};

export const getTranslation = (lang: 'fr' | 'en', key: string): string => {
  return translations[lang][key as keyof typeof translations.fr] || translations.fr[key as keyof typeof translations.fr];
};
