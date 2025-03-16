
import React, { useState, useEffect } from 'react';
import { Mail, Loader2, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { createLead } from '@/services/leadCore';
import EmailInputSection from './EmailInputSection';
import AgentSelectionSection from './AgentSelectionSection';
import ExtractedDataDisplay from './ExtractedDataDisplay';
import EditableDataForm from './EditableDataForm';

interface EmailImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: Array<{id: string, name: string}>;
  onLeadCreated?: () => void;
}

const EmailImportModal: React.FC<EmailImportModalProps> = ({ 
  isOpen, 
  onClose, 
  teamMembers,
  onLeadCreated
}) => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [selectedPipeline, setSelectedPipeline] = useState<'purchase' | 'rental'>('purchase');
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && teamMembers.length > 0 && !selectedAgent) {
      const pierreAxel = teamMembers.find(member => 
        member.name.toLowerCase().includes('pierre axel gadait'));
      
      if (pierreAxel) {
        setSelectedAgent(pierreAxel.id);
      }
    }
  }, [isOpen, teamMembers, selectedAgent]);

  const resetForm = () => {
    setEmailContent('');
    setExtractedData(null);
    setEditableData(null);
    setSelectedAgent(undefined);
    setIsEditing(false);
  };

  const handleCreateLead = () => {
    if (!editableData) return;
    
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }
    
    try {
      const newLead = {
        name: editableData.name || editableData.Name || "",
        email: editableData.email || editableData.Email || "",
        phone: editableData.phone || editableData.Phone || "",
        source: editableData.Source || editableData.source || "Site web",
        budget: editableData.Budget || editableData.budget || "",
        propertyReference: editableData.property_reference || editableData.reference || editableData["Property reference"] || "",
        desiredLocation: editableData.desired_location || editableData.desiredLocation || editableData["Desired location"] || "",
        propertyType: editableData.propertyType || editableData.property_type || editableData["Property type"] || "",
        nationality: editableData.nationality || "",
        notes: emailContent || "",
        status: "New",
        tags: ["Imported"],
        assignedTo: selectedAgent,
        bedrooms: editableData.bedrooms || undefined,
        url: editableData.url || "",
        taskType: "Call",
      };
      
      createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès.`
      });
      
      resetForm();
      onClose();
      
      if (onLeadCreated) {
        onLeadCreated();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Importer un lead depuis un email
          </DialogTitle>
          <DialogDescription>
            Collez le contenu d'un email pour extraire automatiquement les informations du lead.
          </DialogDescription>
        </DialogHeader>

        {!extractedData ? (
          <EmailInputSection 
            emailContent={emailContent}
            setEmailContent={setEmailContent}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setExtractedData={setExtractedData}
            setEditableData={setEditableData}
          />
        ) : (
          <AgentSelectionSection
            extractedData={extractedData}
            editableData={editableData}
            isEditing={isEditing}
            toggleEditMode={toggleEditMode}
            selectedPipeline={selectedPipeline}
            setSelectedPipeline={setSelectedPipeline}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            teamMembers={teamMembers}
            setEditableData={setEditableData}
          />
        )}
        
        {extractedData && (
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setExtractedData(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Modifier l'email
            </Button>
            <Button 
              type="button"
              className="bg-loro-navy hover:bg-loro-navy/90"
              onClick={handleCreateLead}
              disabled={!selectedAgent}
            >
              <Check className="h-4 w-4 mr-2" />
              Créer le lead
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailImportModal;
