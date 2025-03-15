import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Upload, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, isCollapsed, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      isPrimary: true,
    },
    {
      name: 'Leads',
      path: '/leads',
    },
    {
      name: 'Import Leads',
      path: '/lead-import',
      icon: Upload,
    },
    {
      name: 'Pipeline',
      path: '/pipeline',
    },
    {
      name: 'Properties',
      path: '/properties',
    },
    {
      name: 'Calendar',
      path: '/calendar',
    },
    {
      name: 'Reports',
      path: '/reports',
    },
    {
      name: 'API',
      path: '/api',
    },
    {
      name: 'Admin',
      path: '/admin',
    },
    {
      name: 'Settings',
      path: '/settings',
    },
    {
      title: "Chat Gadait",
      icon: MessageSquare,
      href: "/chat-gadait",
      color: "text-emerald-600",
    },
  ];

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 bg-loro-white transform transition-all duration-300 ease-in-out w-80',
    isOpen ? 'translate-x-0' : '-translate-x-full'
  );

  const overlayClasses = cn(
    'fixed inset-0 z-30 bg-black/30 transition-opacity',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  return (
    <>
      <div className={overlayClasses} onClick={onClose}></div>
      <div className={sidebarClasses}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-end px-6 pt-6">
            <button
              onClick={onClose}
              className="text-loro-navy hover:text-loro-terracotta transition-colors duration-200"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-10 py-16">
            <ul className="space-y-7">
              {navigationItems.map((item) => (
                <li key={item.name || item.title}>
                  <NavLink
                    to={item.path || item.href || '#'}
                    className={({ isActive }) =>
                      cn(
                        'block transition-all duration-200 text-base leading-[22px] flex items-center',
                        item.isPrimary 
                          ? 'text-loro-terracotta font-times text-2xl mb-12 tracking-wide' 
                          : 'text-times-text font-times text-[26px] leading-[28px] font-normal',
                        isActive
                          ? item.isPrimary ? 'text-loro-terracotta' : 'text-loro-terracotta'
                          : item.isPrimary ? 'text-loro-terracotta' : 'hover:text-loro-terracotta hover:font-timesItalic'
                      )
                    }
                    onClick={isMobile ? onClose : undefined}
                  >
                    {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                    {item.name || item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
