
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { MessageSquare, ListTodo, File, ClipboardList } from 'lucide-react';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBadge from './navbar/NotificationBadge';
import { LayoutDashboard, Users, Brain, Home, UserCheck, CheckSquare, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

const SubNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pipeline', label: 'Pipeline', icon: Users },
    { path: '/smart-matching', label: 'Smart Matching', icon: Brain },
    { path: '/properties', label: 'Propriétés', icon: Home },
    { path: '/leads', label: 'Leads', icon: UserCheck },
    { path: '/actions', label: 'Actions', icon: CheckSquare },
    { path: '/calendar', label: 'Agenda', icon: CalendarIcon },
    { path: '/api-guide', label: 'API Guide', icon: BookOpen }
  ];

  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { unreadCount } = useNotifications();
  
  // Mobile navigation with horizontal scrolling - icons only
  if (isMobile) {
    return <div className="w-full border-b border-loro-pearl bg-loro-50 shadow-sm">
        <div className="overflow-x-auto py-2 bg-loro-50">
          <div className="flex justify-between px-2 w-full">
            {navItems.map(item => <Link key={item.label} to={item.path} className={cn(
              "flex items-center justify-center whitespace-nowrap rounded-md p-2 flex-1 mx-1 transition-transform hover:scale-110 duration-200 bg-loro-50 relative", 
              location.pathname === item.path 
                ? "text-loro-terracotta after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-loro-terracotta" 
                : "text-loro-navy hover:text-loro-terracotta"
            )}>
                {item.icon && <item.icon className="h-5 w-5" />}
              </Link>)}
          </div>
        </div>
      </div>;
  }

  // Desktop navigation with text and better responsive behavior
  return <div className="w-full border-b border-loro-pearl bg-loro-50 shadow-sm">
      <div className="bg-loro-50 py-2">
        <div className="max-w-screen-xl mx-auto px-4">
          <NavigationMenu className="mx-auto flex justify-center w-full">
            <NavigationMenuList className={cn(
              "flex",
              isTablet ? "space-x-3" : "space-x-4 md:space-x-6 lg:space-x-8"
            )}>
              {navItems.map(item => <NavigationMenuItem key={item.label}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center justify-center rounded-md transition-transform hover:scale-110 duration-200 bg-loro-50 relative",
                      isTablet ? "px-2 py-2" : "px-3 py-2",
                      location.pathname === item.path 
                        ? "text-loro-terracotta font-medium after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-loro-terracotta" 
                        : "text-loro-navy hover:text-loro-terracotta"
                    )}
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    <span className={cn("font-medium", isTablet ? "text-xs" : "text-sm")}>{item.label}</span>
                  </Link>
                </NavigationMenuItem>)}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>;
};

export default SubNavigation;
