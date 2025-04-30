
import React from 'react';
import SmartSearch from '@/components/common/SmartSearch';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

const SearchInput = ({ searchTerm, onSearchChange, onClearSearch }: SearchInputProps) => {
  return (
    <SmartSearch
      placeholder="Rechercher un agent..."
      value={searchTerm}
      onChange={onSearchChange}
      className="w-full"
      inputClassName="border border-gray-200 rounded-md font-futura pl-10"
      minChars={1}
      clearButton={true}
      searchIcon={true}
      onClear={onClearSearch}
    />
  );
};

export default SearchInput;
