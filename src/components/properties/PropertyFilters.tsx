
import React, { useState } from 'react';
import { Search, Home, MapPin, Euro, Bed, Bath, Square, Filter, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PropertyFilter } from '@/types/property';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CustomButton from '@/components/ui/CustomButton';

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilter) => void;
  onSync?: () => void;
  syncing?: boolean;
}

const PropertyFilters = ({ onFilterChange, onSync, syncing = false }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = <K extends keyof PropertyFilter>(key: K, value: PropertyFilter[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="luxury-card p-4 md:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Recherche de propriétés</h2>
        {onSync && (
          <CustomButton
            variant="outline"
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </CustomButton>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par titre..."
              className="pl-9"
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              value={filters.searchTerm || ''}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <CustomButton
            variant="chocolate"
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </CustomButton>
          
          <Button
            variant="outline"
            onClick={handleReset}
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        value={expanded ? 'filters' : undefined}
        onValueChange={(value) => setExpanded(value === 'filters')}
      >
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Filtres avancés
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> Localisation
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Cannes, Paris..."
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  value={filters.location || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Home className="h-4 w-4 mr-1" /> Type de bien
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('property_type', value)}
                  value={filters.property_type || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Appartement">Appartement</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Maison">Maison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Bed className="h-4 w-4 mr-1" /> Chambres min.
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('minBedrooms', Number(value))}
                  value={filters.minBedrooms?.toString() || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Peu importe</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Bath className="h-4 w-4 mr-1" /> Salles de bain min.
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('minBathrooms', Number(value))}
                  value={filters.minBathrooms?.toString() || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Peu importe</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Euro className="h-4 w-4 mr-1" /> Prix min.
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('minPrice', Number(value))}
                  value={filters.minPrice?.toString() || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pas de minimum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Pas de minimum</SelectItem>
                    <SelectItem value="500000">500 000 €</SelectItem>
                    <SelectItem value="1000000">1 000 000 €</SelectItem>
                    <SelectItem value="2000000">2 000 000 €</SelectItem>
                    <SelectItem value="5000000">5 000 000 €</SelectItem>
                    <SelectItem value="10000000">10 000 000 €</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Euro className="h-4 w-4 mr-1" /> Prix max.
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('maxPrice', Number(value))}
                  value={filters.maxPrice?.toString() || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pas de maximum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Pas de maximum</SelectItem>
                    <SelectItem value="1000000">1 000 000 €</SelectItem>
                    <SelectItem value="2000000">2 000 000 €</SelectItem>
                    <SelectItem value="5000000">5 000 000 €</SelectItem>
                    <SelectItem value="10000000">10 000 000 €</SelectItem>
                    <SelectItem value="20000000">20 000 000 €</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Square className="h-4 w-4 mr-1" /> Surface min. (m²)
                </label>
                <Select
                  onValueChange={(value) => handleFilterChange('minArea', Number(value))}
                  value={filters.minArea?.toString() || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Peu importe</SelectItem>
                    <SelectItem value="50">50+ m²</SelectItem>
                    <SelectItem value="100">100+ m²</SelectItem>
                    <SelectItem value="150">150+ m²</SelectItem>
                    <SelectItem value="200">200+ m²</SelectItem>
                    <SelectItem value="300">300+ m²</SelectItem>
                    <SelectItem value="500">500+ m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PropertyFilters;
