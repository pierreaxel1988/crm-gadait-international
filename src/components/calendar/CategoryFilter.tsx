
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { Check } from 'lucide-react';

const CategoryFilter = () => {
  const {
    activeFilters,
    toggleFilter
  } = useCalendar();

  // Get text color for each category
  const getTextColorForCategory = (categoryValue: string): string => {
    switch (categoryValue) {
      case 'Call': return '#C55F3E';
      case 'Visites': return '#9B51E0';
      case 'Compromis': return '#E8B64B';
      case 'Acte de vente': return '#4CAF50';
      case 'Contrat de Location': return '#3D8FD1';
      case 'Propositions': return '#9C27B0';
      case 'Follow up': return '#E91E63';
      case 'Estimation': return '#009688';
      case 'Prospection': return '#F44336';
      case 'Admin': return '#607D8B';
      default: return '#607D8B';
    }
  };

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
            const textColor = getTextColorForCategory(category.value);
            return (
              <button
                key={category.value}
                onClick={() => toggleFilter(category.value)}
                className={`flex items-center gap-2 rounded-full py-1 px-3 text-sm font-normal transition-all max-w-fit
                  ${isActive ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: category.color,
                  color: textColor,
                  borderColor: isActive ? `${textColor}30` : 'transparent',
                  border: '1px solid',
                  ...(isActive ? { ringColor: textColor } : {})
                }}
              >
                {category.name}
                {isActive && <Check className="h-3 w-3" style={{ color: textColor }} />}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
