
import React from 'react';
import { Calendar } from 'lucide-react';

interface ImportInfoProps {
  importedAt?: string;
  createdAt?: string;
}

const ImportInfo = ({ importedAt, createdAt }: ImportInfoProps) => {
  if (!importedAt && !createdAt) return null;
  
  return (
    <div className="flex items-center text-xs text-muted-foreground mb-2">
      <Calendar className="h-3 w-3 mr-1" />
      <span>Importé le {importedAt || createdAt}</span>
    </div>
  );
};

export default ImportInfo;
