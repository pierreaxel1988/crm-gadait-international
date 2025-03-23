
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface LeadErrorAlertProps {
  error: string | null;
}

const LeadErrorAlert: React.FC<LeadErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="bg-red-100 border-red-400">
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default LeadErrorAlert;
