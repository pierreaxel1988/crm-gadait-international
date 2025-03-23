
import React, { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface NotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ lead, onDataChange }) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const [localSaving, setLocalSaving] = useState(false);

  const handleSaveNotes = () => {
    setLocalSaving(true);
    onDataChange({ notes });
    setTimeout(() => setLocalSaving(false), 500);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-loro-navy mb-4">Notes & Observations</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm">Notes générales</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Besoins spécifiques, préférences, objections..."
            className="w-full min-h-[200px] font-futura"
          />
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSaveNotes}
              disabled={localSaving || notes === lead.notes}
              className="mt-2"
            >
              {localSaving ? 
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> 
                : 
                <>
                  <Save className="h-4 w-4 mr-1" />
                  <span>Enregistrer les notes</span>
                </>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
