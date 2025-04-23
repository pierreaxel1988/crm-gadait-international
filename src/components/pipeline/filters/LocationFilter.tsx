
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getAllLocations } from '@/utils/locationsByCountry';
import SmartSearch from '@/components/common/SmartSearch';

interface LocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationFilter = ({ location, onLocationChange }: LocationFilterProps) => {
  const [searchTerm, setSearchTerm] = useState(location);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  
  // Get all available locations
  const allLocations = getAllLocations();

  // Load recent locations from localStorage on component mount
  useEffect(() => {
    try {
      const storedLocations = localStorage.getItem('recentLocations');
      if (storedLocations) {
        setRecentLocations(JSON.parse(storedLocations).slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
    }
  }, []);

  useEffect(() => {
    // Update filtered locations when search term changes
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // First show exact matches
      const exactMatches = allLocations.filter(loc => {
        const normalizedLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedLoc === normalizedSearchTerm;
      });
      
      // Then show partial matches
      const partialMatches = allLocations.filter(loc => {
        const normalizedLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedLoc.includes(normalizedSearchTerm) && !exactMatches.includes(loc);
      });
      
      // Combine exact and partial matches with a limit of 10
      const combined = [...exactMatches, ...partialMatches].slice(0, 10);
      setFilteredLocations(combined);
    } else {
      // When search is empty, show recent locations
      setFilteredLocations(recentLocations);
    }
  }, [searchTerm, allLocations, recentLocations]);

  const handleLocationSelect = (location: string) => {
    // Update location in parent component
    onLocationChange(location);
    
    // Update recent locations
    const updatedRecents = [location, ...recentLocations.filter(loc => loc !== location)].slice(0, 5);
    setRecentLocations(updatedRecents);
    
    try {
      localStorage.setItem('recentLocations', JSON.stringify(updatedRecents));
    } catch (error) {
      console.error('Error saving recent locations:', error);
    }
  };

  const renderLocationItem = (location: string) => {
    const isRecent = recentLocations.includes(location) && searchTerm === '';
    
    return (
      <div className="text-sm py-1 flex items-center justify-between">
        <span>{location}</span>
        {isRecent && <span className="text-xs text-muted-foreground">Récent</span>}
      </div>
    );
  };

  const renderNoResults = () => {
    if (searchTerm && filteredLocations.length === 0) {
      return (
        <div className="text-sm py-2 px-2 text-muted-foreground italic">
          Aucun résultat trouvé
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Localisation
      </h4>
      <div className="relative">
        <SmartSearch
          placeholder="Ville, région, pays..."
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            // Update filter value directly when typing
            onLocationChange(value);
          }}
          onSelect={handleLocationSelect}
          results={filteredLocations}
          renderItem={renderLocationItem}
          emptyMessage="Aucun résultat trouvé"
          className="w-full"
          inputClassName="h-9 text-sm"
          minChars={0} // Show recent locations even when empty
          searchIcon={true}
          clearButton={true}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Saisissez une localisation pour voir des suggestions
        </div>
      </div>
    </div>
  );
};

export default LocationFilter;
