
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { restoreLead } from '@/services/leadSoftDelete';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface RestoreActionsProps {
  leadId: string;
  leadName: string;
  onRestore?: () => void;
}

const RestoreActions: React.FC<RestoreActionsProps> = ({ leadId, leadName, onRestore }) => {
  const handleRestore = async () => {
    try {
      await restoreLead(leadId);
      toast({
        title: "Lead restauré",
        description: `Le lead "${leadName}" a été restauré avec succès.`,
      });
      if (onRestore) {
        onRestore();
      }
      // Trigger a page refresh to update the display
      window.location.reload();
    } catch (error) {
      console.error('Error restoring lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la restauration",
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-md border border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <span className="text-sm text-red-700 flex-1">Lead supprimé</span>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restaurer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer le lead</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir restaurer le lead "{leadName}" ? 
              Il redeviendra visible et accessible dans l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RestoreActions;
