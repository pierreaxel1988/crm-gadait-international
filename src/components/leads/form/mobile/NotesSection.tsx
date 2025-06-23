
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-6">Notes</h2>
      
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">Notes générales</Label>
        <Textarea
          id="notes"
          value={lead.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Ajouter des notes concernant ce lead..."
          className="min-h-[300px] font-futura" // Augmenté de 200px à 300px
        />
      </div>
    </div>
  );
};

export default NotesSection;
