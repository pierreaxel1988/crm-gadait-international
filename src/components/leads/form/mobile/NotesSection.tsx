
import React, { useState, useEffect, useRef } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Clock, Check, Mic, MicOff, Calendar, CalendarClock } from 'lucide-react';
import { formatDistanceToNow, parseISO, format, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TaskType } from '@/components/kanban/KanbanCard';

interface NotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  onAddAction?: () => void;
}

interface DetectedAction {
  type: TaskType;
  date: Date;
  description: string;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  lead,
  onDataChange,
  onAddAction
}) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const [localSaving, setLocalSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isModified, setIsModified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [detectedAction, setDetectedAction] = useState<DetectedAction | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharacterCount(notes.length);
  }, [notes]);

  useEffect(() => {
    setIsModified(notes !== lead.notes);
  }, [notes, lead.notes]);

  // Analyser les notes pour détecter des dates et actions potentielles
  useEffect(() => {
    if (!notes || notes === lead.notes) return;

    // Attendre un peu après la frappe
    const timer = setTimeout(() => {
      analyzeNotesForActions(notes);
    }, 1000);

    return () => clearTimeout(timer);
  }, [notes]);

  const analyzeNotesForActions = (text: string) => {
    // Reset previous detection
    setDetectedAction(null);

    // Conversion en minuscules pour faciliter la détection
    const lowerText = text.toLowerCase();

    // Patterns pour détecter les dates
    const datePatterns = [
      // Format: le 14 avril
      { regex: /le (\d{1,2})[ ]?(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i, type: 'date' },
      // Format: 14 avril
      { regex: /(\d{1,2})[ ]?(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i, type: 'date' },
    ];

    // Patterns pour détecter les types d'actions
    const actionTypes = [
      { keywords: ['appeler', 'rappeler', 'téléphoner'], type: 'Call' as TaskType },
      { keywords: ['rendez-vous', 'rencontre', 'visite', 'visiter'], type: 'Visites' as TaskType },
      { keywords: ['compromis', 'vente'], type: 'Compromis' as TaskType },
      { keywords: ['acte', 'notaire', 'signature'], type: 'Acte de vente' as TaskType },
      { keywords: ['contrat', 'location', 'louer'], type: 'Contrat de Location' as TaskType },
      { keywords: ['proposition', 'proposer', 'offre'], type: 'Propositions' as TaskType },
      { keywords: ['suivre', 'suivi', 'rappel'], type: 'Follow up' as TaskType },
      { keywords: ['estimation', 'estimer', 'évaluation'], type: 'Estimation' as TaskType },
    ];

    // Détecter une date
    let detectedDate: Date | null = null;
    let dateMatch: RegExpMatchArray | null = null;

    for (const pattern of datePatterns) {
      dateMatch = text.match(pattern.regex);
      if (dateMatch) break;
    }

    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthName = dateMatch[2].toLowerCase();
      const monthMap: { [key: string]: number } = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5, 
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
      };
      
      const currentYear = new Date().getFullYear();
      const monthIndex = monthMap[monthName];
      
      if (monthIndex !== undefined) {
        detectedDate = new Date(currentYear, monthIndex, day);
        
        // Si la date est dans le passé, on considère que c'est l'année prochaine
        if (detectedDate < new Date()) {
          detectedDate.setFullYear(currentYear + 1);
        }
      }
    }

    // Détecter un type d'action
    let detectedActionType: TaskType | null = null;
    
    for (const actionType of actionTypes) {
      if (actionType.keywords.some(keyword => lowerText.includes(keyword))) {
        detectedActionType = actionType.type;
        break;
      }
    }

    // Si pas de type spécifique détecté mais une date, on considère que c'est un suivi
    if (!detectedActionType && detectedDate) {
      detectedActionType = 'Follow up';
    }

    // Détecter le moment de la journée pour l'heure
    let hour = 12; // Par défaut à midi
    if (lowerText.includes('matin')) {
      hour = 10;
    } else if (lowerText.includes('après-midi')) {
      hour = 14;
    } else if (lowerText.includes('soir')) {
      hour = 18;
    } else if (lowerText.includes('fin de matinée')) {
      hour = 11;
    } else if (lowerText.includes('début d\'après-midi')) {
      hour = 13;
    }

    // Si on a détecté une date et un type d'action, on propose une action
    if (detectedDate && detectedActionType) {
      detectedDate.setHours(hour, 0, 0, 0);
      
      setDetectedAction({
        type: detectedActionType,
        date: detectedDate,
        description: `Action détectée: ${detectedActionType} prévu ${format(detectedDate, 'le dd MMMM à HH:mm', {locale: fr})}`
      });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    if (!isModified) return;
    setLocalSaving(true);
    onDataChange({
      notes
    });
    setTimeout(() => {
      setLocalSaving(false);
      setLastSaved(new Date());
      setIsModified(false);
    }, 500);
  };

  const handleCreateActionFromDetection = () => {
    if (!detectedAction || !onAddAction) return;
    
    // Notifier l'utilisateur de la détection
    toast({
      title: "Action détectée",
      description: `Une action de type ${detectedAction.type} a été programmée pour ${format(detectedAction.date, 'le dd MMMM à HH:mm', {locale: fr})}`
    });

    // Déclencher l'ouverture du dialogue d'action
    onAddAction();

    // Réinitialiser la détection
    setDetectedAction(null);
  };

  const getLastSavedText = () => {
    if (!lastSaved) return '';
    return formatDistanceToNow(lastSaved, {
      addSuffix: true,
      locale: fr
    });
  };

  const toggleVoiceRecording = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const audioChunks: BlobPart[] = [];
      recorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });
      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, {
          type: 'audio/webm'
        });

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
              const {
                data,
                error
              } = await supabase.functions.invoke('voice-to-text', {
                body: {
                  audio: base64Audio
                }
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

  return <div className="space-y-4 pt-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">Notes & Observations</h2>
        
        {lastSaved && !isModified && <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span className="text-xs">Enregistré {getLastSavedText()}</span>
          </div>}
      </div>
      
      {detectedAction && (
        <div className="bg-loro-sand/20 border border-loro-sand rounded-md p-3 mb-2 animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-loro-navy" />
            <div className="text-xs text-loro-navy">
              <p className="font-medium">Action détectée dans votre note</p>
              <p>{detectedAction.type} prévu pour {format(detectedAction.date, 'le dd MMMM à HH:mm', {locale: fr})}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-transparent border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20"
            onClick={handleCreateActionFromDetection}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Créer l'action
          </Button>
        </div>
      )}
      
      <div className="bg-white dark:bg-loro-night rounded-md border shadow-sm p-1">
        {/* Amélioré la ScrollArea pour un défilement plus fluide */}
        <div className="h-[200px] w-full rounded-sm relative">
          <Textarea ref={textareaRef} id="notes" value={notes} onChange={handleNotesChange} placeholder="Notez ici les détails importants, besoins spécifiques, préférences, objections..." className="w-full h-[200px] font-futura border-none focus-visible:ring-0 resize-none p-2 text-sm leading-relaxed transition-colors overflow-auto" />
        </div>
        
        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">{characterCount} caractères</span>
            <Button size="icon" variant="ghost" onClick={toggleVoiceRecording} className={`rounded-full h-8 w-8 transition-colors duration-200 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-gray-100'}`}>
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button size="sm" onClick={handleSaveNotes} disabled={localSaving || !isModified} className={`transition-all duration-200 ${isModified ? 'bg-chocolate-dark text-white hover:bg-chocolate-dark/90' : 'bg-gray-100 text-gray-400'}`}>
            {localSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : isModified ? <>
                <Save className="h-4 w-4 mr-1" />
                <span>Enregistrer</span>
              </> : <>
                <Check className="h-4 w-4 mr-1" />
                <span>Enregistré</span>
              </>}
          </Button>
        </div>
      </div>
    </div>;
};

export default NotesSection;
