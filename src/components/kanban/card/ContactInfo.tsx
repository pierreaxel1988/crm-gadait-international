import React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskType } from '@/types/actionHistory';

interface ContactInfoProps {
  email?: string;
  phone?: string;
  leadId?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ email, phone, leadId }) => {
  const handleEmailClick = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handlePhoneClick = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      {email && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start pl-2 text-left font-normal hover:bg-gray-100"
          onClick={handleEmailClick}
        >
          <Mail className="h-4 w-4 mr-2" />
          {email}
        </Button>
      )}
      {phone && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start pl-2 text-left font-normal hover:bg-gray-100"
          onClick={handlePhoneClick}
        >
          <Phone className="h-4 w-4 mr-2" />
          {phone}
        </Button>
      )}
      {leadId && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start pl-2 text-left font-normal hover:bg-gray-100"
          onClick={() => window.open(`/leads/${leadId}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Voir le lead
        </Button>
      )}
    </div>
  );
};

export default ContactInfo;

