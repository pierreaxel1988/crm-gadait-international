
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Home, Phone, PieChart, Settings, Tag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out',
    isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
  );

  const overlayClasses = cn(
    'fixed inset-0 z-30 bg-black/50 transition-opacity',
    isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  return (
    <>
      <div className={overlayClasses} onClick={onClose}></div>
      <div className={sidebarClasses}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <span className="font-serif text-xl font-semibold tracking-tight">Gadait CRM</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-3 rounded-md px-3 py-2 transition-colors duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )
                    }
                    onClick={isMobile ? onClose : undefined}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-md bg-sidebar-accent p-3">
              <p className="text-sm font-medium text-sidebar-accent-foreground">Need help?</p>
              <p className="mt-1 text-xs text-sidebar-foreground">
                Contact support for assistance with your CRM.
              </p>
              <button className="mt-2 w-full rounded-md bg-sidebar-primary px-3 py-1 text-xs font-medium text-sidebar-primary-foreground">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
