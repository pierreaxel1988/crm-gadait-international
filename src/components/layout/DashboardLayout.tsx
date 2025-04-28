
import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={isOpen} 
        isCollapsed={isCollapsed} 
        onClose={handleClose} 
        onToggleCollapse={handleToggleCollapse} 
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
