
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface ContactInfoProps {
  email: string;
  phone?: string;
}

const ContactInfo = ({ email, phone }: ContactInfoProps) => {
  return (
    <>
      <div className="mb-2 flex items-center text-xs text-muted-foreground">
        <Mail className="h-3 w-3 mr-1" />
        <span className="truncate">{email}</span>
      </div>
      
      {phone && (
        <div className="mb-2 flex items-center text-xs text-muted-foreground">
          <Phone className="h-3 w-3 mr-1" />
          <span>{phone}</span>
        </div>
      )}
    </>
  );
};

export default ContactInfo;
