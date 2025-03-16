
import React from 'react';
import { Home, MapPin, BedDouble, Link as LinkIcon } from 'lucide-react';

interface PropertyInfoProps {
  propertyType?: string;
  budget?: string;
  desiredLocation?: string;
  country?: string;
  bedrooms?: number;
  url?: string;
  onLinkClick: (e: React.MouseEvent) => void;
}

const PropertyInfo = ({ 
  propertyType, 
  budget, 
  desiredLocation, 
  country, 
  bedrooms, 
  url, 
  onLinkClick 
}: PropertyInfoProps) => {
  
  // Formater le prix pour un affichage plus lisible
  const formatBudget = (budget?: string) => {
    if (!budget) return '';
    
    // Enlever les caractères non numériques sauf points et virgules
    const numericBudget = budget.replace(/[^\d.,]/g, '');
    
    // Convertir en nombre si possible
    const parsedBudget = parseFloat(numericBudget.replace(',', '.'));
    
    if (isNaN(parsedBudget)) return budget;
    
    // Formatter avec séparateur de milliers
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(parsedBudget);
  };

  return (
    <>
      {/* Type de bien et budget */}
      {(propertyType || budget) && (
        <div className="mb-2 flex items-center text-xs">
          <Home className="h-3 w-3 mr-1 text-green-600" />
          <span className="font-medium">
            {propertyType && propertyType}
            {propertyType && budget && ' – '}
            {budget && formatBudget(budget)}
          </span>
        </div>
      )}
      
      {/* Localisation souhaitée */}
      {(desiredLocation || country) && (
        <div className="mb-2 flex items-center text-xs">
          <MapPin className="h-3 w-3 mr-1 text-red-500" />
          <span>
            {desiredLocation}
            {desiredLocation && country && ', '}
            {country}
          </span>
        </div>
      )}
      
      {/* Nombre de chambres */}
      {bedrooms && (
        <div className="mb-2 flex items-center text-xs">
          <BedDouble className="h-3 w-3 mr-1 text-indigo-500" />
          <span>{bedrooms} chambre{bedrooms > 1 ? 's' : ''}</span>
        </div>
      )}
      
      {/* Lien vers l'annonce */}
      {url && (
        <div className="mb-2">
          <button 
            onClick={onLinkClick}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            <span>Voir l'annonce</span>
          </button>
        </div>
      )}
    </>
  );
};

export default PropertyInfo;
