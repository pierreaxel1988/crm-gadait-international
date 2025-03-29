
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
        <div className="overflow-x-auto py-2">
          <div className="flex px-4 space-x-4 min-w-min">
            {navigationItems.map(item => <Link key={item.name} to={item.path} className={cn("flex items-center justify-center whitespace-nowrap rounded-md p-3 min-w-[50px]", location.pathname === item.path ? "text-loro-terracotta bg-loro-white" : "text-loro-navy hover:text-loro-terracotta hover:bg-loro-white/70")}>
                {item.icon && <item.icon className="h-5 w-5" />}
              </Link>)}
          </div>
        </div>
      </div>;
  }

  // Desktop navigation - icons only
  return <div className="sticky top-16 z-40 border-b border-loro-pearl bg-loro-white shadow-sm">
      <div className="content-container">
        <NavigationMenu className="justify-start mx-auto">
          <NavigationMenuList className="space-x-4">
            {navigationItems.map(item => <NavigationMenuItem key={item.name}>
                <Link to={item.path} className={cn("inline-flex h-12 w-12 items-center justify-center rounded-md", "hover:text-loro-terracotta focus:text-loro-terracotta focus:outline-none", location.pathname === item.path ? "text-loro-terracotta bg-loro-white/80 border-b-2 border-loro-terracotta" : "text-loro-navy")}>
                  <item.icon className="h-6 w-6" />
                </Link>
              </NavigationMenuItem>)}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>;
};

export default SubNavigation;
