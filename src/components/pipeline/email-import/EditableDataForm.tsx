
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import FormInput from '@/components/leads/form/FormInput';

interface EditableDataFormProps {
  editableData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EditableDataForm: React.FC<EditableDataFormProps> = ({ editableData, handleInputChange }) => {
  if (!editableData) return null;

  return (
    <ScrollArea className="flex-1 overflow-auto pr-4">
      <div className="space-y-6">
        <div className="border rounded-md p-3">
          <h3 className="font-medium text-sm mb-2">Informations de contact</h3>
          <div className="space-y-2">
            {Object.entries({
              name: editableData.name || editableData.Name || "",
              email: editableData.email || editableData.Email || "",
              phone: editableData.phone || editableData.Phone || "",
              country: editableData.country || editableData.Country || "",
              nationality: editableData.nationality || ""
            }).map(([key, value]) => {
              if (!value) return null;
              const label = key === 'name' ? 'Nom' : 
                          key === 'email' ? 'Email' : 
                          key === 'phone' ? 'Téléphone' : 
                          key === 'country' ? 'Pays' : 
                          key === 'nationality' ? 'Nationalité' : key;
              return (
                <div key={key} className="mb-2">
                  <FormInput
                    label={label}
                    name={key}
                    value={String(value)}
                    onChange={handleInputChange}
                    className="text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="border rounded-md p-3">
          <h3 className="font-medium text-sm mb-2">Informations sur la propriété</h3>
          <div className="space-y-2">
            {Object.entries({
              propertyType: editableData.propertyType || editableData.property_type || "",
              desiredLocation: editableData.desiredLocation || editableData.desired_location || "",
              budget: editableData.budget || editableData.Budget || "",
              propertyReference: editableData.propertyReference || editableData.reference || editableData.property_reference || "",
              bedrooms: editableData.bedrooms || "",
              url: editableData.url || ""
            }).map(([key, value]) => {
              if (!value) return null;
              const label = key === 'propertyType' ? 'Type de bien' :
                          key === 'desiredLocation' ? 'Emplacement désiré' :
                          key === 'budget' ? 'Budget' :
                          key === 'propertyReference' ? 'Référence' :
                          key === 'bedrooms' ? 'Chambres' :
                          key === 'url' ? 'URL de l\'annonce' : key;
              return (
                <div key={key} className="mb-2">
                  <FormInput
                    label={label}
                    name={key}
                    value={String(value)}
                    onChange={handleInputChange}
                    className="text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="border rounded-md p-3">
          <h3 className="font-medium text-sm mb-2">Source</h3>
          <div className="space-y-2">
            <div className="mb-2">
              <FormInput
                label="Source"
                name="source"
                value={editableData.source || editableData.Source || "Le Figaro"}
                onChange={handleInputChange}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default EditableDataForm;
