
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, MergeIcon, RefreshCw, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface DuplicateMatch {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  created_at: string;
  match_type: string;
}

interface DuplicateEntry {
  lead: any;
  matches: DuplicateMatch[];
}

interface DuplicatesHandlerProps {
  duplicates: DuplicateEntry[];
  onMerge: (leadId: string, duplicateId: string) => void;
  onIgnore: (duplicateId: string) => void;
}

const DuplicatesHandler: React.FC<DuplicatesHandlerProps> = ({ 
  duplicates, 
  onMerge, 
  onIgnore 
}) => {
  const navigate = useNavigate();
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateMatch | null>(null);

  if (!duplicates || duplicates.length === 0) {
    return null;
  }

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleMergeClick = (lead: any, duplicate: DuplicateMatch) => {
    setSelectedLead(lead);
    setSelectedDuplicate(duplicate);
    setMergeDialogOpen(true);
  };

  const confirmMerge = () => {
    if (selectedLead && selectedDuplicate) {
      onMerge(selectedLead.id, selectedDuplicate.id);
      toast({
        title: "Fusion réussie",
        description: "Les leads ont été fusionnés avec succès."
      });
      setMergeDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'email':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Email identique</Badge>;
      case 'phone':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Téléphone identique</Badge>;
      default:
        return <Badge variant="outline">Autre correspondance</Badge>;
    }
  };

  return (
    <Card className="mt-6 border-amber-200">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          Doublons potentiels détectés ({duplicates.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {duplicates.map((entry, index) => (
          <div key={index} className="border-b last:border-0">
            <div className="p-4 bg-amber-50/50">
              <h3 className="font-medium mb-1">Lead importé : {entry.lead.name}</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                <span>Email: {entry.lead.email || '—'}</span>
                <span>Tél: {entry.lead.phone || '—'}</span>
                <span>Source: {entry.lead.source || '—'}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.matches.map((duplicate, i) => (
                    <TableRow key={i}>
                      <TableCell>{getMatchTypeLabel(duplicate.match_type)}</TableCell>
                      <TableCell className="font-medium">{duplicate.name}</TableCell>
                      <TableCell>{duplicate.email || '—'}</TableCell>
                      <TableCell>{duplicate.phone || '—'}</TableCell>
                      <TableCell>{duplicate.source || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={duplicate.status === 'New' ? 'outline' : 'default'}>
                          {duplicate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(duplicate.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={() => handleViewLead(duplicate.id)}
                          >
                            Voir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-amber-700 border-amber-300 hover:bg-amber-100"
                            onClick={() => handleMergeClick(entry.lead, duplicate)}
                          >
                            <MergeIcon className="h-3.5 w-3.5 mr-1" />
                            Fusionner
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fusionner les leads</DialogTitle>
            <DialogDescription>
              Cette action va fusionner le lead importé avec le lead existant en conservant les données les plus récentes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && selectedDuplicate && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <h3 className="font-medium mb-2">Lead importé</h3>
                  <p>Nom: {selectedLead.name}</p>
                  <p>Email: {selectedLead.email || '—'}</p>
                  <p>Téléphone: {selectedLead.phone || '—'}</p>
                </div>
                <div className="border rounded p-3">
                  <h3 className="font-medium mb-2">Lead existant</h3>
                  <p>Nom: {selectedDuplicate.name}</p>
                  <p>Email: {selectedDuplicate.email || '—'}</p>
                  <p>Téléphone: {selectedDuplicate.phone || '—'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>Annuler</Button>
            <Button 
              onClick={confirmMerge} 
              className="bg-amber-600 hover:bg-amber-700"
            >
              <MergeIcon className="h-4 w-4 mr-2" />
              Confirmer la fusion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DuplicatesHandler;
