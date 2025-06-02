import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LeadDetailed } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LeadTag } from '../LeadTag';

interface ImportedLeadsPanelProps {
  leads: LeadDetailed[];
  onClear: () => void;
}

const ImportedLeadsPanel: React.FC<ImportedLeadsPanelProps> = ({ leads, onClear }) => {
  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copié dans le presse-papier",
          description: `Le ${fieldName} a été copié avec succès !`
        });
      })
      .catch(err => {
        console.error("Erreur lors de la copie dans le presse-papier :", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Impossible de copier le ${fieldName}.`
        });
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Leads importés</h2>
        <Button variant="destructive" size="sm" onClick={onClear}>
          Effacer la liste
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Liste des leads importés.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{lead.email}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(lead.email, "email")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{lead.phone}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(lead.phone, "téléphone")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.tags.map((tag, index) => (
                      <LeadTag 
                        key={index}
                        tag={tag as LeadTag}
                        variant="default"
                        size="sm"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.url && (
                    <Button variant="link" size="sm" asChild>
                      <a href={lead.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                        <span>Voir</span>
                        <Link className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ImportedLeadsPanel;
