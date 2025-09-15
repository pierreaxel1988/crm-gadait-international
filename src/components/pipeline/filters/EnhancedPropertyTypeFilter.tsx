import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Building, Crown, Mountain, House, 
  Building2, MapPin, Castle, RowsIcon, 
  Landmark, Store
} from 'lucide-react';
import { PropertyType } from '@/types/lead';

interface EnhancedPropertyTypeFilterProps {
  propertyType: PropertyType | null;
  onPropertyTypeChange: (propertyType: PropertyType | null) => void;
}

const EnhancedPropertyTypeFilter = ({ propertyType, onPropertyTypeChange }: EnhancedPropertyTypeFilterProps) => {
  const propertyTypes: Array<{ value: PropertyType | null; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: null, label: 'Tous les types', icon: Home },
    { value: 'Villa', label: 'Villa', icon: House },
    { value: 'Appartement', label: 'Appartement', icon: Building },
    { value: 'Penthouse', label: 'Penthouse', icon: Crown },
    { value: 'Chalet', label: 'Chalet', icon: Mountain },
    { value: 'Maison', label: 'Maison', icon: Home },
    { value: 'Duplex', label: 'Duplex', icon: Building2 },
    { value: 'Terrain', label: 'Terrain', icon: MapPin },
    { value: 'Manoir', label: 'Manoir', icon: Landmark },
    { value: 'Maison de ville', label: 'Maison de ville', icon: RowsIcon },
    { value: 'Château', label: 'Château', icon: Castle },
    { value: 'Local commercial', label: 'Local commercial', icon: Store }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Home className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Type de bien</h4>
        {propertyType && (
          <Badge variant="secondary" className="text-xs">
            {propertyType}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = propertyType === type.value;
          
          return (
            <Button
              key={type.value || 'all'}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'shadow-md border-primary/50' 
                  : 'hover:border-primary/30 hover:shadow-sm'
              }`}
              onClick={() => onPropertyTypeChange(type.value)}
            >
              <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span className={`text-xs text-center font-medium leading-tight ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {type.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedPropertyTypeFilter;