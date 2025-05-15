
import React, { useEffect } from 'react';
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
  
  // Log l'état d'authentification pour le débogage
  useEffect(() => {
    console.log('ProtectedRoute - Auth State:', { 
      user: user?.email, 
      loading, 
      isAdmin, 
      isCommercial, 
      path: location.pathname 
    });
  }, [user, loading, isAdmin, isCommercial, location.pathname]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page d'authentification
  // avec le chemin actuel comme paramètre de redirection
  if (!user) {
    const currentPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirectTo=${currentPath}`} replace />;
  }
  
  // Vérifier si la route est réservée aux administrateurs
  if (adminOnly && !isAdmin) {
    return <Navigate to="/pipeline" replace />;
  }
  
  // Restriction pour les commerciaux
  if (isCommercial && !commercialAllowed) {
    const allowedPaths = [
      '/',
      '/pipeline', 
      '/leads', 
      '/actions', 
      '/calendar'
    ];
    
    const isPathAllowed = allowedPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
    
    if (!isPathAllowed) {
      return <Navigate to="/pipeline" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
