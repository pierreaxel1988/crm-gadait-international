
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { MessageSquare, PieChart, Calendar, ListTodo, File, ClipboardList } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SubNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navigationItems = [{
    name: 'Pipeline',
    path: '/pipeline',
    icon: ListTodo
  }, {
    name: 'Actions',
    path: '/actions',
    icon: ClipboardList
  }, {
    name: 'Calendar',
    path: '/calendar',
    icon: Calendar
  }, {
    name: 'Reports',
    path: '/reports',
    icon: PieChart
  }, {
    name: 'Chat Gadait',
    path: '/chat-gadait',
    icon: MessageSquare
  }, {
    name: 'Properties',
    path: '/properties',
    icon: File
  }];

  // Mobile navigation with horizontal scrolling - icons only
  if (isMobile) {
    return <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
        <div className="overflow-x-auto py-2 bg-loro-50">
          <div className="flex justify-between px-2 w-full">
            {navigationItems.map(item => <Link key={item.name} to={item.path} className={cn("flex items-center justify-center whitespace-nowrap rounded-md p-2 flex-1 mx-1 transition-transform hover:scale-110 duration-200", location.pathname === item.path ? "text-loro-terracotta bg-loro-white" : "text-loro-navy hover:text-loro-terracotta hover:bg-loro-white/70")}>
                {item.icon && <item.icon className="h-5 w-5" />}
              </Link>)}
          </div>
        </div>
      </div>;
  }

  // Desktop navigation - centered with better spacing and consistent styling with mobile
  return <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
      <div className="bg-loro-50 py-2">
        <div className="max-w-screen-xl mx-auto px-4">
          <NavigationMenu className="mx-auto flex justify-center w-full">
            <NavigationMenuList className="flex space-x-4 md:space-x-6 lg:space-x-8">
              {navigationItems.map(item => <NavigationMenuItem key={item.name}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center justify-center rounded-md transition-transform hover:scale-110 duration-200 px-3 py-2",
                      location.pathname === item.path 
                        ? "text-loro-terracotta bg-loro-white" 
                        : "text-loro-navy hover:text-loro-terracotta hover:bg-loro-white/70"
                    )}
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </NavigationMenuItem>)}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>;
};

export default SubNavigation;
