
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeamMemberSelect from '../TeamMemberSelect';
import { LeadSource } from '@/types/lead';
import { useIsMobile } from '@/hooks/use-mobile';

interface ManualFormData {
  name: string;
  email: string;
  phone: string;
  property_reference: string;
  source: LeadSource;
  message: string;
  integration_source: string;
  assigned_to: string | undefined;
}

interface ManualImportFormProps {
  formData: ManualFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSourceChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  leadSources: LeadSource[];
}

const ManualImportForm: React.FC<ManualImportFormProps> = ({
  formData,
  handleInputChange,
  handleSourceChange,
  handleSubmit,
  loading,
  leadSources
}) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="name" className={isMobile ? 'text-xs' : ''}>Nom complet</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="email" className={isMobile ? 'text-xs' : ''}>Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="phone" className={isMobile ? 'text-xs' : ''}>Téléphone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="property_reference" className={isMobile ? 'text-xs' : ''}>Référence Propriété</Label>
          <Input id="property_reference" name="property_reference" value={formData.property_reference} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="source" className={isMobile ? 'text-xs' : ''}>Source</Label>
          <Select value={formData.source} onValueChange={handleSourceChange}>
            <SelectTrigger className={isMobile ? 'h-8 text-sm' : ''} id="source">
              <SelectValue placeholder="Sélectionner une source" />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <TeamMemberSelect 
          value={formData.assigned_to}
          onChange={(value) => handleInputChange({ 
            target: { name: 'assigned_to', value } 
          } as React.ChangeEvent<HTMLInputElement>)}
        />
      </div>
      
      <div className="space-y-1 md:space-y-2">
        <Label htmlFor="message" className={isMobile ? 'text-xs' : ''}>Message</Label>
        <Textarea id="message" name="message" rows={isMobile ? 3 : 4} value={formData.message} onChange={handleInputChange} className={isMobile ? 'text-sm' : ''} />
      </div>
      
      <Button type="submit" className={`w-full bg-loro-navy hover:bg-loro-navy/90 ${isMobile ? 'h-9 text-sm' : ''}`} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importation en cours...
          </>
        ) : "Importer le lead"}
      </Button>
    </form>
  );
};

export default ManualImportForm;
