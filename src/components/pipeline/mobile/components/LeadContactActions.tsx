
import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadContactActionsProps {
  phone?: string;
  email?: string;
}

const LeadContactActions: React.FC<LeadContactActionsProps> = ({ phone, email }) => {
  // Stop propagation to prevent card click when clicking on contact buttons
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  const handleEmail = () => {
    if (email) {
      window.open(`mailto:${email}`);
    }
  };

  return (
    <div className="flex space-x-2">
      {phone && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => handleButtonClick(e, handleCall)}
        >
          <Phone className="h-3.5 w-3.5" />
        </Button>
      )}
      {email && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => handleButtonClick(e, handleEmail)}
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default LeadContactActions;
