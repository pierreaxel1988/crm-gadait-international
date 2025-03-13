
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ImportResultProps {
  result: any;
}

const ImportResult: React.FC<ImportResultProps> = ({ result }) => {
  if (!result) return null;
  
  return (
    <Alert className="mt-4">
      <AlertTitle>Résultat de l'importation</AlertTitle>
      <AlertDescription>
        <p>{result.message}</p>
        {result.data && <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>}
      </AlertDescription>
    </Alert>
  );
};

export default ImportResult;
