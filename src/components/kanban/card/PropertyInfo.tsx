
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
  
  // Format budget for better display
  const formatBudget = (budget?: string) => {
    if (!budget) return '';
    
    // If the budget is already formatted correctly, return it as is
    if (budget.includes('€') && (budget.includes('.') || budget.includes(','))) {
      return budget;
    }
    
    // Extract the numeric value
    const numericValue = extractNumericValue(budget);
    
    // Format with thousand separators - ensure large numbers display correctly
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      // Ensure minimum fraction digits is set to 0 to avoid decimal places for whole numbers
      minimumFractionDigits: 0
    }).format(numericValue);
  };

  // Check if budget is valid for display (non-empty and non-null)
  const hasBudget = budget && budget.trim() !== '';
  
  // Check if location is valid for display (non-empty and non-null)
  const hasLocation = desiredLocation && desiredLocation.trim() !== '';

  return (
    <>
      {/* Budget maximum highlighted */}
      {hasBudget && (
        <div className="mb-2 flex items-center text-xs font-medium bg-gray-100 px-3 py-2 rounded">
          <Euro className="h-3.5 w-3.5 mr-1.5 text-gray-700" />
          <span>Budget max: {formatBudget(budget)}</span>
        </div>
      )}
      
      {/* Desired location highlighted */}
      {hasLocation && (
        <div className="mb-2 flex items-center text-xs font-medium bg-gray-100 px-3 py-2 rounded">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-red-500" />
          <span>{desiredLocation}</span>
        </div>
      )}
      
      {/* Country */}
      {country && (
        <div className="mb-2 flex items-center text-xs">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
          <span className="text-gray-700">{country}</span>
        </div>
      )}
      
      {/* Property type */}
      {propertyType && (
        <div className="mb-2 flex items-center text-xs">
          <Home className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          <span className="text-gray-700">{propertyType}</span>
        </div>
      )}
      
      {/* Number of bedrooms */}
      {bedrooms && (
        <div className="mb-2 flex items-center text-xs">
          <BedDouble className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
          <span className="text-gray-700">{bedrooms} chambre{bedrooms > 1 ? 's' : ''}</span>
        </div>
      )}
      
      {/* Link to listing */}
      {url && (
        <div className="mb-2">
          <button 
            onClick={onLinkClick}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
            <span>Voir l'annonce</span>
          </button>
        </div>
      )}
    </>
  );
};

export default PropertyInfo;
