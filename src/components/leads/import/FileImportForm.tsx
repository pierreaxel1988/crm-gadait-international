
import React, { useState } from 'react';
import { Loader2, Info, FileText, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileDropzone from './FileDropzone';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FileImportFormProps {
  fileAssignedTo: string;
  fileSourceType?: string;
  salesReps: { id: string; name: string }[];
  loading: boolean;
  uploadProgress: number;
  selectedFile: File | null;
  onFileSelected: (files: File[]) => void;
  setFileAssignedTo: (repId: string) => void;
  onSourceTypeChange?: (type: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClearFile: () => void;
}

const FileImportForm: React.FC<FileImportFormProps> = ({
  fileAssignedTo,
  fileSourceType = 'CSV Import',
  salesReps,
  loading,
  uploadProgress,
  selectedFile,
  onFileSelected,
  setFileAssignedTo,
  onSourceTypeChange,
  onSubmit,
  onClearFile
}) => {
  // Predefined source options
  const sourceOptions = [
    { value: 'CSV Import', label: 'Import CSV générique' },
    { value: 'Le Figaro', label: 'Le Figaro' },
    { value: 'Properstar', label: 'Properstar' },
    { value: 'Idealista', label: 'Idealista' },
    { value: 'Property Cloud', label: 'Property Cloud' },
    { value: 'JamesEdition', label: 'JamesEdition' },
    { value: 'GreenAcres', label: 'Green Acres' },
    { value: 'LuxuryEstate', label: 'Luxury Estate' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert className="bg-blue-50 border-blue-100">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Importez facilement plusieurs leads à partir d'un fichier CSV ou Excel. 
          Les colonnes seront automatiquement mappées aux champs de lead.
        </AlertDescription>
      </Alert>
      
      {!selectedFile ? (
        <FileDropzone 
          onFilesAccepted={(files) => onFileSelected(files)} 
          isUploading={loading}
          acceptedFileTypes={['.csv', '.xlsx', '.xls']}
          maxFileSize={10}
        />
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-loro-navy" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFile}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          
          {loading && uploadProgress > 0 && (
            <div className="mt-3">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-loro-navy rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="file_assigned_to">Commercial assigné (par défaut)</Label>
          <Select 
            value={fileAssignedTo} 
            onValueChange={setFileAssignedTo}
          >
            <SelectTrigger id="file_assigned_to">
              <SelectValue placeholder="Sélectionner un commercial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Non assigné</SelectItem>
              {salesReps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Ce commercial sera assigné à tous les leads importés, sauf si une colonne "assigned_to" est présente dans le fichier.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file_source_type">Source d'importation</Label>
          <Select 
            value={fileSourceType} 
            onValueChange={onSourceTypeChange ? onSourceTypeChange : () => {}}
          >
            <SelectTrigger id="file_source_type">
              <SelectValue placeholder="Sélectionner une source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Cette information sera utilisée pour le suivi statistique des importations.
          </p>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-loro-navy hover:bg-loro-navy/90" 
        disabled={loading || !selectedFile}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importation en cours...
          </>
        ) : (
          "Importer les leads"
        )}
      </Button>
    </form>
  );
};

export default FileImportForm;
