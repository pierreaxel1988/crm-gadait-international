
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, ChevronLeft, Home, Phone, PieChart, Settings, Tag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) => {
  const isMobile = useIsMobile();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/',
    },
    {
      name: 'Leads',
      icon: Users,
      path: '/leads',
    },
    {
      name: 'Pipeline',
      icon: PieChart,
      path: '/kanban',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
    },
    {
      name: 'Communications',
      icon: Phone,
      path: '/communications',
    },
    {
      name: 'Tags',
      icon: Tag,
      path: '/tags',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  // For mobile: sidebar is either fully visible or hidden
  // For desktop: sidebar can be expanded or collapsed (icons only)
  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 bg-[#F5F2ED] border-r border-[#E5DCD0] transform transition-all duration-300 ease-in-out',
    isMobile ? (
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
    ) : (
      isOpen ? (
        isCollapsed ? 'translate-x-0 w-20' : 'translate-x-0 w-64'
      ) : (
        '-translate-x-full w-64'
      )
    )
  );

  const overlayClasses = cn(
    'fixed inset-0 z-30 bg-black/50 transition-opacity',
    isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  // Updated toggle button styles to match the Loro Piana inspiration
  const toggleButtonClasses = cn(
    'absolute -right-4 top-20 flex items-center justify-center',
    'h-8 w-8 rounded-full cursor-pointer transform transition-all duration-300',
    'border border-[#E5DCD0] bg-white text-[#86755D] shadow-[0_2px_8px_rgba(134,117,93,0.1)]',
    'hover:border-[#D6C8B6] hover:shadow-[0_2px_12px_rgba(134,117,93,0.2)]',
    'dark:bg-[#F5F2ED] dark:text-[#86755D] dark:border-[#E5DCD0] dark:hover:border-[#D6C8B6]',
    isMobile ? 'hidden' : 'block'
  );

  // Add animation class for icon rotation
  const iconClasses = cn(
    'transition-transform duration-300',
    isCollapsed ? 'rotate-0' : 'rotate-180'
  );

  return (
    <>
      <div className={overlayClasses} onClick={onClose}></div>
      <div className={sidebarClasses}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-[#E5DCD0] px-4">
            {!isCollapsed ? (
              <span className="font-serif text-xl font-semibold tracking-tight text-[#86755D]">Gadait CRM</span>
            ) : (
              <span className="font-serif text-xl font-semibold tracking-tight mx-auto text-[#86755D]">G</span>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center rounded-none px-3 py-2 transition-colors duration-200',
                        isCollapsed ? 'justify-center' : 'space-x-3',
                        isActive
                          ? 'bg-[#EBE5DC] text-[#6A5940]'
                          : 'text-[#86755D] hover:bg-[#F5F2ED] hover:text-[#6A5940]'
                      )
                    }
                    onClick={isMobile ? onClose : undefined}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon size={18} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {!isCollapsed && (
            <div className="border-t border-[#E5DCD0] p-4">
              <div className="rounded-none bg-[#EBE5DC] p-3">
                <p className="text-sm font-medium text-[#6A5940]">Need help?</p>
                <p className="mt-1 text-xs text-[#86755D]">
                  Contact support for assistance with your CRM.
                </p>
                <button className="mt-2 w-full rounded-none bg-[#86755D] px-3 py-1 text-xs font-medium text-white hover:bg-[#96856D]">
                  Contact Support
                </button>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="border-t border-[#E5DCD0] p-4 flex justify-center">
              <button className="rounded-none bg-[#EBE5DC] p-2" title="Need help?">
                <span className="text-[#6A5940]">?</span>
              </button>
            </div>
          )}
        </div>
        <div 
          className={toggleButtonClasses}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft 
            size={15} 
            className={iconClasses} 
            strokeWidth={2.5}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
