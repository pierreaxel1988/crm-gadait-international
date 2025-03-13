
import React, { useCallback, useState } from 'react';
import { Upload, FileX, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  isUploading: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesAccepted,
  isUploading,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxFileSize = 5, // Default 5MB
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragReject, setDragReject] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setDragReject(false);
    setUploadError(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const validateFiles = (files: File[]): { valid: File[], reason?: string } => {
    // Check if files are of accepted types
    const acceptedExtensions = acceptedFileTypes.map(type => type.toLowerCase());
    
    for (const file of files) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedExtensions.includes(extension)) {
        return { 
          valid: [], 
          reason: `Format de fichier non supporté. Formats acceptés: ${acceptedFileTypes.join(', ')}` 
        };
      }
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return { 
          valid: [], 
          reason: `Fichier trop volumineux. Taille maximum: ${maxFileSize}MB` 
        };
      }
    }
    
    return { valid: files };
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validation = validateFiles(droppedFiles);
      
      if (validation.valid.length > 0) {
        setDragReject(false);
        setUploadError(null);
        onFilesAccepted(validation.valid);
      } else {
        setDragReject(true);
        setUploadError(validation.reason || 'Fichier(s) invalide(s)');
      }
    }
  }, [onFilesAccepted, acceptedFileTypes, maxFileSize]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validation = validateFiles(selectedFiles);
      
      if (validation.valid.length > 0) {
        setDragReject(false);
        setUploadError(null);
        onFilesAccepted(validation.valid);
      } else {
        setDragReject(true);
        setUploadError(validation.reason || 'Fichier(s) invalide(s)');
      }
    }
  }, [onFilesAccepted, acceptedFileTypes, maxFileSize]);

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive ? "border-loro-navy bg-loro-navy/5" : "border-gray-300 hover:border-loro-navy/60 hover:bg-gray-50",
          dragReject ? "border-red-500 bg-red-50" : "",
          isUploading ? "pointer-events-none opacity-70" : ""
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-loro-navy animate-spin" />
          ) : dragReject ? (
            <FileX className="w-10 h-10 text-red-500" />
          ) : (
            <Upload className={cn(
              "w-10 h-10",
              isDragActive ? "text-loro-navy" : "text-gray-400"
            )} />
          )}
          
          <div className="space-y-2">
            {isUploading ? (
              <p className="text-sm font-medium text-gray-700">Traitement en cours...</p>
            ) : dragReject ? (
              <p className="text-sm font-medium text-red-600">Fichier non supporté</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? "Déposez le fichier ici" : "Glissez-déposez votre fichier ici ou cliquez pour parcourir"}
                </p>
                <p className="text-xs text-gray-500">
                  Formats acceptés: {acceptedFileTypes.join(', ')} (Max {maxFileSize}MB)
                </p>
              </>
            )}
            
            {uploadError && (
              <p className="text-xs font-medium text-red-600 mt-2">{uploadError}</p>
            )}
          </div>
        </div>
        
        <input
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
          id="file-upload"
        />
      </div>
      
      <label htmlFor="file-upload" className={cn(
        "mt-4 inline-block text-sm text-loro-navy font-medium hover:underline cursor-pointer",
        isUploading ? "pointer-events-none opacity-70" : ""
      )}>
        Sélectionner un fichier manuellement
      </label>
    </div>
  );
};

export default FileDropzone;
