
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
      <div className="mb-2 flex items-center text-xs text-gray-600">
        <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
        <a 
          href={`mailto:${email}`}
          className="truncate hover:text-blue-600 transition-colors"
          onClick={handleEmailClick}
        >
          {email}
        </a>
      </div>
      
      {phone && (
        <div className="mb-2 flex items-center text-xs text-gray-600">
          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <a 
            href={`tel:${phone}`}
            className="hover:text-blue-600 transition-colors"
            onClick={handlePhoneClick}
          >
            {phone}
          </a>
        </div>
      )}

      {leadId && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background shadow-sm hover:bg-gray-100"
          onClick={handleAddAction}
          title="Ajouter une action"
        >
          <PlusCircle className="h-4 w-4 text-gray-600" />
        </Button>
      )}
    </div>
  );
};

export default ContactInfo;
