
import React from 'react';
import { Home, MapPin, BedDouble, Link as LinkIcon, Euro } from 'lucide-react';
import { extractNumericValue } from '@/utils/kanbanFilterUtils';

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
    
    // Si le budget est déjà formaté correctement, le retourner tel quel
    if (budget.includes('€') && (budget.includes('.') || budget.includes(','))) {
      return budget;
    }
    
    // Extraire la valeur numérique et formater
    const numericValue = extractNumericValue(budget);
    
    // Formatter avec séparateur de milliers
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(numericValue);
  };

  return (
    <>
      {/* Budget maximum mis en évidence */}
      {budget && (
        <div className="mb-2 flex items-center text-xs font-semibold bg-loro-sand/20 p-1 rounded">
          <Euro className="h-3 w-3 mr-1 text-chocolate-dark" />
          <span>Budget max: {formatBudget(budget)}</span>
        </div>
      )}
      
      {/* Localisation souhaitée mise en évidence */}
      {desiredLocation && (
        <div className="mb-2 flex items-center text-xs font-semibold bg-gray-100 p-1 rounded">
          <MapPin className="h-3 w-3 mr-1 text-red-500" />
          <span>{desiredLocation}</span>
        </div>
      )}
      
      {/* Type de bien */}
      {propertyType && (
        <div className="mb-2 flex items-center text-xs">
          <Home className="h-3 w-3 mr-1 text-green-600" />
          <span className="font-medium">{propertyType}</span>
        </div>
      )}
      
      {/* Pays */}
      {country && (
        <div className="mb-2 flex items-center text-xs">
          <MapPin className="h-3 w-3 mr-1 text-indigo-500" />
          <span>{country}</span>
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
