
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CallManagementProps {
  name: string;
  phone?: string;
  isCallDialogOpen: boolean;
  setIsCallDialogOpen: (isOpen: boolean) => void;
  callStatus: 'idle' | 'calling' | 'completed' | 'failed';
  callDuration: number;
  formatDuration: (seconds: number) => string;
  endCall: (status: 'completed' | 'failed') => void;
}

const CallManagement: React.FC<CallManagementProps> = ({
  name,
  phone,
  isCallDialogOpen,
  setIsCallDialogOpen,
  callStatus,
  callDuration,
  formatDuration,
  endCall,
}) => {
  return (
    <AlertDialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {callStatus === 'calling' ? 'Appel en cours...' : 
             callStatus === 'completed' ? 'Appel terminé' : 
             callStatus === 'failed' ? 'Appel échoué' : 'Appel'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {callStatus === 'calling' ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="animate-pulse bg-green-100 rounded-full p-4">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p>En appel avec {name}</p>
                <p className="text-2xl font-semibold mt-2">{formatDuration(callDuration)}</p>
              </div>
            ) : callStatus === 'completed' ? (
              <p>L'appel a été enregistré avec succès.</p>
            ) : callStatus === 'failed' ? (
              <p>L'appel n'a pas pu être effectué.</p>
            ) : (
              <div>
                <p>Comment souhaitez-vous contacter {name}?</p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-16 w-16 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 mb-2"
                      onClick={() => {
                        setIsCallDialogOpen(false);
                        if (phone) {
                          window.location.href = `tel:${phone}`;
                        }
                      }}
                    >
                      <Phone className="h-6 w-6 text-green-600" />
                    </Button>
                    <p className="text-sm">Téléphone</p>
                  </div>
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-16 w-16 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 mb-2"
                      onClick={() => {
                        setIsCallDialogOpen(false);
                        if (phone) {
                          const cleanedPhone = phone.replace(/[^\d+]/g, '');
                          window.open(`https://wa.me/${cleanedPhone}`, '_blank');
                        }
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-green-600" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
                      </svg>
                    </Button>
                    <p className="text-sm">WhatsApp</p>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {callStatus === 'calling' ? (
            <>
              <AlertDialogCancel onClick={() => endCall('failed')}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => endCall('completed')} className="bg-green-600 hover:bg-green-700">
                Terminer l'appel
              </AlertDialogAction>
            </>
          ) : callStatus === 'completed' || callStatus === 'failed' ? (
            <AlertDialogAction onClick={() => setIsCallDialogOpen(false)}>OK</AlertDialogAction>
          ) : (
            <AlertDialogCancel>Annuler</AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CallManagement;
