
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'commercial' | 'guest'>('guest');

  // Helper function to check user role and set states
  const checkAndSetUserRole = (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsCommercial(false);
      setUserRole('guest');
      return;
    }

    const userEmail = currentUser.email;
    const adminEmails = [
      'pierre@gadait-international.com',
      'christelle@gadait-international.com',
      'admin@gadait-international.com',
      'chloe@gadait-international.com'
    ];
    
    const commercialEmails = [
      'jade@gadait-international.com',
      'ophelie@gadait-international.com',
      'jeanmarc@gadait-international.com',
      'jacques@gadait-international.com',
      'sharon@gadait-international.com',
      'matthieu@gadait-international.com'
    ];
    
    const isUserAdmin = adminEmails.includes(userEmail || '');
    const isUserCommercial = commercialEmails.includes(userEmail || '');
    
    setIsAdmin(isUserAdmin);
    setIsCommercial(isUserCommercial);
    
    if (isUserAdmin) {
      setUserRole('admin');
    } else if (isUserCommercial) {
      setUserRole('commercial');
    } else {
      setUserRole('guest');
    }
  };

  useEffect(() => {
    console.log('AuthProvider - Setting up auth listeners');
    
    // IMPORTANT: Fix for the auth state change listener issue
    // Only use synchronous code in the onAuthStateChange callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      // Only update state synchronously - NEVER return a promise here
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check user role synchronously
      if (newSession?.user) {
        checkAndSetUserRole(newSession.user);
      } else {
        setIsAdmin(false);
        setIsCommercial(false);
        setUserRole('guest');
      }
      
      // No longer loading
      setLoading(false);
    });

    // Récupération initiale de la session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data } = await supabase.auth.getSession();
        console.log('Initial session retrieved:', data.session?.user?.email);
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Vérification du rôle utilisateur
        checkAndSetUserRole(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Unsubscribing from auth state change events');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Signing in with Google...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
      console.log('Google auth initiated');
    } catch (error) {
      console.error('Error signing in with Google:', error);
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

  console.log('AuthProvider rendering with user:', user?.email);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    // Retourner la valeur par défaut au lieu de lever une erreur
    return defaultContext;
  }
  return context;
};
