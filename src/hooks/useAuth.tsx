
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // Alias pour compatibilité
  isAdmin: boolean;
  isCommercial: boolean;
  userRole: 'admin' | 'commercial' | 'user';
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define admin emails
  const adminEmails = [
    'pierre@gadait-international.com',
    'christelle@gadait-international.com',
    'admin@gadait-international.com',
    'chloe@gadait-international.com'
  ];

  // Define commercial emails
  const commercialEmails = [
    'jade@gadait-international.com',
    'ophelie@gadait-international.com',
    'jeanmarc@gadait-international.com',
    'jacques@gadait-international.com',
    'sharon@gadait-international.com',
    'matthieu@gadait-international.com'
  ];

  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
  const isCommercial = user?.email ? commercialEmails.includes(user.email) : false;
  
  const userRole: 'admin' | 'commercial' | 'user' = isAdmin ? 'admin' : isCommercial ? 'commercial' : 'user';

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      loading: isLoading, // Alias pour compatibilité
      isAdmin, 
      isCommercial, 
      userRole, 
      signOut, 
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
