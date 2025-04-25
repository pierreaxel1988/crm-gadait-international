
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownAZ, Clock, Tag } from 'lucide-react';
import { SortingControlsProps } from '../types/pipelineTypes';

const SortingControls: React.FC<SortingControlsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex justify-end mb-4">
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as "priority" | "newest" | "oldest")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span>Priorité</span>
            </div>
          </SelectItem>
          <SelectItem value="newest">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Plus récent</span>
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Plus ancien</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortingControls;
