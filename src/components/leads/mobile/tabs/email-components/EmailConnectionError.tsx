
import React from 'react';
import { AlertCircle, Info, ExternalLink, RefreshCw, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EmailConnectionErrorProps {
  connectionError: string | null;
  detailedErrorInfo: any;
  googleAuthURL: string | null;
  retryConnection: () => void;
  checkSupabaseEdgeFunctionStatus: () => void;
  connectGmail: () => void;
  isConnecting: boolean;
}

const EmailConnectionError: React.FC<EmailConnectionErrorProps> = ({
  connectionError,
  detailedErrorInfo,
  googleAuthURL,
  retryConnection,
  checkSupabaseEdgeFunctionStatus,
  connectGmail,
  isConnecting,
}) => {
  // Check if the error includes specific known patterns
  const isConnectionRefused = connectionError?.includes('refused to connect') || 
                             detailedErrorInfo?.error?.message?.includes('refused to connect') ||
                             JSON.stringify(detailedErrorInfo)?.includes('refused to connect');
  
  const isAccessDenied = connectionError?.includes('access_denied') || 
                        detailedErrorInfo?.error?.includes('access_denied') ||
                        JSON.stringify(detailedErrorInfo)?.includes('access_denied');

  return (
    <div className="p-4 flex flex-col space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de connexion</AlertTitle>
        <AlertDescription>
          {connectionError}
        </AlertDescription>
      </Alert>
      
      {isConnectionRefused && (
        <Alert className="bg-amber-50 border-amber-200">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Google a refusé la connexion</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">Cette erreur se produit généralement pour l'une des raisons suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Les cookies tiers sont bloqués dans votre navigateur</li>
              <li>Un bloqueur de publicités ou une extension de confidentialité interfère avec la connexion</li>
              <li>Des restrictions de sécurité sur votre réseau empêchent la connexion</li>
              <li>Les paramètres de sécurité de votre compte Google sont trop restrictifs</li>
            </ul>
            <div className="mt-3">
              <p className="font-medium">Conseils pour résoudre ce problème :</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Essayez d'utiliser un navigateur différent</li>
                <li>Désactivez temporairement les extensions de votre navigateur</li>
                <li>Essayez de vous connecter depuis un autre réseau</li>
                <li>Vérifiez les paramètres de sécurité de votre compte Google</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {isAccessDenied && (
        <Alert className="bg-amber-50 border-amber-200">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Accès refusé par Google</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">Vous avez refusé de donner l'accès à votre compte Gmail. Pour utiliser cette fonctionnalité, vous devez autoriser l'application à accéder à vos emails.</p>
            <p>Si vous avez changé d'avis, veuillez cliquer sur le bouton "Réessayer la connexion Gmail" ci-dessous.</p>
          </AlertDescription>
        </Alert>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Informations techniques
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre-wrap">
              {detailedErrorInfo ? JSON.stringify(detailedErrorInfo, null, 2) : "Aucune information détaillée disponible"}
            </div>
            <p className="text-xs mt-2 text-gray-500">Ces informations peuvent être utiles pour le support technique.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {googleAuthURL && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Lien direct disponible</AlertTitle>
          <AlertDescription className="text-blue-600">
            Vous pouvez essayer d'ouvrir le lien d'autorisation directement ci-dessous :
            <div className="mt-2">
              <Button 
                onClick={() => window.open(googleAuthURL, '_blank')}
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Ouvrir le lien d'autorisation
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={retryConnection} 
        variant="outline" 
        className="w-full mt-4"
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Rafraîchir la connexion
      </Button>
      
      <Button 
        onClick={checkSupabaseEdgeFunctionStatus}
        variant="outline"
        className="w-full"
      >
        <Info className="mr-2 h-4 w-4" /> Vérifier le statut des serveurs
      </Button>
      
      <div className="bg-loro-pearl/30 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Conseils de dépannage:</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Vérifiez que votre projet Google est correctement configuré dans la <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-loro-chocolate underline">Console Google Cloud</a></li>
          <li>Assurez-vous que l'URI de redirection autorisée dans la console Google est: <code className="bg-gray-100 p-1 rounded text-xs">https://success.gadait-international.com/oauth/callback</code></li>
          <li>Vérifiez que le client ID et le client secret sont corrects</li>
          <li>Assurez-vous que l'API Gmail est activée dans la <a href="https://console.cloud.google.com/apis/library" target="_blank" className="text-loro-chocolate underline">bibliothèque d'API Google</a></li>
          <li>Assurez-vous que l'application est de type <strong>Application Web</strong></li>
          <li><strong>Important:</strong> Vérifiez que l'erreur 403 n'est pas due à des restrictions sur votre compte Google. Si vous utilisez Google Workspace, contactez votre administrateur</li>
          <li>Assurez-vous que le compte Google utilisé a l'autorisation d'accéder à l'API Gmail</li>
          <li>Vérifiez que les cookies tiers sont autorisés dans votre navigateur</li>
          <li>Essayez d'utiliser une fenêtre de navigation privée</li>
          <li>Si le problème persiste, essayez de vous déconnecter de tous vos comptes Google et reconnectez-vous uniquement avec le compte que vous souhaitez utiliser</li>
        </ul>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2 text-amber-800">Note sur l'erreur 403:</p>
        <p className="text-amber-700">
          Une erreur 403 indique généralement un problème de permissions. Voici quelques vérifications supplémentaires:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-amber-600 mt-2">
          <li>Assurez-vous que l'API Gmail a été activée pour le projet</li>
          <li>Vérifiez que le compte utilisé n'est pas soumis à des restrictions organisationnelles</li>
          <li>Confirmez que tous les scopes nécessaires sont configurés dans le projet Google Cloud</li>
          <li>Si vous utilisez un compte Gmail, assurez-vous qu'il n'est pas configuré avec une sécurité accrue qui bloque les connexions d'applications</li>
        </ul>
      </div>
      
      <Button 
        onClick={connectGmail} 
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 text-white shadow-md py-6 rounded-md bg-loro-terracotta hover:bg-loro-terracotta/90"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Connexion en cours...</span>
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            <span className="font-medium">Réessayer la connexion Gmail</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default EmailConnectionError;
