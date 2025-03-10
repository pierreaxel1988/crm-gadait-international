
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyGrid from '@/components/properties/PropertyGrid';
import { Property, PropertyFilter } from '@/types/property';
import { getProperties, syncProperties } from '@/services/propertyService';
import CustomButton from '@/components/ui/CustomButton';
import { Plus } from 'lucide-react';

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const navigate = useNavigate();

  const fetchProperties = async (currentFilters: PropertyFilter = {}) => {
    setLoading(true);
    try {
      const data = await getProperties(currentFilters);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (newFilters: PropertyFilter) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncProperties();
      fetchProperties(filters);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-times text-loro-navy">Propriétés</h1>
        <CustomButton
          variant="chocolate"
          onClick={() => navigate('/lead-selection')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Créer une sélection
        </CustomButton>
      </div>
      
      <PropertyFilters
        onFilterChange={handleFilterChange}
        onSync={handleSync}
        syncing={syncing}
      />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-chocolate-dark border-t-transparent"></div>
        </div>
      ) : (
        <PropertyGrid properties={properties} />
      )}
    </div>
  );
};

export default Properties;
