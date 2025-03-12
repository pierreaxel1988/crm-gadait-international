
import React from 'react';
import { Search } from 'lucide-react';

interface LeadsSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const LeadsSearchBar: React.FC<LeadsSearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Rechercher des leads..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="luxury-input pl-10 w-full"
      />
    </div>
  );
};

export default LeadsSearchBar;
