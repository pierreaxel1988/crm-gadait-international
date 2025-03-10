
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ModeToggle from "@/components/ModeToggle"
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, Users, PieChart, Calendar, Settings, LogOut, ChevronRight, 
  ChevronLeft, NotebookPen, Building, BriefcaseBusiness
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const routes = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <Home className="h-5 w-5" />
    },
    {
      label: 'Leads',
      path: '/leads',
      icon: <Users className="h-5 w-5" />
    },
    {
      label: 'Pipeline',
      path: '/pipeline',
      icon: <BriefcaseBusiness className="h-5 w-5" />
    },
    {
      label: 'Propriétés',
      path: '/properties',
      icon: <Building className="h-5 w-5" />
    },
    {
      label: 'Calendar',
      path: '/calendar',
      icon: <Calendar className="h-5 w-5" />
    }
  ];

  return (
    <nav className={cn(
      "fixed top-0 z-50 flex h-full shrink-0 flex-col border-r bg-background shadow-sm transition-all duration-300",
      collapsed ? "w-16" : "w-60",
    )}>
      <div className="flex h-[60px] items-center px-4">
        <Link to="/" className="flex items-center">
          <h1 className={cn(
            "font-futura text-lg font-semibold tracking-tight text-loro-navy uppercase",
            collapsed && "hidden"
          )}>
            GADAIT.
          </h1>
        </Link>
        <button
          onClick={toggleSidebar}
          className="ml-auto rounded-sm p-2 transition-colors hover:bg-secondary/50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-hidden text-sm">
        <ul className="mt-6 space-y-1">
          {routes.map((route) => (
            <li key={route.label}>
              <Link
                to={route.path}
                className={cn(
                  "group relative flex h-9 w-full items-center justify-start space-x-2 rounded-lg px-3.5 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                  collapsed && "justify-center"
                )}
              >
                {route.icon}
                <span className={cn(
                  "overflow-hidden text-ellipsis whitespace-nowrap",
                  collapsed && "hidden"
                )}>
                  {route.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="absolute bottom-4 left-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <Settings className="mr-2 h-4 w-4" />
                <span className={cn(
                  "overflow-hidden text-ellipsis whitespace-nowrap",
                  collapsed && "hidden"
                )}>
                  Settings
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ModeToggle />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
