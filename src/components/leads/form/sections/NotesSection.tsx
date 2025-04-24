
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import FormSection from '../FormSection';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NotesSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <FormSection title="Notes">
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">Notes générales</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          placeholder="Ajouter des notes concernant ce lead..."
          className="min-h-[200px] font-futura"
        />
      </div>
    </FormSection>
  );
};

export default NotesSection;
