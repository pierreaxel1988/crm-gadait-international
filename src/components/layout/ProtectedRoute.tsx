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
    return <Navigate to="/auth" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  if (isCommercial && !commercialAllowed) {
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
