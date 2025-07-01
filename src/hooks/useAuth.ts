
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData?.session?.user;
        
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        setUser(currentUser);
        setUserEmail(currentUser.email || null);

        // Vérifier si c'est un admin
        const adminEmails = [
          'pierre@gadait-international.com',
          'christelle@gadait-international.com',
          'admin@gadait-international.com',
          'chloe@gadait-international.com'
        ];

        // Vérifier si c'est un commercial
        const commercialEmails = [
          'jade@gadait-international.com',
          'ophelie@gadait-international.com',
          'jeanmarc@gadait-international.com',
          'jacques@gadait-international.com',
          'sharon@gadait-international.com',
          'matthieu@gadait-international.com'
        ];

        const isUserAdmin = adminEmails.includes(currentUser.email || '');
        const isUserCommercial = commercialEmails.includes(currentUser.email || '');

        setIsAdmin(isUserAdmin);
        setIsCommercial(isUserCommercial);
        setUserRole(isUserAdmin ? 'admin' : (isUserCommercial ? 'commercial' : 'user'));
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error signing in with Google:', error);
  };

  return { 
    user, 
    isAdmin, 
    isCommercial, 
    isLoading, 
    loading: isLoading,
    userEmail, 
    userRole,
    signOut,
    signInWithGoogle
  };
};
