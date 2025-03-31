
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ListTodo, ClipboardList, Calendar, PieChart, MessageSquare, File } from 'lucide-react';

const SubNavigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    {
      name: 'Pipeline',
      path: '/pipeline',
      icon: ListTodo
    },
    {
      name: 'Actions',
      path: '/actions',
      icon: ClipboardList
    },
    {
      name: 'Calendrier',
      path: '/calendar',
      icon: Calendar
    },
    {
      name: 'Rapports',
      path: '/reports',
      icon: PieChart
    },
    {
      name: 'Chat',
      path: '/chat-gadait',
      icon: MessageSquare
    },
    {
      name: 'Propriétés',
      path: '/properties',
      icon: File
    }
  ];

  return (
    <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
      <div className="flex justify-between px-1 py-3">
        {navigationItems.map(item => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-4",
              location.pathname === item.path 
                ? "text-loro-hazel" 
                : "text-loro-navy"
            )}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubNavigation;
