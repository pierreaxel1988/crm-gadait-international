import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { ViewType } from '@/types/lead';

interface ViewTypeFilterProps {
  selectedViews: ViewType[];
  onViewsChange: (views: ViewType[]) => void;
}

const availableViews: ViewType[] = [
  'Mer',
  'Montagne', 
  'Golf',
  'Autres'
];

const ViewTypeFilter: React.FC<ViewTypeFilterProps> = ({
  selectedViews,
  onViewsChange
}) => {
  const toggleView = (view: ViewType) => {
    if (selectedViews.includes(view)) {
      onViewsChange(selectedViews.filter(v => v !== view));
    } else {
      onViewsChange([...selectedViews, view]);
    }
  };

  const clearViews = () => {
    onViewsChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-futura font-medium text-loro-navy flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Vues
          {selectedViews.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {selectedViews.length}
            </span>
          )}
        </h4>
        {selectedViews.length > 0 && (
          <button
            onClick={clearViews}
            className="text-xs text-loro-navy/60 hover:text-loro-navy font-futura"
          >
            Effacer
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableViews.map((view) => (
          <Badge
            key={view}
            variant={selectedViews.includes(view) ? "default" : "outline"}
            className={`cursor-pointer font-futura transition-all duration-200 ${
              selectedViews.includes(view)
                ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
            }`}
            onClick={() => toggleView(view)}
          >
            {view}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ViewTypeFilter;