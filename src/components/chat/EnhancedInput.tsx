
import React, { useState, useRef } from 'react';
import { Mic, Paperclip, Send, Loader, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedInputProps {
  input: string;
  setInput: (input: string) => void;
  placeholder: string;
  isLoading: boolean;
  handleSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  input,
  setInput,
  placeholder,
  isLoading,
  handleSend,
  onKeyDown
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fonction pour gérer le collage de texte (déjà géré par le textarea natif)
  
  // Fonction pour gérer la saisie vocale
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
              toast.loading("Transcription en cours...");
              
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });
              
              if (error) throw error;
              
              toast.dismiss();
              toast.success("Transcription terminée");
              
              if (data.text) {
                setInput(prev => prev ? `${prev} ${data.text}` : data.text);
              }
            } catch (error) {
              toast.dismiss();
              toast.error("Échec de la transcription", {
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
      toast.info("Enregistrement audio démarré", {
        description: "Parlez clairement. Cliquez à nouveau sur le microphone pour arrêter."
      });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Accès au microphone refusé", {
        description: "Veuillez autoriser l'accès au microphone pour utiliser cette fonctionnalité."
      });
    }
  };
  
  // Fonction pour gérer l'upload de fichiers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux", {
        description: "La taille maximale autorisée est de 10MB."
      });
      return;
    }
    
    toast.loading(`Analyse du fichier ${file.name}...`);
    
    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64File = reader.result?.toString().split(',')[1];
        
        if (base64File) {
          const fileType = file.type;
          const fileName = file.name;
          
          const { data, error } = await supabase.functions.invoke('analyze-document', {
            body: { 
              fileContent: base64File,
              fileName: fileName,
              fileType: fileType
            }
          });
          
          if (error) throw error;
          
          toast.dismiss();
          toast.success("Analyse terminée");
          
          if (data.text) {
            setInput(prev => `${prev ? prev + '\n\n' : ''}Document analysé: ${fileName}\n${data.text}`);
          }
        }
      };
    } catch (error) {
      toast.dismiss();
      toast.error("Échec de l'analyse du document", {
        description: "Impossible d'analyser le document. Veuillez réessayer."
      });
      console.error('Error analyzing file:', error);
    }
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="relative border border-loro-sand rounded-md overflow-hidden">
      <Textarea
        className="resize-none pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[60px]"
        placeholder={placeholder}
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isLoading}
      />
      
      <div className="absolute right-2 bottom-2 flex items-center gap-2">
        {/* Input file caché */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf,image/jpeg,image/png,image/jpg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileUpload}
        />
        
        {/* Bouton d'upload de fichier */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-loro-pearl hover:bg-loro-sand text-loro-navy"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Joindre un fichier</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Bouton pour microphone */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${
                  isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-loro-pearl hover:bg-loro-sand text-loro-navy'
                }`}
                onClick={toggleVoiceRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? "Arrêter l'enregistrement" : "Dicter un message"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Bouton d'envoi */}
        <Button
          size="icon"
          className={`rounded-full h-8 w-8 ${input.trim() ? 'bg-loro-hazel hover:bg-loro-hazel/90' : 'bg-loro-sand/50'}`}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 
            <Loader className="h-4 w-4 animate-spin" /> : 
            <Send className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
};

export default EnhancedInput;
