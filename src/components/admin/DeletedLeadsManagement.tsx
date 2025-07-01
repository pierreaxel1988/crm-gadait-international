
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeletedLeads, restoreLead } from '@/services/leadSoftDelete';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DeletedLeadsManagement = () => {
  const [selectedLead, setSelectedLead] = useState<LeadDetailed | null>(null);
  const queryClient = useQueryClient();

  const { data: deletedLeads = [], isLoading, error } = useQuery({
    queryKey: ['deletedLeads'],
    queryFn: getDeletedLeads,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreLead,
    onSuccess: () => {
      toast({
        title: "Lead restauré",
        description: "Le lead a été restauré avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['deletedLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la restauration",
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      });
    },
  });

  const handleRestore = async (leadId: string) => {
    restoreMutation.mutate(leadId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Chargement des leads supprimés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Erreur lors du chargement des leads supprimés: {error instanceof Error ? error.message : 'Erreur inconnue'}
        </div>
      </div>
    );
  }

  if (deletedLeads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Trash2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun lead supprimé</h3>
          <p className="text-sm text-muted-foreground">La corbeille est vide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Leads supprimés</h3>
          <p className="text-sm text-muted-foreground">
            {deletedLeads.length} lead{deletedLeads.length > 1 ? 's' : ''} dans la corbeille
          </p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Agent assigné</TableHead>
              <TableHead>Supprimé le</TableHead>
              <TableHead>Supprimé par</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deletedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{lead.status}</Badge>
                </TableCell>
                <TableCell>{lead.assignedTo || '-'}</TableCell>
                <TableCell>{formatDate(lead.deleted_at)}</TableCell>
                <TableCell>{lead.deleted_by_member?.name || '-'}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {lead.deletion_reason || 'Aucune raison spécifiée'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={restoreMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restaurer le lead</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir restaurer le lead "{lead.name}" ? 
                            Il redeviendra visible et accessible dans l'application.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRestore(lead.id)}
                            disabled={restoreMutation.isPending}
                          >
                            {restoreMutation.isPending ? 'Restauration...' : 'Restaurer'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <AlertDialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Détails du lead supprimé</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Nom</h4>
                <p>{selectedLead.name}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Email</h4>
                <p>{selectedLead.email || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Téléphone</h4>
                <p>{selectedLead.phone || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Statut</h4>
                <Badge variant="secondary">{selectedLead.status}</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Budget</h4>
                <p>{selectedLead.budget || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Localisation souhaitée</h4>
                <p>{selectedLead.desiredLocation || '-'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Suppression</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Date:</span> {formatDate(selectedLead.deleted_at)}</p>
                  <p><span className="font-medium">Par:</span> {selectedLead.deleted_by_member?.name || '-'}</p>
                  <p><span className="font-medium">Raison:</span> {selectedLead.deletion_reason || 'Aucune raison spécifiée'}</p>
                </div>
              </div>
              {selectedLead.notes && (
                <div className="col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Fermer</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleRestore(selectedLead.id);
                  setSelectedLead(null);
                }}
                disabled={restoreMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurer ce lead
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default DeletedLeadsManagement;
