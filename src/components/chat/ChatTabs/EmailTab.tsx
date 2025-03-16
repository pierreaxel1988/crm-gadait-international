
import React from 'react';
import { FileText, Loader, MailPlus, ChevronDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EmailTabProps {
  emailContent: string;
  setEmailContent: (content: string) => void;
  extractEmailData: () => void;
  isLoading: boolean;
  extractedData: any;
  createLeadFromData: () => void;
}

const EmailTab: React.FC<EmailTabProps> = ({
  emailContent,
  setEmailContent,
  extractEmailData,
  isLoading,
  extractedData,
  createLeadFromData
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      extractEmailData();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction d'email</h3>
        <p className="text-sm text-loro-hazel mb-3">
          Collez le contenu d'un email pour extraire automatiquement les informations du lead.
        </p>
        
        <div className="relative">
          <Textarea
            className="w-full border-loro-sand focus-visible:ring-loro-navy mb-4 pr-16" 
            placeholder="Collez le contenu de l'email ici..."
            rows={8}
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          <Button
            className="absolute bottom-6 right-4 rounded-full h-12 w-12 bg-black hover:bg-gray-800 text-white shadow-md"
            onClick={extractEmailData}
            disabled={isLoading || !emailContent.trim()}
            size="icon"
            title="Extraire les informations (ou appuyez sur Ctrl+Enter)"
          >
            {isLoading ? 
              <Loader className="h-5 w-5 animate-spin" /> : 
              <ArrowUp className="h-5 w-5" />
            }
          </Button>
        </div>
      </div>
      
      {extractedData && (
        <div className="border border-loro-sand rounded-md p-4 mt-2 bg-loro-pearl/30">
          <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
            Données extraites
            <ChevronDown className="h-4 w-4" />
          </h4>
          <div className="space-y-2 text-sm">
            {Object.entries(extractedData).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                <span className="font-medium text-loro-navy">{key}:</span>
                <span className="text-loro-hazel">{String(value)}</span>
              </div>
            ))}
          </div>
          <Button 
            className="mt-4 w-full bg-loro-navy hover:bg-loro-navy/90" 
            variant="default"
            onClick={createLeadFromData}
          >
            <MailPlus className="h-4 w-4 mr-2" />
            Créer un lead
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailTab;
