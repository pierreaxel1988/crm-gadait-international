
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';

interface LoadingStateProps {
  isLoading: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="p-4 flex justify-center items-center h-[80vh]">
      <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
    </div>
  );
};

interface NotFoundStateProps {
  show: boolean;
  id?: string;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ show, id }) => {
  const navigate = useNavigate();
  
  if (!show || !id) return null;
  
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Lead introuvable</h2>
        <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
        <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/pipeline')}>
          Retour à la liste
        </CustomButton>
      </div>
    </div>
  );
};

// Add a new error state component for pipeline issues
export const PipelineErrorState: React.FC<{show: boolean}> = ({ show }) => {
  const navigate = useNavigate();
  
  if (!show) return null;
  
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Problème d'affichage</h2>
        <p className="text-muted-foreground mt-2">
          Votre lead a été créé mais n'est peut-être pas visible dans le pipeline. 
          Essayez de rafraîchir la page ou de vérifier les filtres.
        </p>
        <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/pipeline?refresh=true')}>
          Rafraîchir le pipeline
        </CustomButton>
      </div>
    </div>
  );
};
