
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Plus, Calendar } from 'lucide-react';
import { createPublicCriteriaLink, getActiveLinksForLead, PublicCriteriaLink } from '@/services/publicCriteriaService';

interface PublicCriteriaLinkManagerProps {
  leadId: string;
  leadName: string;
}

const PublicCriteriaLinkManager: React.FC<PublicCriteriaLinkManagerProps> = ({ leadId, leadName }) => {
  const [links, setLinks] = useState<PublicCriteriaLink[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, [leadId]);

  const loadLinks = async () => {
    try {
      const activeLinks = await getActiveLinksForLead(leadId);
      setLinks(activeLinks);
    } catch (error) {
      console.error('Error loading links:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les liens existants."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const newLink = await createPublicCriteriaLink(leadId);
      if (newLink) {
        setLinks(prev => [newLink, ...prev]);
        toast({
          title: "Lien créé",
          description: "Le lien public a été créé avec succès."
        });
      }
    } catch (error) {
      console.error('Error creating link:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lien public."
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "Le lien a été copié dans le presse-papiers."
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien."
      });
    }
  };

  const getPublicUrl = (token: string) => {
    return `${window.location.origin}/public-criteria/${token}`;
  };

  const getEmailTemplate = (url: string) => {
    return `Bonjour ${leadName},

Afin de mieux vous accompagner dans votre recherche immobilière, pourriez-vous prendre quelques minutes pour remplir vos critères de recherche via ce lien sécurisé :

${url}

Cela nous permettra de vous proposer une sélection personnalisée de propriétés correspondant parfaitement à vos attentes.

Merci pour votre confiance.

Cordialement,
L'équipe Gadait International`;
  };

  const getWhatsAppTemplate = (url: string) => {
    return `Bonjour ${leadName} ! 👋

Pour vous proposer les meilleures propriétés, pourriez-vous remplir vos critères de recherche ici : ${url}

Merci ! 🏡`;
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liens publics de critères</span>
            <Button
              onClick={handleCreateLink}
              disabled={creating}
              size="sm"
              className="bg-loro-terracotta hover:bg-loro-terracotta/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? 'Création...' : 'Créer un lien'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {links.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun lien public créé. Créez un lien pour permettre au client de remplir ses critères.
            </p>
          ) : (
            links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Créé le {new Date(link.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    {link.filled_at && (
                      <p className="text-sm text-green-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Rempli le {new Date(link.filled_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getPublicUrl(link.token))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getPublicUrl(link.token), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Lien :</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                    {getPublicUrl(link.token)}
                  </code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Template Email :</p>
                    <textarea
                      readOnly
                      value={getEmailTemplate(getPublicUrl(link.token))}
                      className="w-full h-32 text-xs p-2 border rounded resize-none"
                      onClick={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.select();
                        copyToClipboard(target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Template WhatsApp :</p>
                    <textarea
                      readOnly
                      value={getWhatsAppTemplate(getPublicUrl(link.token))}
                      className="w-full h-32 text-xs p-2 border rounded resize-none"
                      onClick={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.select();
                        copyToClipboard(target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicCriteriaLinkManager;
