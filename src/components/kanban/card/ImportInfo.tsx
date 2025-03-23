
import React from 'react';
import { Calendar } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ImportInfoProps {
  importedAt?: string;
  createdAt?: string;
}

const ImportInfo = ({ importedAt, createdAt }: ImportInfoProps) => {
  if (!importedAt && !createdAt) return null;
  
  const dateToUse = importedAt || createdAt;
  
  // Tenter de formater la date
  let formattedDate = dateToUse;
  try {
    if (dateToUse) {
      const date = parseISO(dateToUse);
      if (isValid(date)) {
        formattedDate = format(date, "dd/MM/yyyy", { locale: fr });
      }
    }
  } catch (error) {
    console.error("Error formatting date:", error);
  }
  
  return (
    <div className="flex items-center text-xs text-gray-500 mb-2">
      <Calendar className="h-3.5 w-3.5 mr-1.5" />
      <span>{formattedDate}</span>
    </div>
  );
};

export default ImportInfo;
