
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
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
      name: 'Kanban',
      path: '/kanban',
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
      name: 'Settings',
      path: '/settings',
    },
  ];

  // For mobile: sidebar is either fully visible or hidden
  // For desktop: sidebar is a permanent element that slides in from the left
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
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'block transition-colors duration-200 text-base leading-[22px]',
                        item.isPrimary 
                          ? 'text-loro-terracotta font-optima text-2xl mb-12 tracking-wide' 
                          : 'text-loro-navy font-optima text-[16px] leading-[22px] font-normal',
                        isActive
                          ? item.isPrimary ? 'text-loro-terracotta' : 'text-loro-terracotta'
                          : item.isPrimary ? 'text-loro-terracotta' : 'hover:text-loro-terracotta'
                      )
                    }
                    onClick={isMobile ? onClose : undefined}
                  >
                    {item.name}
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
