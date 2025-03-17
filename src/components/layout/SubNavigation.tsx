
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { MessageSquare, PieChart, Users, Calendar, ListTodo, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const SubNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

  // Mobile dropdown navigation
  if (isMobile) {
    const currentPage = navigationItems.find(item => item.path === location.pathname) || navigationItems[0];
    
    return (
      <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
        <div className="content-container py-2">
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="w-full flex items-center justify-between px-4 py-2 text-loro-navy hover:bg-loro-white/90 rounded-sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="flex items-center space-x-2">
                  {currentPage.icon && <currentPage.icon className="h-5 w-5 text-loro-terracotta" />}
                  <span className="font-times text-[18px]">{currentPage.name}</span>
                </div>
                {isMenuOpen ? (
                  <ChevronUp className="h-4 w-4 text-loro-navy" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-loro-navy" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="pt-12 pb-4">
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-sm font-times text-[20px]",
                      location.pathname === item.path
                        ? "text-loro-terracotta bg-loro-white"
                        : "text-loro-navy hover:text-loro-terracotta hover:bg-loro-white/70"
                    )}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="sticky top-16 z-40 border-b border-loro-pearl bg-white shadow-sm">
      <div className="content-container">
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
      </div>
    </div>
  );
};

export default SubNavigation;
