
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-mobile';

interface SubNavButtonProps {
  href: string;
  label: string;
}

const SubNavButton: React.FC<SubNavButtonProps> = ({ href, label }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-secondary text-secondary-foreground border-secondary"
      )}
    >
      {label}
    </Link>
  );
};

const SubNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const navButtons = React.useMemo(() => {
    return [
      { href: '/pipeline', label: 'Pipeline' },
      { href: '/leads', label: 'Leads' },
      { href: '/actions', label: 'Actions' },
      { href: '/calendar', label: 'Calendar' },
      { href: '/notifications', label: 'Notifications' },
    ];
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <div className="border-b bg-secondary">
      <div className="container flex h-12 items-center space-x-4 px-4">
        {navButtons.map((button) => (
          <SubNavButton key={button.href} href={button.href} label={button.label} />
        ))}
      </div>
    </div>
  );
};

export default SubNavigation;
