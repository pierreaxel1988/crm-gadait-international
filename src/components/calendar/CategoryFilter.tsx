
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { Check } from 'lucide-react';

const CategoryFilter = () => {
  const {
    activeFilters,
    toggleFilter
  } = useCalendar();

  return (
    <Card className="bg-white shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-futuraLight text-loro-terracotta text-base font-normal">Catégories</CardTitle>
        <CardDescription className="font-times text-chocolate-dark">
          Filtrer les événements par catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {eventCategories.map(category => {
            const isActive = activeFilters.includes(category.value);
            return (
              <button
                key={category.value}
                onClick={() => toggleFilter(category.value)}
                className={`flex items-center gap-2 rounded-full py-1 px-3 text-sm font-medium transition-all 
                  ${isActive ? 'ring-2 ring-loro-terracotta ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
                style={{
                  backgroundColor: `${category.color}80` // 50% opacity
                }}
              >
                {category.name}
                {isActive && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
