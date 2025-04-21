
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface OwnerNotesProps {
  owner: any;
  onUpdate: (data: any) => Promise<void>;
}

const OwnerNotes: React.FC<OwnerNotesProps> = ({ owner, onUpdate }) => {
  const [specificNeeds, setSpecificNeeds] = useState(owner?.specific_needs || "");
  const [attentionPoints, setAttentionPoints] = useState(owner?.attention_points || "");
  const [relationshipDetails, setRelationshipDetails] = useState(owner?.relationship_details || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onUpdate({
        specific_needs: specificNeeds,
        attention_points: attentionPoints,
        relationship_details: relationshipDetails
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Besoins spécifiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="specific_needs">Détaillez les besoins spécifiques du propriétaire</Label>
            <Textarea
              id="specific_needs"
              placeholder="Ex: Vente rapide, prix souhaité, contraintes particulières..."
              value={specificNeeds}
              onChange={(e) => setSpecificNeeds(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Points d'attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="attention_points">Points importants à noter pour ce propriétaire</Label>
            <Textarea
              id="attention_points"
              placeholder="Ex: Sensible au prix, disponibilité limitée, situation familiale particulière..."
              value={attentionPoints}
              onChange={(e) => setAttentionPoints(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails de la relation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="relationship_details">Historique et contexte de la relation</Label>
            <Textarea
              id="relationship_details"
              placeholder="Ex: Comment avez-vous rencontré ce propriétaire? Quelles sont vos interactions passées?"
              value={relationshipDetails}
              onChange={(e) => setRelationshipDetails(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les observations"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OwnerNotes;
