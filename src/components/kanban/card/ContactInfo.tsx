
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
  phoneCountryCode?: string;
  leadId?: string;
}

const ContactInfo = ({ email, phone, phoneCountryCode, leadId }: ContactInfoProps) => {
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
      let phoneWithCode = phone;
      
      // If we have a country code and the phone doesn't start with +, prepend the country code
      if (phoneCountryCode && !phone.startsWith('+')) {
        // Make sure the country code has a + prefix
        const countryCode = phoneCountryCode.startsWith('+') 
          ? phoneCountryCode 
          : `+${phoneCountryCode}`;
          
        // Remove leading zeros from the phone number when adding international code
        const phoneWithoutLeadingZeros = phone.replace(/^0+/, '');
        phoneWithCode = `${countryCode}${phoneWithoutLeadingZeros}`;
      }
      
      // Clean the phone number for WhatsApp
      const cleanedPhone = phoneWithCode.replace(/[^\d+]/g, '');
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contacter via WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </>
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
