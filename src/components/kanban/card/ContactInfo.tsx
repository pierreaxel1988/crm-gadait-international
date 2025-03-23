
import React from 'react';
import { Mail, Phone, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ContactInfoProps {
  email: string;
  phone?: string;
  leadId?: string;
}

const ContactInfo = ({ email, phone, leadId }: ContactInfoProps) => {
  const navigate = useNavigate();

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (leadId) {
      navigate(`/leads/${leadId}?action=new`);
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

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100"
          onClick={handleEmailClick}
          title={`Envoyer un email à ${email}`}
        >
          <Mail className="h-4 w-4 text-gray-600" />
        </Button>
        
        {phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={handlePhoneClick}
            title={`Appeler ${phone}`}
          >
            <Phone className="h-4 w-4 text-gray-600" />
          </Button>
        )}
        
        {leadId && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={handleAddAction}
            title="Ajouter une action"
          >
            <PlusCircle className="h-4 w-4 text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactInfo;
