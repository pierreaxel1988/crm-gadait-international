
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailImportFormProps {
  emailContent: string;
  emailAssignedTo: string;
  salesReps: { id: string; name: string }[];
  loading: boolean;
  setEmailContent: (content: string) => void;
  setEmailAssignedTo: (repId: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const EmailImportForm: React.FC<EmailImportFormProps> = ({
  emailContent,
  emailAssignedTo,
  salesReps,
  loading,
  setEmailContent,
  setEmailAssignedTo,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailContent">Contenu de l'email</Label>
        <Textarea 
          id="emailContent" 
          rows={10} 
          value={emailContent} 
          onChange={e => setEmailContent(e.target.value)} 
          placeholder="Collez ici le contenu complet de l'email..." 
          className="font-mono text-sm"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email_assigned_to">Commercial assigné</Label>
        <Select 
          value={emailAssignedTo} 
          onValueChange={setEmailAssignedTo}
        >
          <SelectTrigger id="email_assigned_to">
            <SelectValue placeholder="Sélectionner un commercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Non assigné</SelectItem>
            {salesReps.map(rep => (
              <SelectItem key={rep.id} value={rep.id}>
                {rep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full bg-loro-navy hover:bg-loro-navy/90" disabled={loading}>
        {loading ? <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyse et importation en cours...
          </> : "Analyser et importer"}
      </Button>
    </form>
  );
};

export default EmailImportForm;
