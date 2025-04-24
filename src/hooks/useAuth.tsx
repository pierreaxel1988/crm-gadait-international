
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAdmin: boolean;
  isCommercial: boolean;
  userRole: 'admin' | 'commercial' | 'guest';
}

// Liste des emails pour l'équipe administrative et commerciale
const ADMIN_EMAILS = [
  'pierre@gadait-international.com',
  'christelle@gadait-international.com',
  'admin@gadait-international.com',
  'chloe@gadait-international.com'
];

const COMMERCIAL_EMAILS = [
  'jade@gadait-international.com',
  'ophelie@gadait-international.com',
  'jeanmarc@gadait-international.com',
  'jacques@gadait-international.com',
  'sharon@gadait-international.com'
];

// Création du contexte avec une valeur par défaut complète
const defaultContext: AuthContextType = {
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  isAdmin: false,
  isCommercial: false,
  userRole: 'guest'
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'commercial' | 'guest'>('guest');

  // Fonction pour déterminer le rôle d'un utilisateur à partir de son email
  const determineUserRole = (email: string | null | undefined) => {
    if (!email) {
      return { isAdmin: false, isCommercial: false, role: 'guest' as const };
    }

    const isUserAdmin = ADMIN_EMAILS.includes(email);
    const isUserCommercial = COMMERCIAL_EMAILS.includes(email);

    let role: 'admin' | 'commercial' | 'guest' = 'guest';
    if (isUserAdmin) role = 'admin';
    else if (isUserCommercial) role = 'commercial';

    return { isAdmin: isUserAdmin, isCommercial: isUserCommercial, role };
  };

  useEffect(() => {
    console.log('[useAuth] Initialisation du hook d\'authentification');

    // Configuration explicite de Supabase pour assurer la persistance de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[useAuth] Auth state changed:', event, newSession?.user?.email);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Vérification du rôle utilisateur
      if (newSession?.user) {
        const userEmail = newSession.user.email;
        const { isAdmin: isUserAdmin, isCommercial: isUserCommercial, role } = determineUserRole(userEmail);
        
        console.log(`[useAuth] User role determined: ${role} (Admin: ${isUserAdmin}, Commercial: ${isUserCommercial})`);
        
        setIsAdmin(isUserAdmin);
        setIsCommercial(isUserCommercial);
        setUserRole(role);
      } else {
        setIsAdmin(false);
        setIsCommercial(false);
        setUserRole('guest');
      }
      
      setLoading(false);
    });

    // Récupération initiale de la session
    const getInitialSession = async () => {
      try {
        console.log('[useAuth] Getting initial session...');
        const { data } = await supabase.auth.getSession();
        console.log('[useAuth] Initial session retrieved:', data.session?.user?.email);
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Vérification du rôle utilisateur
        if (data.session?.user) {
          const userEmail = data.session.user.email;
          const { isAdmin: isUserAdmin, isCommercial: isUserCommercial, role } = determineUserRole(userEmail);
          
          console.log(`[useAuth] Initial user role: ${role} (Admin: ${isUserAdmin}, Commercial: ${isUserCommercial})`);
          
          setIsAdmin(isUserAdmin);
          setIsCommercial(isUserCommercial);
          setUserRole(role);
        }
      } catch (error) {
        console.error('[useAuth] Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[useAuth] Signing out...');
      await supabase.auth.signOut();
      console.log('[useAuth] Signed out successfully');
    } catch (error) {
      console.error('[useAuth] Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[useAuth] Signing in with Google...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        console.error('[useAuth] Error signing in with Google:', error);
        throw error;
      }
      console.log('[useAuth] Google auth initiated');
    } catch (error) {
      console.error('[useAuth] Error signing in with Google:', error);
      throw error;
    }
  };

  // Vérification préventive que le contexte n'est jamais undefined
  const contextValue: AuthContextType = {
    session,
    user,
    loading,
    signOut,
    signInWithGoogle,
    isAdmin,
    isCommercial,
    userRole
  };

  console.log('[useAuth] Provider rendering with user:', user?.email, 'role:', userRole);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('[useAuth] must be used within an AuthProvider');
    // Retourner la valeur par défaut au lieu de lever une erreur
    return defaultContext;
  }
  return context;
};
