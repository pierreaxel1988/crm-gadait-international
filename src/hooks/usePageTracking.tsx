import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { sessionTracker } from '@/services/sessionTracker';

const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/pipeline': 'Pipeline',
    '/leads': 'Leads',
    '/actions': 'Actions',
    '/calendar': 'Calendar',
    '/admin': 'Admin',
    '/properties': 'Properties',
    '/notifications': 'Notifications',
  };

  // Check for exact match first
  if (routes[pathname]) return routes[pathname];

  // Check for partial matches
  for (const [route, title] of Object.entries(routes)) {
    if (pathname.startsWith(route)) {
      if (pathname.includes('/edit')) return `${title} - Edit`;
      if (pathname.includes('/new')) return `${title} - New`;
      if (pathname.match(/\/[a-f0-9-]{36}/)) return `${title} - Detail`;
      return title;
    }
  }

  return 'Unknown Page';
};

const getTabName = (pathname: string, search: string): string | undefined => {
  const params = new URLSearchParams(search);
  const tab = params.get('tab');
  
  if (tab) {
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  }

  return undefined;
};

export const usePageTracking = (userId?: string) => {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!userId) return;

    const currentPath = location.pathname + location.search;
    
    // Only track if path has actually changed
    if (currentPath === lastPathRef.current) return;
    
    lastPathRef.current = currentPath;

    const pageTitle = getPageTitle(location.pathname);
    const tabName = getTabName(location.pathname, location.search);

    console.log('Tracking page view:', {
      path: location.pathname,
      title: pageTitle,
      tab: tabName
    });

    sessionTracker.trackPageView(
      userId,
      location.pathname,
      pageTitle,
      tabName
    );

  }, [location.pathname, location.search, userId]);
};
