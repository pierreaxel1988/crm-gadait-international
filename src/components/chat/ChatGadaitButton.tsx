import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatGadaitButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getLeadIdFromUrl = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts.includes('leads') && pathParts.length > 2) {
      return pathParts[pathParts.length - 1];
    }
    return null;
  };
  
  const handleClick = () => {
    const leadId = getLeadIdFromUrl();
    
    if (leadId) {
      navigate(`/leads/${leadId}?tab=actions`);
    } else {
      navigate('/pipeline');
    }
  };

  return (
    <Button 
      onClick={handleClick}
      className="fixed bottom-20 right-6 z-50 rounded-full h-12 w-12 p-0 bg-loro-navy hover:bg-chocolate-dark shadow-lg"
      title="Assistant IA GADAIT"
    >
      <Bot size={24} className="text-white" />
    </Button>
  );
};

export default ChatGadaitButton;
