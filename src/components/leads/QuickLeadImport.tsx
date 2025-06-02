
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LeadDetailed, LeadStatus, PipelineType, PropertyType } from '@/types/lead';
import { createLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

interface QuickLeadImportProps {
  onSuccess?: () => void;
}

const QuickLeadImport: React.FC<QuickLeadImportProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Partial<LeadDetailed>>({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'New' as LeadStatus,
    tags: [],
    propertyReference: '',
    budget: '',
    desiredLocation: '',
    propertyType: undefined,
    bedrooms: undefined,
    nationality: '',
    notes: '',
    pipelineType: 'purchase' as PipelineType,
    livingArea: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom et l'email sont requis."
      });
      return;
    }

    setLoading(true);

    const leadData = {
      ...formData,
      tags: ['Manual Import'],
      location: formData.location || 'Non spécifié',
    };

    try {
      await createLead(leadData as Omit<LeadDetailed, 'id' | 'createdAt'>);
      toast({
        title: "Lead créé",
        description: "Le lead a été créé avec succès."
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        status: 'New' as LeadStatus,
        tags: [],
        propertyReference: '',
        budget: '',
        desiredLocation: '',
        propertyType: undefined,
        bedrooms: undefined,
        nationality: '',
        notes: '',
        pipelineType: 'purchase' as PipelineType,
        livingArea: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Import rapide de lead
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom du contact"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ville, Pays"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">Nouveau</SelectItem>
                  <SelectItem value="Contacted">Contacté</SelectItem>
                  <SelectItem value="Qualified">Qualifié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="500.000€ - 1.000.000€"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création en cours...
              </>
            ) : (
              'Créer le lead'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickLeadImport;
