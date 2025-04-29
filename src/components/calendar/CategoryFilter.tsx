import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { Check } from 'lucide-react';
const CategoryFilter = () => {
  const {
    activeFilters,
    toggleFilter
  } = useCalendar();

  // Get background color for each category button
  const getBackgroundColorForCategory = (categoryValue: string): string => {
    const category = eventCategories.find(cat => cat.value === categoryValue);
    return category?.color || '#F5F5F0';
  };

  // Get text color for each category
  const getTextColorForCategory = (categoryValue: string): string => {
    switch (categoryValue) {
      case 'Call':
        return '#221F26';
      // Dark text for light background
      case 'Visites':
        return '#FFFFFF';
      // White text for purple
      case 'Compromis':
        return '#221F26';
      // Dark text for gold
      case 'Acte de vente':
        return '#FFFFFF';
      // White text for green
      case 'Contrat de Location':
        return '#FFFFFF';
      // White text for blue
      case 'Propositions':
        return '#FFFFFF';
      // White text for magenta
      case 'Follow up':
        return '#FFFFFF';
      // White text for pink
      case 'Estimation':
        return '#FFFFFF';
      // White text for teal
      case 'Prospection':
        return '#FFFFFF';
      // White text for red
      case 'Admin':
        return '#FFFFFF';
      // White text for gray
      default:
        return '#221F26';
    }
  };

  // Arrange categories in rows as shown in the image
  const categoryRows = [['Call', 'Visites', 'Compromis', 'Acte de vente'], ['Contrat de Location', 'Propositions', 'Follow up'], ['Estimation', 'Prospection', 'Admin']];
  return <Card className="bg-loro-white shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-futuraLight text-loro-terracotta text-base font-normal">Catégories</CardTitle>
        <CardDescription className="font-times text-chocolate-dark">
          Filtrer les événements par catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categoryRows.map((row, rowIndex) => <div key={rowIndex} className="flex flex-wrap gap-2 mb-2">
            {row.map(categoryValue => {
          const category = eventCategories.find(cat => cat.value === categoryValue);
          if (!category) return null;
          const isActive = activeFilters.includes(category.value);
          const backgroundColor = getBackgroundColorForCategory(category.value);
          const textColor = getTextColorForCategory(category.value);
          return <button key={category.value} onClick={() => toggleFilter(category.value)} style={{
            backgroundColor: backgroundColor,
            color: textColor,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${isActive ? 'rgba(211, 197, 180, 0.7)' : 'rgba(211, 197, 180, 0.3)'}`,
            transition: 'all 0.2s ease-out',
            ...(isActive ? {
              boxShadow: '0 2px 5px rgba(139, 111, 78, 0.1)',
              transform: 'translateY(-1px)'
            } : {})
          }} className="text-loro-navy bg-loro-sand rounded-md">
                  {category.name}
                  {isActive && <Check className="h-3.5 w-3.5" style={{
              color: textColor
            }} />}
                </button>;
        })}
          </div>)}
      </CardContent>
    </Card>;
};
export default CategoryFilter;