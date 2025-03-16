
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ExtractedDataDisplay from './ExtractedDataDisplay';
import EditableDataForm from './EditableDataForm';

interface AgentSelectionSectionProps {
  extractedData: any;
  editableData: any;
  isEditing: boolean;
  toggleEditMode: () => void;
  selectedPipeline: 'purchase' | 'rental';
  setSelectedPipeline: (pipeline: 'purchase' | 'rental') => void;
  selectedAgent: string | undefined;
  setSelectedAgent: (agentId: string | undefined) => void;
  teamMembers: Array<{id: string, name: string}>;
  setEditableData: (data: any) => void;
}

const AgentSelectionSection: React.FC<AgentSelectionSectionProps> = ({
  extractedData,
  editableData,
  isEditing,
  toggleEditMode,
  selectedPipeline,
  setSelectedPipeline,
  selectedAgent,
  setSelectedAgent,
  teamMembers,
  setEditableData
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <ScrollArea className="flex-1 overflow-auto pr-4">
      <div className="space-y-4">
        {!isEditing && (
          <Button
            variant="outline"
            className="mb-2 flex items-center gap-1"
            onClick={toggleEditMode}
          >
            <Edit className="h-4 w-4" />
            Modifier les informations
          </Button>
        )}
        
        {isEditing && (
          <Button
            variant="outline"
            className="mb-2"
            onClick={toggleEditMode}
          >
            Terminer la modification
          </Button>
        )}
        
        {isEditing ? (
          <EditableDataForm 
            editableData={editableData} 
            handleInputChange={handleInputChange} 
          />
        ) : (
          <ExtractedDataDisplay extractedData={extractedData} />
        )}
        
        <Separator />
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action requise</AlertTitle>
          <AlertDescription>
            Veuillez sélectionner un commercial pour créer le lead dans le CRM
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Pipeline</h3>
            <div className="flex space-x-4">
              <Button
                variant={selectedPipeline === 'purchase' ? 'default' : 'outline'}
                onClick={() => setSelectedPipeline('purchase')}
                className="flex-1"
              >
                Achat
              </Button>
              <Button
                variant={selectedPipeline === 'rental' ? 'default' : 'outline'}
                onClick={() => setSelectedPipeline('rental')}
                className="flex-1"
              >
                Location
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Commercial assigné <span className="text-red-500">*</span></h3>
            <Select 
              value={selectedAgent} 
              onValueChange={setSelectedAgent}
            >
              <SelectTrigger className={`w-full ${!selectedAgent ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Sélectionner un commercial" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedAgent && (
              <p className="text-xs text-red-500 mt-1">La sélection d'un commercial est obligatoire</p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default AgentSelectionSection;
