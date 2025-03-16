
import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedDataDisplayProps {
  extractedData: any;
}

const ExtractedDataDisplay: React.FC<ExtractedDataDisplayProps> = ({ extractedData }) => {
  const groupedData = useMemo(() => {
    if (!extractedData) return null;
    
    return {
      contact: {
        name: extractedData.name || extractedData.Name,
        email: extractedData.email || extractedData.Email,
        phone: extractedData.phone || extractedData.Phone,
        country: extractedData.country || extractedData.Country,
        nationality: extractedData.nationality,
      },
      property: {
        propertyType: extractedData.propertyType || extractedData.property_type || extractedData["Property type"],
        desiredLocation: extractedData.desiredLocation || extractedData.desired_location || extractedData["Desired location"],
        budget: extractedData.budget || extractedData.Budget,
        propertyReference: extractedData.propertyReference || extractedData.reference || extractedData.property_reference || "",
        bedrooms: extractedData.bedrooms || extractedData.Bedrooms,
        url: extractedData.url || extractedData.Url || extractedData["URL"],
      },
      source: {
        source: extractedData.source || extractedData.Source || "Le Figaro",
      },
      other: Object.entries(extractedData)
        .filter(([key]) => 
          !['name', 'Name', 'email', 'Email', 'phone', 'Phone', 'country', 'Country', 'nationality',
            'propertyType', 'property_type', 'Property type', 
            'desiredLocation', 'desired_location', 'Desired location',
            'budget', 'Budget', 
            'propertyReference', 'reference', 'property_reference', 'Property reference',
            'bedrooms', 'Bedrooms',
            'url', 'Url', 'URL',
            'source', 'Source'].includes(key)
        )
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>)
    };
  }, [extractedData]);

  if (!groupedData) return null;

  return (
    <ScrollArea className="flex-1 overflow-auto pr-4">
      <div className="space-y-4">
        {groupedData.contact && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium text-sm mb-2">Informations de contact</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(groupedData.contact).map(([key, value]) => 
                value && (
                  <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                    <span className="font-medium capitalize">{key === 'name' ? 'Nom' : 
                                                          key === 'email' ? 'Email' : 
                                                          key === 'phone' ? 'Téléphone' : 
                                                          key === 'country' ? 'Pays' : 
                                                          key === 'nationality' ? 'Nationalité' : 
                                                          key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {groupedData.property && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium text-sm mb-2">Informations sur la propriété</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(groupedData.property).map(([key, value]) => 
                value && (
                  <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                    <span className="font-medium capitalize">{key === 'propertyType' ? 'Type de bien' :
                                                        key === 'desiredLocation' ? 'Emplacement désiré' :
                                                        key === 'budget' ? 'Budget' :
                                                        key === 'propertyReference' ? 'Référence' :
                                                        key === 'bedrooms' ? 'Chambres' :
                                                        key === 'url' ? 'URL de l\'annonce' :
                                                        key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {groupedData.source && Object.keys(groupedData.source).some(key => groupedData.source[key]) && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium text-sm mb-2">Source</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(groupedData.source).map(([key, value]) => 
                value && (
                  <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                    <span className="font-medium capitalize">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {groupedData.other && Object.keys(groupedData.other).length > 0 && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium text-sm mb-2">Autres informations</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(groupedData.other).map(([key, value]) => 
                value && (
                  <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ExtractedDataDisplay;
