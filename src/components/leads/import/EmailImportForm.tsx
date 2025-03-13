
import React from 'react';
import { Loader2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PortalType } from './emailParser';

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
      <Alert className="bg-blue-50 border-blue-100">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Le système reconnaît automatiquement les emails des portails suivants : 
          {Object.values(PortalType).filter(p => p !== PortalType.GENERIC).map((portal, i, arr) => (
            <span key={portal}>
              {i === 0 ? ' ' : i === arr.length - 1 ? ' et ' : ', '}
              <strong>{portal}</strong>
            </span>
          ))}
          .
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="emailContent">Contenu de l'email</Label>
        <Textarea 
          id="emailContent" 
          rows={10} 
          value={emailContent} 
          onChange={e => setEmailContent(e.target.value)} 
          placeholder="Collez ici le contenu complet de l'email (en-têtes, destinataires, corps du message)..." 
          className="font-mono text-sm"
          required 
        />
        <p className="text-xs text-muted-foreground">
          Pour de meilleurs résultats, copiez le mail entier en incluant les en-têtes (From:, To:, Subject:, etc.) et tout le corps du message.
        </p>
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
