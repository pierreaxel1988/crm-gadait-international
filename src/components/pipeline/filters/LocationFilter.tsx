
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { getAllLocations } from '@/utils/locationsByCountry';

interface LocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationFilter = ({ location, onLocationChange }: LocationFilterProps) => {
  const [searchTerm, setSearchTerm] = useState(location);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get all available locations
  const allLocations = getAllLocations();

  useEffect(() => {
    // Update filtered locations when search term changes
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = allLocations.filter(loc => {
        const normalizedLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedLoc.includes(normalizedSearchTerm);
      }).slice(0, 10); // Limit to 10 suggestions
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [searchTerm, allLocations]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onLocationChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    // Small delay to allow suggestion click to work
    setTimeout(() => {
      if (searchTerm !== location) {
        onLocationChange(searchTerm);
      }
    }, 200);
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Localisation
      </h4>
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleInputBlur}
            placeholder="Ville, région, pays..."
            className="h-8 text-sm pr-8"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        {showSuggestions && filteredLocations.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredLocations.map((loc, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(loc)}
              >
                {loc}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationFilter;
