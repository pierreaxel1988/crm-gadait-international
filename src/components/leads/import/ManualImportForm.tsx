
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ManualImportFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    property_reference: string;
    source: string;
    message: string;
    integration_source: string;
    assigned_to: string;
  };
  salesReps: { id: string; name: string }[];
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const ManualImportForm: React.FC<ManualImportFormProps> = ({
  formData,
  salesReps,
  loading,
  onInputChange,
  onSelectChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet *</Label>
          <Input id="name" name="name" value={formData.name} onChange={onInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={onInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={onInputChange} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="property_reference">Référence Propriété</Label>
          <Input id="property_reference" name="property_reference" value={formData.property_reference} onChange={onInputChange} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" value={formData.source} onChange={onInputChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigned_to">Commercial assigné</Label>
          <Select 
            value={formData.assigned_to} 
            onValueChange={(value) => onSelectChange('assigned_to', value)}
          >
            <SelectTrigger id="assigned_to">
              <SelectValue placeholder="Sélectionner un commercial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Non assigné</SelectItem>
              {salesReps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={4} value={formData.message} onChange={onInputChange} />
      </div>
      
      <Button type="submit" className="w-full bg-loro-navy hover:bg-loro-navy/90" disabled={loading}>
        {loading ? <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importation en cours...
          </> : "Importer le lead"}
      </Button>
    </form>
  );
};

export default ManualImportForm;
