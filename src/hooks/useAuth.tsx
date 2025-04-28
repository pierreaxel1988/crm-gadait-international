
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAdmin: boolean;
  isCommercial: boolean;
  userRole: 'admin' | 'commercial' | 'guest';
  userId: string | null;
  teamMemberId: string | null;
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
  userRole: 'guest',
  userId: null,
  teamMemberId: null
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'commercial' | 'guest'>('guest');
  const [userId, setUserId] = useState<string | null>(null);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);

  useEffect(() => {
    // Configuration explicite de Supabase pour assurer la persistance de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setUserId(newSession?.user?.id || null);
      
      // Vérification du rôle utilisateur
      if (newSession?.user) {
        const userEmail = newSession.user.email;
        
        // Mise à jour des rôles dans la base de données
        const checkUserRoleInDatabase = async () => {
          try {
            const { data, error } = await supabase
              .from('team_members')
              .select('id, is_admin, role')
              .eq('email', userEmail)
              .single();
              
            if (error) {
              console.error('Error fetching user role:', error);
              fallbackToHardcodedRoles(userEmail);
              return;
            }
            
            if (data) {
              console.log('User role from database:', data);
              setIsAdmin(data.is_admin || false);
              setIsCommercial(data.role === 'commercial');
              setUserRole(data.is_admin ? 'admin' : data.role === 'commercial' ? 'commercial' : 'guest');
              setTeamMemberId(data.id);
            } else {
              fallbackToHardcodedRoles(userEmail);
            }
          } catch (err) {
            console.error('Error checking user role:', err);
            fallbackToHardcodedRoles(userEmail);
          }
        };
        
        checkUserRoleInDatabase();
      } else {
        resetUserRole();
      }
      
      setLoading(false);
    });

    // Fonction pour utiliser les rôles codés en dur si la récupération depuis la base de données échoue
    const fallbackToHardcodedRoles = (userEmail: string | undefined) => {
      if (!userEmail) {
        resetUserRole();
        return;
      }
      
      // Chercher dans le tableau garanti
      const member = GUARANTEED_TEAM_MEMBERS.find(m => m.email === userEmail);
      
      if (member) {
        setIsAdmin(member.is_admin || false);
        setIsCommercial(member.role === 'commercial');
        setUserRole(member.is_admin ? 'admin' : member.role === 'commercial' ? 'commercial' : 'guest');
        setTeamMemberId(member.id);
      } else {
        resetUserRole();
      }
    };
    
    // Réinitialiser les rôles utilisateur
    const resetUserRole = () => {
      setIsAdmin(false);
      setIsCommercial(false);
      setUserRole('guest');
      setTeamMemberId(null);
    };

    // Récupération initiale de la session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data } = await supabase.auth.getSession();
        console.log('Initial session retrieved:', data.session?.user?.email);
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setUserId(data.session?.user?.id || null);
        
        // Vérification du rôle utilisateur
        if (data.session?.user) {
          const userEmail = data.session.user.email;
          
          // Vérifier le rôle dans la base de données
          const { data: userData, error } = await supabase
            .from('team_members')
            .select('id, is_admin, role')
            .eq('email', userEmail)
            .single();
            
          if (error || !userData) {
            console.error('Error fetching user role or user not found:', error);
            fallbackToHardcodedRoles(userEmail);
          } else {
            setIsAdmin(userData.is_admin || false);
            setIsCommercial(userData.role === 'commercial');
            setUserRole(userData.is_admin ? 'admin' : userData.role === 'commercial' ? 'commercial' : 'guest');
            setTeamMemberId(userData.id);
          }
        } else {
          resetUserRole();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        resetUserRole();
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
      console.log('Signing out...');
      await supabase.auth.signOut();
      resetUserRole();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Réinitialiser les rôles utilisateur
  const resetUserRole = () => {
    setIsAdmin(false);
    setIsCommercial(false);
    setUserRole('guest');
    setTeamMemberId(null);
    setUserId(null);
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
    userRole,
    userId,
    teamMemberId
  };

  console.log('AuthProvider rendering with user:', user?.email, 'isAdmin:', isAdmin, 'isCommercial:', isCommercial, 'teamMemberId:', teamMemberId);

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
