
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface ContactInfoProps {
  email: string;
  phone?: string;
}

const ContactInfo = ({ email, phone }: ContactInfoProps) => {
  return (
    <>
      <div className="mb-2 flex items-center text-xs text-gray-600">
        <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
        <span className="truncate">{email}</span>
      </div>
      
      {phone && (
        <div className="mb-2 flex items-center text-xs text-gray-600">
          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>{phone}</span>
        </div>
      )}
    </>
  );
};

export default ContactInfo;
