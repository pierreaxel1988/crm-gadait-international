
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImportResultDisplayProps {
  result: {
    message?: string;
    data?: any;
    [key: string]: any;
  } | null;
}

const ImportResultDisplay: React.FC<ImportResultDisplayProps> = ({ result }) => {
  const isMobile = useIsMobile();
  
  if (!result) return null;
  
  return (
    <Alert className="mt-3 md:mt-4 text-sm">
      <AlertTitle>Résultat de l'importation</AlertTitle>
      <AlertDescription>
        <p>{result.message}</p>
        {result.data && (
          <pre className={`mt-2 bg-gray-50 p-2 rounded overflow-auto ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ImportResultDisplay;
