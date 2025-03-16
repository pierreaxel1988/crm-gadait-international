
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { MessageSquare, PieChart, Users, Calendar, ListTodo } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const SubNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    {
      name: 'Pipeline',
      path: '/pipeline',
      icon: ListTodo,
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Chat Gadait.',
      path: '/chat-gadait',
      icon: MessageSquare,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: PieChart,
    },
    {
      name: 'Leads',
      path: '/leads',
      icon: Users,
    },
  ];

  return (
    <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
      <div className="content-container">
        {isMobile ? (
          <ScrollArea className="w-full">
            <div className="flex px-1 py-0.5">
              {navigationItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={cn(
                    "flex flex-col items-center justify-center px-3 py-2 mx-1 text-center transition-colors rounded-md min-w-[60px]",
                    "hover:bg-loro-pearl/50 focus:outline-none",
                    location.pathname === item.path
                      ? "text-loro-terracotta bg-loro-pearl/30 font-medium"
                      : "text-loro-navy"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[12px] font-times whitespace-nowrap">{item.name}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <NavigationMenu className="justify-center mx-auto">
            <NavigationMenuList className="space-x-0">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "inline-flex h-12 items-center justify-center px-6 font-times text-[18px] transition-colors",
                      "hover:text-loro-terracotta focus:text-loro-terracotta focus:outline-none",
                      location.pathname === item.path
                        ? "text-loro-terracotta border-b-2 border-loro-terracotta"
                        : "text-loro-navy"
                    )}
                  >
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </div>
  );
};

export default SubNavigation;
