
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loro-hazel"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Admin-only routes
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // For commercial users, restrict access to certain routes
  if (isCommercial && !commercialAllowed) {
    // Commercials can only access leads, actions, and calendar routes
    if (
      !location.pathname.startsWith('/leads') &&
      !location.pathname.startsWith('/actions') &&
      !location.pathname.startsWith('/calendar') &&
      location.pathname !== '/' &&
      location.pathname !== '/pipeline'
    ) {
      return <Navigate to="/pipeline" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
