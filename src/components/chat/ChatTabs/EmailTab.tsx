
import React from 'react';
import { FileText, Loader, MailPlus, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import EnhancedInput from '../EnhancedInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface EmailTabProps {
  emailContent: string;
  setEmailContent: (content: string) => void;
  extractEmailData: () => void;
  isLoading: boolean;
  extractedData: any;
  createLeadFromData: () => void;
  selectedPipeline: 'purchase' | 'rental';
  setSelectedPipeline: (pipeline: 'purchase' | 'rental') => void;
  selectedAgent: string | undefined;
  setSelectedAgent: (agent: string | undefined) => void;
  teamMembers: Array<{id: string, name: string}>;
}

const EmailTab: React.FC<EmailTabProps> = ({
  emailContent,
  setEmailContent,
  extractEmailData,
  isLoading,
  extractedData,
  createLeadFromData,
  selectedPipeline,
  setSelectedPipeline,
  selectedAgent,
  setSelectedAgent,
  teamMembers
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
          
          <EnhancedInput 
            input={emailContent}
            setInput={setEmailContent}
            placeholder="Collez le contenu de l'email ici..."
            isLoading={isLoading}
            handleSend={handleExtraction}
            onKeyDown={handleKeyDown}
          />
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
          
          <Separator className="my-4" />
          
          <div className="space-y-4 mb-4">
            <div>
              <h5 className="text-sm font-medium mb-2 text-loro-navy">Pipeline</h5>
              <RadioGroup 
                value={selectedPipeline} 
                onValueChange={(value) => setSelectedPipeline(value as 'purchase' | 'rental')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purchase" id="purchase" />
                  <Label htmlFor="purchase">Achat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rental" id="rental" />
                  <Label htmlFor="rental">Location</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-2 text-loro-navy">Commercial assigné</h5>
              <Select 
                value={selectedAgent} 
                onValueChange={setSelectedAgent}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un commercial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non assigné</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="mt-2 w-full bg-loro-navy hover:bg-loro-navy/90" 
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
