
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Share2 } from 'lucide-react';

interface PublicLinkGeneratorProps {
  leadId: string;
  leadName: string;
}

const PublicLinkGenerator: React.FC<PublicLinkGeneratorProps> = ({ leadId, leadName }) => {
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState('');
  
  const baseUrl = window.location.origin;
  const criteriaLink = `${baseUrl}/criteria/${leadId}`;
  
  const defaultMessage = `Bonjour ${leadName},

Merci pour votre intérêt pour nos propriétés d'exception. 

Pour mieux vous accompagner dans votre recherche, nous vous invitons à renseigner vos critères via le lien sécurisé ci-dessous :

${criteriaLink}

Cela nous permettra de vous proposer une sélection personnalisée de propriétés qui correspondent parfaitement à vos attentes.

Notre équipe vous recontactera sous 24h pour organiser les visites.

Cordialement,
L'équipe Gadait International`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le lien a été copié dans le presse-papiers.",
    });
  };

  const copyMessage = () => {
    const message = customMessage || defaultMessage;
    copyToClipboard(message);
  };

  const openLink = () => {
    window.open(criteriaLink, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Lien public pour les critères
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Lien du formulaire</Label>
          <div className="flex gap-2">
            <Input
              value={criteriaLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(criteriaLink)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openLink}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Message personnalisé (optionnel)</Label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultMessage}
            className="w-full p-3 border border-gray-300 rounded-lg font-futura min-h-[200px] text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={copyMessage} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copier le message complet
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Le lead pourra remplir ses critères via ce lien et ils seront automatiquement synchronisés avec sa fiche.
        </p>
      </CardContent>
    </Card>
  );
};

export default PublicLinkGenerator;
