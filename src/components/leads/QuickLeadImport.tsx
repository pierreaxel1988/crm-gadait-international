
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { PropertyType, PipelineType } from '@/types/lead';

const QuickLeadImport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    propertyReference: '',
    budget: '',
    desiredLocation: '',
    propertyType: '',
    bedrooms: '',
    nationality: '',
    country: '',
    notes: '',
    url: '',
    pipelineType: 'purchase' as PipelineType
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newLeadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location || formData.country || '',
        status: "New" as LeadStatus,
        tags: ["Manual Import"] as LeadTag[],
        propertyReference: formData.propertyReference,
        budget: formData.budget,
        desiredLocation: formData.desiredLocation,
        propertyType: formData.propertyType as PropertyType,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        nationality: formData.nationality,
        country: formData.country,
        notes: formData.notes,
        url: formData.url,
        pipelineType: formData.pipelineType
      };

      const createdLead = await createLead(newLeadData);

      toast({
        title: "Lead créé",
        description: "Le lead a été créé avec succès."
      });

      navigate(`/leads/${createdLead.id}`);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Import rapide de lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name')(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email')(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country')(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pipeline">Pipeline</Label>
              <Select value={formData.pipelineType} onValueChange={handleInputChange('pipelineType')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Achat</SelectItem>
                  <SelectItem value="rental">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyType">Type de propriété</Label>
                <Select value={formData.propertyType} onValueChange={handleInputChange('propertyType')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Apartment">Appartement</SelectItem>
                    <SelectItem value="House">Maison</SelectItem>
                    <SelectItem value="Land">Terrain</SelectItem>
                    <SelectItem value="Other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms')(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget')(e.target.value)}
                placeholder="Ex: 500000"
              />
            </div>

            <div>
              <Label htmlFor="desiredLocation">Localisation souhaitée</Label>
              <Input
                id="desiredLocation"
                value={formData.desiredLocation}
                onChange={(e) => handleInputChange('desiredLocation')(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="propertyReference">Référence propriété</Label>
              <Input
                id="propertyReference"
                value={formData.propertyReference}
                onChange={(e) => handleInputChange('propertyReference')(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="url">URL de l'annonce</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url')(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes')(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Création...' : 'Créer le lead'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickLeadImport;
