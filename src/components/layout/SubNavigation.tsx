
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { MessageSquare, PieChart, Calendar, ListTodo, File, ClipboardList, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const SubNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
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

  // Mobile navigation with horizontal scrolling and back button
  if (isMobile) {
    return (
      <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
        <div className="flex items-center px-4 py-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack} 
            className="mr-2"
            aria-label="Retour à la page précédente"
          >
            <ArrowLeft className="h-5 w-5 text-loro-navy" />
          </Button>
          
          <div className="overflow-x-auto flex-1">
            <div className="flex space-x-4 min-w-min">
              {navigationItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={cn(
                    "flex flex-col items-center justify-center whitespace-nowrap rounded-md px-3 py-2 min-w-[70px]", 
                    location.pathname === item.path 
                      ? "text-loro-terracotta bg-loro-white" 
                      : "text-loro-navy hover:text-loro-terracotta hover:bg-loro-white/70"
                  )}
                >
                  {item.icon && <item.icon className="h-5 w-5 mb-1" />}
                  <span className="font-futura text-[14px]">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop navigation with back button
  return (
    <div className="sticky top-16 z-40 border-b border-loro-pearl bg-loro-white shadow-sm">
      <div className="content-container flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack} 
          className="ml-4"
          aria-label="Retour à la page précédente"
        >
          <ArrowLeft className="h-5 w-5 text-loro-navy" />
        </Button>
        
        <NavigationMenu className="justify-center mx-auto">
          <NavigationMenuList className="space-x-0">
            {navigationItems.map(item => (
              <NavigationMenuItem key={item.name}>
                <Link 
                  to={item.path} 
                  className={cn(
                    "inline-flex h-12 items-center justify-center px-6 font-futura text-[18px] transition-colors", 
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
      </div>
    </div>
  );
};

export default SubNavigation;
