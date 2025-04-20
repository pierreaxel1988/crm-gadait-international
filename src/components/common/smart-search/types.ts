
import { ReactNode } from 'react';

export interface SearchResult {
  id: string;
  [key: string]: any;
}

export interface SmartSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: any) => void;
  results?: any[];
  isLoading?: boolean;
  renderItem?: (item: any) => ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  minChars?: number;
  className?: string;
  inputClassName?: string;
  searchIcon?: boolean;
  clearButton?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  disabled?: boolean;
}
