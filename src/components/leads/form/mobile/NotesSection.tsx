import React, { useState, useEffect, useRef } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Clock, Check, Mic, MicOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const toggleVoiceRecording = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const audioChunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Conversion du blob en base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (base64Audio) {
            try {
              toast({
                title: "Transcription",
                description: "Transcription en cours..."
              });
              
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });
              
              if (error) throw error;
              
              toast({
                title: "Transcription terminée",
                description: "Le texte a été ajouté à vos notes"
              });
              
              if (data.text) {
                setNotes(prev => prev ? `${prev} ${data.text}` : data.text);
              }
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Échec de la transcription",
                description: "Impossible de traiter l'audio. Veuillez réessayer."
              });
              console.error('Error transcribing audio:', error);
            }
          }
        };
        
        // Arrêt des flux audio
        stream.getTracks().forEach(track => track.stop());
      });
      
      recorder.start();
      setIsRecording(true);
      toast({
        title: "Enregistrement audio démarré",
        description: "Parlez clairement. Cliquez à nouveau pour arrêter."
      });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Accès au microphone refusé",
        description: "Veuillez autoriser l'accès au microphone."
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800">Notes & Observations</h2>
        
        {lastSaved && !isModified && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Enregistré {getLastSavedText()}</span>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-loro-night rounded-md border shadow-sm p-1">
        <ScrollArea className="h-[200px] w-full rounded-sm">
          <Textarea
            ref={textareaRef}
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Notez ici les détails importants, besoins spécifiques, préférences, objections..."
            className="w-full min-h-[200px] font-futura border-none focus-visible:ring-0 resize-none p-2 text-sm leading-relaxed transition-colors scrollbar-thin overflow-auto"
            style={{ scrollBehavior: 'smooth' }}
          />
        </ScrollArea>
        
        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">{characterCount} caractères</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleVoiceRecording}
              className={`rounded-full h-8 w-8 transition-colors duration-200 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-gray-100'}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSaveNotes}
            disabled={localSaving || !isModified}
            className={`transition-all duration-200 ${isModified ? 'bg-chocolate-dark text-white' : 'bg-gray-100 text-gray-400'}`}
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
