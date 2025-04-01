
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAdmin: boolean;
  teamMemberId: string | null;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          const userRole = data.session.user.user_metadata?.role;
          const email = data.session.user.email;
          setUserEmail(email);
          
          setIsAdmin(
            userRole === 'admin' || 
            email === 'pierre@gadait-international.com' ||
            email === 'christelle@gadait-international.com' ||
            email === 'admin@gadait-international.com'
          );
          
          // Fetch the team member ID based on email
          if (email) {
            const { data: teamMemberData } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', email)
              .single();
              
            if (teamMemberData) {
              setTeamMemberId(teamMemberData.id);
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = session.user.user_metadata?.role;
          const email = session.user.email;
          setUserEmail(email);
          
          setIsAdmin(
            userRole === 'admin' || 
            email === 'pierre@gadait-international.com' ||
            email === 'christelle@gadait-international.com' ||
            email === 'admin@gadait-international.com'
          );
          
          // Fetch the team member ID based on email
          if (email) {
            const { data: teamMemberData } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', email)
              .single();
              
            if (teamMemberData) {
              setTeamMemberId(teamMemberData.id);
            }
          }
        } else {
          setIsAdmin(false);
          setTeamMemberId(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut, 
      signInWithGoogle, 
      isAdmin,
      teamMemberId,
      userEmail
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
