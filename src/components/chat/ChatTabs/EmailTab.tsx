
import React from 'react';
import { FileText, Loader, MailPlus, ChevronDown, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

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
  const [extractionSuccess, setExtractionSuccess] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleExtraction();
    }
  };

  const handleExtraction = async () => {
    if (!emailContent.trim()) return;
    
    setExtractionSuccess(false);
    try {
      await extractEmailData();
      // Show success state briefly
      setExtractionSuccess(true);
      toast.success("Extraction réussie", {
        description: "Les informations ont été extraites avec succès",
        duration: 3000
      });
      
      // Reset success state after animation completes
      setTimeout(() => {
        setExtractionSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error("Échec de l'extraction", {
        description: "Une erreur s'est produite lors de l'extraction",
        duration: 5000
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction d'email</h3>
        
        <Card className="border-loro-sand p-4">
          <p className="text-sm text-loro-hazel mb-3">
            Collez le contenu d'un email pour extraire automatiquement les informations du lead.
          </p>
          
          <div className="relative border border-loro-sand rounded-md overflow-hidden">
            <Textarea
              className="resize-none pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[150px]" 
              placeholder="Collez le contenu de l'email ici..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <Button
              size="icon"
              className={`absolute right-2 bottom-2 rounded-full h-12 w-12 ${
                emailContent.trim() 
                  ? (extractionSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-loro-hazel hover:bg-loro-hazel/90') 
                  : 'bg-loro-sand/50'
              } text-white`}
              onClick={handleExtraction}
              disabled={isLoading || !emailContent.trim()}
              title="Extraire les informations (ou appuyez sur Ctrl+Enter)"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : extractionSuccess ? (
                <Check className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>
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
