
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Check, Eye, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DuplicatesHandler from './DuplicatesHandler';

interface ImportResultProps {
  result: any;
}

const ImportResult: React.FC<ImportResultProps> = ({ result }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  
  if (!result) return null;
  
  const isSuccessful = !result.error;
  const hasLeadData = result.data && result.data.lead;
  const hasDuplicates = result.duplicates && result.duplicates.length > 0;
  
  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleContact = (lead: any) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const sendMessage = () => {
    toast({
      title: "Message envoyé",
      description: `Un message a été envoyé à ${selectedLead.name}`,
    });
    setDialogOpen(false);
  };

  const handleMergeDuplicates = (leadId: string, duplicateId: string) => {
    // This would normally call an API to merge the leads
    toast({
      title: "Fusion effectuée",
      description: "Les leads ont été fusionnés avec succès."
    });
  };

  const handleIgnoreDuplicate = (duplicateId: string) => {
    // This would normally call an API to mark the duplicate as ignored
    toast({
      title: "Doublon ignoré",
      description: "Ce doublon sera ignoré lors des prochaines importations."
    });
  };

  // Simple import result (backwards compatibility)
  if (!hasLeadData) {
    return (
      <Alert className={`mt-4 ${isSuccessful ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <AlertTitle className={isSuccessful ? 'text-green-700' : 'text-red-700'}>
          {isSuccessful ? 'Importation réussie' : 'Erreur d\'importation'}
        </AlertTitle>
        <AlertDescription>
          <p>{result.message}</p>
          {result.data && 
            <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          }
        </AlertDescription>
      </Alert>
    );
  }

  // Enhanced import result with lead data
  return (
    <>
      <Card className="mt-4 border-2 animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className={`${isSuccessful ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
          <CardTitle className="flex items-center gap-2">
            {isSuccessful ? (
              <>
                <Check className="h-5 w-5 text-green-600" /> 
                <span className="text-green-800">Lead {result.data.isNew ? 'importé avec succès' : 'mis à jour'}</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-red-600" /> 
                <span className="text-red-800">Erreur d'importation</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Commercial assigné</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{result.data.lead.name || 'Non spécifié'}</TableCell>
                  <TableCell>{result.data.lead.email || 'Non spécifié'}</TableCell>
                  <TableCell>{result.data.lead.phone || 'Non spécifié'}</TableCell>
                  <TableCell>{result.data.lead.source || 'Non spécifié'}</TableCell>
                  <TableCell>{result.data.lead.assigned_to_name || 'Non assigné'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 h-8"
                        onClick={() => handleViewLead(result.data.lead.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Voir</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1 h-8 border-chocolate-dark text-chocolate-dark hover:bg-chocolate-dark/10"
                        onClick={() => handleContact(result.data.lead)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Contacter</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {result.message && (
              <div className={`p-3 rounded ${isSuccessful ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm ${isSuccessful ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
              </div>
            )}
            
            {result.data && result.data.debug && (
              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer text-muted-foreground">Détails techniques</summary>
                <pre className="mt-2 bg-gray-50 border p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data.debug, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => navigate('/leads')}>
              Voir tous les leads
            </Button>
            {isSuccessful && (
              <Button 
                className="bg-chocolate-dark text-white hover:bg-chocolate-light"
                onClick={() => handleViewLead(result.data.lead.id)}
              >
                Détails du lead
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {hasDuplicates && (
        <DuplicatesHandler 
          duplicates={result.duplicates} 
          onMerge={handleMergeDuplicates}
          onIgnore={handleIgnoreDuplicate}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contacter {selectedLead?.name}</DialogTitle>
            <DialogDescription>
              Envoyez un message à ce lead pour démarrer la conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full border rounded-md p-2 min-h-[100px]" 
              placeholder="Écrivez votre message ici..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button 
              className="bg-chocolate-dark text-white hover:bg-chocolate-light"
              onClick={sendMessage}
            >
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportResult;
