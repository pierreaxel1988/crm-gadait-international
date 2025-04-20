
import React from 'react';
import { X } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';

interface SelectedTagsListProps {
  selectedTags: LeadTag[];
  toggleTag: (tag: LeadTag) => void;
  clearAllTags: () => void;
}

const SelectedTagsList: React.FC<SelectedTagsListProps> = ({
  selectedTags,
  toggleTag,
  clearAllTags
}) => {
  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedTags.map((tag) => (
        <div key={tag} className="flex items-center gap-1">
          <TagBadge tag={tag} />
          <button 
            onClick={() => toggleTag(tag)}
            className="ml-1 bg-gray-200 dark:bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label={`Supprimer le tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        className="text-xs text-muted-foreground hover:text-foreground mt-2"
        onClick={clearAllTags}
        aria-label="Effacer tous les tags"
      >
        Tout effacer
      </button>
    </div>
  );
};

export default SelectedTagsList;
