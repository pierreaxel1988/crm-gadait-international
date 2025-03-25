
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ lead, onDataChange }) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const [localSaving, setLocalSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setCharacterCount(notes.length);
  }, [notes]);

  useEffect(() => {
    setIsModified(notes !== lead.notes);
  }, [notes, lead.notes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    if (!isModified) return;
    
    setLocalSaving(true);
    onDataChange({ notes });
    
    setTimeout(() => {
      setLocalSaving(false);
      setLastSaved(new Date());
      setIsModified(false);
    }, 500);
  };

  const getLastSavedText = () => {
    if (!lastSaved) return '';
    return formatDistanceToNow(lastSaved, { addSuffix: true, locale: fr });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-chocolate-dark mr-2" />
          <h2 className="text-lg font-medium text-loro-navy">Notes & Observations</h2>
        </div>
        
        {lastSaved && !isModified && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Enregistré {getLastSavedText()}</span>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-loro-night rounded-md border shadow-sm p-1">
        <Textarea
          id="notes"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Notez ici les détails importants, besoins spécifiques, préférences, objections..."
          className="w-full min-h-[200px] font-futura border-none focus-visible:ring-0 resize-none"
        />
        
        <div className="flex items-center justify-between p-2 border-t">
          <span className="text-xs text-gray-500">{characterCount} caractères</span>
          
          <Button 
            size="sm" 
            onClick={handleSaveNotes}
            disabled={localSaving || !isModified}
            className={`transition-all ${isModified ? 'bg-chocolate-dark text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {localSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> 
            ) : isModified ? (
              <>
                <Save className="h-4 w-4 mr-1" />
                <span>Enregistrer</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                <span>Enregistré</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
