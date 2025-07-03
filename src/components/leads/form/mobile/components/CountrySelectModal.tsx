import React, { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Country {
  value: string;
  label: string;
  flag: string;
}

interface CountrySelectModalProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const countries: Country[] = [
  { value: "France", label: "France", flag: "🇫🇷" },
  { value: "Spain", label: "Espagne", flag: "🇪🇸" },
  { value: "Portugal", label: "Portugal", flag: "🇵🇹" },
  { value: "Italy", label: "Italie", flag: "🇮🇹" },
  { value: "Switzerland", label: "Suisse", flag: "🇨🇭" },
  { value: "Monaco", label: "Monaco", flag: "🇲🇨" },
  { value: "United States", label: "États-Unis", flag: "🇺🇸" },
  { value: "Etats-Unis", label: "États-Unis", flag: "🇺🇸" },
  { value: "Grèce", label: "Grèce", flag: "🇬🇷" },
  { value: "Mauritius", label: "Île Maurice", flag: "🇲🇺" },
  { value: "UAE", label: "Émirats Arabes Unis", flag: "🇦🇪" },
  { value: "Germany", label: "Allemagne", flag: "🇩🇪" },
  { value: "Belgium", label: "Belgique", flag: "🇧🇪" },
  { value: "Luxembourg", label: "Luxembourg", flag: "🇱🇺" },
  { value: "Netherlands", label: "Pays-Bas", flag: "🇳🇱" },
  { value: "United Kingdom", label: "Royaume-Uni", flag: "🇬🇧" },
  { value: "Canada", label: "Canada", flag: "🇨🇦" },
  { value: "Australia", label: "Australie", flag: "🇦🇺" },
  { value: "Japan", label: "Japon", flag: "🇯🇵" },
  { value: "Singapore", label: "Singapour", flag: "🇸🇬" },
  { value: "Hong Kong", label: "Hong Kong", flag: "🇭🇰" },
  { value: "Brazil", label: "Brésil", flag: "🇧🇷" },
  { value: "Mexico", label: "Mexique", flag: "🇲🇽" },
  { value: "Argentina", label: "Argentine", flag: "🇦🇷" },
  { value: "South Africa", label: "Afrique du Sud", flag: "🇿🇦" },
  { value: "Morocco", label: "Maroc", flag: "🇲🇦" },
  { value: "Tunisia", label: "Tunisie", flag: "🇹🇳" },
  { value: "Algeria", label: "Algérie", flag: "🇩🇿" }
];

const CountrySelectModal: React.FC<CountrySelectModalProps> = ({
  value,
  onChange,
  placeholder = "Sélectionner un pays"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountry = countries.find(country => country.value === value);
  
  const filteredCountries = countries.filter(country =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (countryValue: string) => {
    onChange(countryValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-chocolate-dark focus:border-transparent transition duration-200 ease-in-out"
      >
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-loro-terracotta" />
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-gray-800 font-futura">{selectedCountry.label}</span>
            </div>
          ) : (
            <span className="text-gray-500 font-futura">{placeholder}</span>
          )}
        </div>
        <MapPin className="h-4 w-4 text-gray-400" />
      </button>

      {/* Full Screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-full w-full h-full max-h-screen p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-loro-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-futura text-chocolate-dark flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sélectionner un pays
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-futura"
                autoFocus
              />
            </div>
          </DialogHeader>

          {/* Countries List */}
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCountries.map((country) => (
                <button
                  key={country.value}
                  onClick={() => handleSelect(country.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    value === country.value
                      ? 'bg-chocolate-dark text-white border-chocolate-dark shadow-lg'
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{country.flag}</span>
                  <span className={`font-futura text-left ${
                    value === country.value ? 'text-white' : 'text-gray-800'
                  }`}>
                    {country.label}
                  </span>
                  {value === country.value && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-futura">Aucun pays trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Essayez avec un autre terme de recherche</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CountrySelectModal;