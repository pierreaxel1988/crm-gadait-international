
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { addPropertyToOwner, removePropertyFromOwner } from "@/services/ownerService";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface OwnerPropertiesSectionProps {
  ownerId: string;
  properties: any[];
}

const OwnerPropertiesSection: React.FC<OwnerPropertiesSectionProps> = ({ ownerId, properties }) => {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [propertyReference, setPropertyReference] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("À vendre");
  const [propertiesList, setPropertiesList] = useState(properties || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAddProperty = async () => {
    if (!propertyReference.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une référence de bien."
      });
      return;
    }
    
    setIsAddingProperty(true);
    
    try {
      const success = await addPropertyToOwner(ownerId, { 
        reference: propertyReference,
        status: propertyStatus
      });
      
      if (success) {
        // Ajouter la propriété à la liste locale
        setPropertiesList([
          ...propertiesList,
          {
            id: Date.now().toString(), // ID temporaire
            property_reference: propertyReference,
            property_status: propertyStatus
          }
        ]);
        
        // Réinitialiser le formulaire
        setPropertyReference("");
        setPropertyStatus("À vendre");
        setIsDialogOpen(false);
      }
    } finally {
      setIsAddingProperty(false);
    }
  };
  
  const handleRemoveProperty = async (propertyId: string) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?");
    
    if (confirmed) {
      const success = await removePropertyFromOwner(propertyId);
      
      if (success) {
        // Mettre à jour la liste locale
        setPropertiesList(propertiesList.filter(prop => prop.id !== propertyId));
      }
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Biens liés</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un bien
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un bien</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property_reference">Référence du bien</Label>
                <Input
                  id="property_reference"
                  placeholder="Ex: PROP-001"
                  value={propertyReference}
                  onChange={(e) => setPropertyReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_status">Statut du bien</Label>
                <Select onValueChange={setPropertyStatus} defaultValue={propertyStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="À vendre">À vendre</SelectItem>
                    <SelectItem value="Vendu">Vendu</SelectItem>
                    <SelectItem value="En pause">En pause</SelectItem>
                    <SelectItem value="À louer">À louer</SelectItem>
                    <SelectItem value="Loué">Loué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProperty} disabled={isAddingProperty}>
                {isAddingProperty ? "Ajout en cours..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {propertiesList.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucun bien lié à ce propriétaire.</p>
            <p className="text-sm">Cliquez sur "Ajouter un bien" pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {propertiesList.map((property) => (
              <div 
                key={property.id} 
                className="flex items-center justify-between p-3 border rounded-md bg-slate-50"
              >
                <div>
                  <p className="font-medium">{property.property_reference}</p>
                  <p className="text-sm text-muted-foreground">{property.property_status}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveProperty(property.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OwnerPropertiesSection;
