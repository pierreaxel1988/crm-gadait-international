
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const SubNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { path: '/pipeline', label: 'Pipeline' },
    { path: '/leads', label: 'Leads' },
    { path: '/actions', label: 'Actions' },
    { path: '/calendar', label: 'Calendrier' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-[#0A2540] border-b border-gray-200/20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                isActive(item.path)
                  ? "border-white text-white"
                  : "border-transparent text-white/70 hover:text-white hover:border-white/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNavigation;
