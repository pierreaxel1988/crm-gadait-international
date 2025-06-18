
import { Owner } from '@/types/lead';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateOwnerPrice = (price?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (price && price.trim()) {
    const numericPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    if (isNaN(numericPrice)) {
      errors.push('Le prix doit être un nombre valide');
    } else if (numericPrice <= 0) {
      errors.push('Le prix doit être positif');
    } else if (numericPrice < 50000) {
      warnings.push('Prix inhabituellement bas pour l\'immobilier de luxe');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateMandateFields = (owner: Partial<Owner>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (owner.mandate_type && !owner.relationship_status) {
    warnings.push('Il est recommandé de définir le statut de la relation pour un mandat');
  }
  
  if (owner.mandate_start_date && owner.mandate_end_date) {
    const startDate = new Date(owner.mandate_start_date);
    const endDate = new Date(owner.mandate_end_date);
    
    if (startDate >= endDate) {
      errors.push('La date de fin du mandat doit être postérieure à la date de début');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getRequiredFieldsForStatus = (status: string): string[] => {
  const baseFields = ['full_name', 'phone'];
  
  switch (status) {
    case 'Mandat signé':
      return [...baseFields, 'mandate_type', 'desired_price'];
    case 'Bien en commercialisation':
      return [...baseFields, 'mandate_type', 'desired_price', 'property_description'];
    case 'Vente finalisée':
      return [...baseFields, 'mandate_type', 'desired_price'];
    default:
      return baseFields;
  }
};
