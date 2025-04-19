import React, { useState } from 'react';
import { Mail, Phone, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { TaskType } from '@/components/kanban/KanbanCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactInfoProps {
  email: string;
  phone?: string;
  leadId?: string;
}

const ContactInfo = ({ email, phone, leadId }: ContactInfoProps) => {
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TaskType | null>(null);
  const [actionDate, setActionDate] = useState<Date | undefined>(undefined);
  const [actionTime, setActionTime] = useState<string>('12:00');
  const [actionNotes, setActionNotes] = useState<string>('');

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (leadId) {
      setIsActionDialogOpen(true);
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on email
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on phone
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (phone) {
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const getActionTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Call': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-futura">Admin</span>;
      default: return null;
    }
  };

  const handleActionConfirm = async () => {
    if (leadId && selectedAction) {
      try {
        let scheduledDateTime = undefined;
        if (actionDate) {
          const [hours, minutes] = actionTime.split(':').map(part => parseInt(part, 10));
          const dateTime = new Date(actionDate);
          dateTime.setHours(hours, minutes);
          scheduledDateTime = dateTime.toISOString();
        }
        
        await addActionToLead(leadId, {
          actionType: selectedAction,
          scheduledDate: scheduledDateTime,
          notes: actionNotes
        });
        
        toast({
          title: "Action ajoutée",
          description: `${selectedAction} a été ajouté${
            scheduledDateTime ? ` pour le ${format(new Date(scheduledDateTime), 'dd/MM/yyyy à HH:mm')}` : ''
          }`
        });
        
        setIsActionDialogOpen(false);
        
        // Navigate to the lead detail page to see the updated actions
        navigate(`/leads/${leadId}`);
      } catch (error) {
        console.error("Error in handleActionConfirm:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      }
    }
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="flex items-center gap-2 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                onClick={handleEmailClick}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Envoyer un email à {email}</p>
            </TooltipContent>
          </Tooltip>
          
          {phone && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                    onClick={handlePhoneClick}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Appeler {phone}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                    onClick={handleWhatsAppClick}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4"
                      viewBox="0 0 50 50"
                      fill="currentColor"
                    >
                      <path d="M25 2C12.309 2 2 12.309 2 25c0 4.418 1.293 8.519 3.516 11.984L2.05 47.95l11.047-3.48C16.481 46.707 20.582 48 25 48c12.691 0 23-10.309 23-23S37.691 2 25 2zm0 42c-4.019 0-7.777-1.176-10.902-3.199l-.777-.481-6.566 2.07 2.116-6.64-.504-.815C6.587 32.074 5.5 28.626 5.5 25c0-10.752 8.748-19.5 19.5-19.5S44.5 14.248 44.5 25 35.752 44 25 44zm10.053-13.969c-.547-.273-3.234-1.594-3.738-1.777-.504-.186-.872-.273-1.242.273-.367.547-1.418 1.777-1.738 2.145-.32.367-.641.414-1.188.141-.547-.273-2.309-.848-4.402-2.695-1.625-1.449-2.723-3.234-3.043-3.781-.32-.547-.035-.844.24-1.117.25-.25.547-.641.82-.961.273-.32.363-.547.547-.914.183-.367.09-.688-.047-.961-.137-.273-1.242-2.992-1.703-4.117-.449-1.078-.91-.934-1.242-.949l-1.055-.02c-.367 0-.961.137-1.465.688-.504.547-1.934 1.887-1.934 4.594 0 2.707 1.98 5.32 2.254 5.68.273.359 3.9 5.945 9.453 8.066.813.348 1.445.555 1.938.711.813.258 1.555.219 2.137.133.652-.098 2.004-.82 2.289-1.613.281-.793.281-1.473.195-1.613-.086-.141-.5-.219-1.047-.492z"/>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contacter via WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {leadId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                  onClick={handleAddAction}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ajouter une action</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {isActionDialogOpen && (
        <ActionDialog
          isOpen={isActionDialogOpen}
          onClose={() => setIsActionDialogOpen(false)}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          actionDate={actionDate}
          setActionDate={setActionDate}
          actionTime={actionTime}
          setActionTime={setActionTime}
          actionNotes={actionNotes}
          setActionNotes={setActionNotes}
          onConfirm={handleActionConfirm}
          getActionTypeIcon={getActionTypeIcon}
        />
      )}
    </div>
  );
};

export default ContactInfo;
