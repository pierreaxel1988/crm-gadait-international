
import React from 'react';
import CustomButton from '@/components/ui/CustomButton';

interface FormActionsProps {
  onCancel: () => void;
  isSaving?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSaving = false }) => {
  return (
    <div className="flex justify-end gap-3">
      <CustomButton 
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Annuler
      </CustomButton>
      <CustomButton 
        type="submit" 
        isLoading={isSaving}
      >
        Enregistrer
      </CustomButton>
    </div>
  );
};

export default FormActions;
