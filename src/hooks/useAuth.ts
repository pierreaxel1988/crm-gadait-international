
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email || null);

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

        setIsAdmin(adminEmails.includes(user.email || ''));
        setIsCommercial(commercialEmails.includes(user.email || ''));
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return { isAdmin, isCommercial, isLoading, userEmail };
};
