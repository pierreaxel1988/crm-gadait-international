
import React from 'react';
import { Calendar, Phone, Users, MessageCircle, FileText } from 'lucide-react';

export const NotificationIcon: React.FC<{ actionType?: string }> = ({ actionType }) => {
  switch (actionType?.toLowerCase()) {
    case 'call':
      return <Phone size={16} className="text-blue-500" />;
    case 'meeting':
    case 'rdv':
      return <Users size={16} className="text-purple-500" />;
    case 'email':
      return <MessageCircle size={16} className="text-green-500" />;
    case 'followup':
      return <FileText size={16} className="text-amber-500" />;
    default:
      return <Calendar size={16} className="text-gray-500" />;
  }
};
