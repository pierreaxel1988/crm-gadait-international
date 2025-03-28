
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

const CategoryFilter = () => {
  const { activeFilters, toggleFilter } = useCalendar();

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base font-medium text-zinc-900">Filtrer par catégorie</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {eventCategories.map((category) => {
            const isActive = activeFilters.includes(category.value);
            return (
              <Badge
                key={category.value}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer select-none font-futura text-xs hover:opacity-90 transition-all shadow-sm"
                style={{
                  backgroundColor: isActive ? category.color : `${category.color}20`,
                  borderColor: category.color,
                  color: isActive ? 'white' : category.color,
                  fontWeight: isActive ? 600 : 500,
                  padding: '0.5rem 0.75rem',
                  borderWidth: '1px',
                  borderRadius: '1rem',
                }}
                onClick={() => toggleFilter(category.value)}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
