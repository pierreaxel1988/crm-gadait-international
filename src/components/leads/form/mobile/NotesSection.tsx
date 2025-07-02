
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';

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
  const [localNotes, setLocalNotes] = useState(lead.notes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  
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

  // Update local state when lead changes from outside
  useEffect(() => {
    setLocalNotes(lead.notes || '');
    setHasUnsavedChanges(false);
  }, [lead.notes]);

  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
    setHasUnsavedChanges(value !== (lead.notes || ''));
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    onDataChange({ notes: localNotes });
    
    // Simulate save completion
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setShowSaved(true);
      
      // Hide the saved indicator after 2 seconds
      setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    }, 500);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-6">Notes</h2>
        
        {/* Save button with elegant styling similar to actions menu */}
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`
            h-8 w-8 rounded-full p-0 transition-all duration-200
            ${hasUnsavedChanges 
              ? 'bg-loro-terracotta hover:bg-loro-terracotta/90 text-white shadow-sm' 
              : 'bg-loro-pearl/50 text-loro-navy/50 cursor-not-allowed'
            }
            ${showSaved ? 'bg-green-500 hover:bg-green-500' : ''}
          `}
          title={hasUnsavedChanges ? "Sauvegarder les notes" : "Aucune modification à sauvegarder"}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : showSaved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">Notes générales</Label>
        <Textarea
          id="notes"
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Ajouter des notes concernant ce lead..."
          className="min-h-[300px] font-futura"
        />
        
        {hasUnsavedChanges && (
          <p className="text-xs text-loro-terracotta flex items-center gap-1">
            <div className="w-2 h-2 bg-loro-terracotta rounded-full animate-pulse" />
            Modifications non sauvegardées
          </p>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
