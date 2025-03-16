
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TeamMemberSelect from '../TeamMemberSelect';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmailImportFormProps {
  emailContent: string;
  setEmailContent: (content: string) => void;
  emailAssignedTo: string | undefined;
  setEmailAssignedTo: (value: string | undefined) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

const EmailImportForm: React.FC<EmailImportFormProps> = ({
  emailContent,
  setEmailContent,
  emailAssignedTo,
  setEmailAssignedTo,
  handleSubmit,
  loading
}) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-1 md:space-y-2">
        <Label htmlFor="emailContent" className={isMobile ? 'text-xs' : ''}>Contenu de l'email</Label>
        <Textarea 
          id="emailContent" 
          rows={isMobile ? 8 : 12} 
          value={emailContent} 
          onChange={e => setEmailContent(e.target.value)} 
          placeholder="Collez ici le contenu complet de l'email..." 
          className={`font-mono ${isMobile ? 'text-xs' : 'text-sm'}`} 
          required 
        />
      </div>
      
      <TeamMemberSelect
        value={emailAssignedTo}
        onChange={setEmailAssignedTo}
      />
      
      <Button type="submit" className={`w-full bg-loro-navy hover:bg-loro-navy/90 ${isMobile ? 'h-9 text-sm' : ''}`} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyse et importation en cours...
          </>
        ) : "Analyser et importer"}
      </Button>
    </form>
  );
};

export default EmailImportForm;
