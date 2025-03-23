
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { eventCategories } from '@/contexts/CalendarContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

const CategoryFilter = () => {
  const { activeFilters, toggleFilter } = useCalendar();

  return (
    <Card className="bg-white shadow-luxury">
      <CardContent className="p-4">
        <div className="flex items-center mb-2 gap-2">
          <Filter className="h-4 w-4 text-loro-navy" />
          <span className="font-futura text-sm">Filtrer par type d'action</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {eventCategories.map(category => (
            <Badge
              key={category.value}
              variant="outline"
              className={`cursor-pointer border-2 transition-colors font-futura ${
                activeFilters.includes(category.value) 
                  ? 'bg-opacity-30'
                  : 'bg-white opacity-60'
              }`}
              style={{
                backgroundColor: activeFilters.includes(category.value) ? `${category.color}70` : '',
                borderColor: category.color
              }}
              onClick={() => toggleFilter(category.value)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
