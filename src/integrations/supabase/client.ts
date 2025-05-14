
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from '@/hooks/use-toast';

const SUPABASE_URL = "https://hxqoqkfnhbpwzkjgukrc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cW9xa2ZuaGJwd3pramd1a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjkyODMsImV4cCI6MjA1NzAwNTI4M30.lsQLzCFYTKVuViH3MM5Xk9j8Fx1h0dCS_rwxx9NXMbY";

// Pour déterminer si l'application fonctionne en mode hors ligne
export let isOfflineMode = false;

// Fonction pour activer/désactiver le mode hors ligne
export const setOfflineMode = (offline: boolean) => {
  isOfflineMode = offline;
  if (offline) {
    localStorage.setItem('supabase_offline_mode', 'true');
    console.log('Mode hors ligne activé');
  } else {
    localStorage.removeItem('supabase_offline_mode');
    console.log('Mode hors ligne désactivé');
  }
  return offline;
};

// Vérifier si le mode hors ligne était activé précédemment
if (typeof localStorage !== 'undefined' && localStorage.getItem('supabase_offline_mode') === 'true') {
  isOfflineMode = true;
  console.log('Application démarrée en mode hors ligne');
}

// Client Supabase avec gestion améliorée des erreurs
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      // Si le mode hors ligne est activé, rejeter immédiatement la requête
      if (isOfflineMode) {
        return Promise.reject(new Error('Application en mode hors ligne'));
      }
      
      return fetch(args[0], args[1]).catch(error => {
        console.error('Erreur de connexion Supabase:', error);
        // Activer automatiquement le mode hors ligne en cas d'erreur de connexion
        setOfflineMode(true);
        toast({
          title: "Mode hors ligne activé",
          description: "L'application fonctionne maintenant en mode hors ligne. Certaines fonctionnalités seront limitées.",
          variant: "destructive"
        });
        throw error;
      });
    }
  }
});

// Fonction pour vérifier l'état de la connexion
export const checkSupabaseConnection = async () => {
  try {
    // En mode hors ligne, ne pas tenter de vérifier la connexion
    if (isOfflineMode) {
      return false;
    }
    
    // Simple requête de vérification
    const { data, error } = await supabase.from('team_members').select('count').limit(1);
    if (error) throw error;
    
    // Si on arrive ici, la connexion fonctionne, donc désactiver le mode hors ligne s'il était activé
    if (isOfflineMode) {
      setOfflineMode(false);
      toast({
        title: "Connexion rétablie",
        description: "L'application fonctionne maintenant en mode normal.",
        duration: 3000,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    // Activer le mode hors ligne en cas d'échec
    setOfflineMode(true);
    return false;
  }
};
