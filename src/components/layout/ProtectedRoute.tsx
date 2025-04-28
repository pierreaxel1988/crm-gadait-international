
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  commercialAllowed?: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  adminOnly = false,
  commercialAllowed = true,
  children 
}) => {
  const { user, loading, isAdmin, isCommercial } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    // Redirect to auth page with return URL
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Admin-only route check
  if (adminOnly && !isAdmin) {
    console.log("Access denied: Admin-only route");
    return <Navigate to="/pipeline" replace />;
  }
  
  // Commercial restrictions check
  if (isCommercial && !commercialAllowed) {
    console.log("Access denied: Not available for commercial users");
    return <Navigate to="/pipeline" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
