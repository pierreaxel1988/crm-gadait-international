import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  user_id: string;
  ip_address?: string;
  user_agent?: string;
}

class SessionTracker {
  private currentSessionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentPageViewId: string | null = null;

  async startSession(userId: string): Promise<void> {
    try {
      // Fermer toute session précédente encore ouverte pour cet utilisateur
      await this.closeOpenSessions(userId);

      // Obtenir les informations de la session
      const sessionData: SessionData = {
        user_id: userId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      // Créer une nouvelle session
      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors de la création de session:', error);
        return;
      }

      this.currentSessionId = data.id;

      // Démarrer le heartbeat pour maintenir la session active
      this.startHeartbeat();

      console.log('Session démarrée:', this.currentSessionId);
    } catch (error) {
      console.error('Erreur lors du démarrage de session:', error);
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      // Arrêter le heartbeat
      this.stopHeartbeat();

      // Mettre à jour la session avec l'heure de déconnexion
      const { error } = await supabase
        .from('user_sessions')
        .update({ logout_time: new Date().toISOString() })
        .eq('id', this.currentSessionId);

      if (error) {
        console.error('Erreur lors de la fermeture de session:', error);
      } else {
        console.log('Session fermée:', this.currentSessionId);
      }

      this.currentSessionId = null;
    } catch (error) {
      console.error('Erreur lors de la fermeture de session:', error);
    }
  }

  private async closeOpenSessions(userId: string): Promise<void> {
    try {
      // Fermer toutes les sessions ouvertes pour cet utilisateur
      await supabase
        .from('user_sessions')
        .update({ logout_time: new Date().toISOString() })
        .eq('user_id', userId)
        .is('logout_time', null);
    } catch (error) {
      console.error('Erreur lors de la fermeture des sessions ouvertes:', error);
    }
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      // Note: En production, vous pourriez vouloir utiliser un service pour obtenir l'IP réelle
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Impossible d\'obtenir l\'IP client:', error);
      return undefined;
    }
  }

  private startHeartbeat(): void {
    // Envoyer un heartbeat toutes les 5 minutes pour maintenir la session active
    this.heartbeatInterval = setInterval(async () => {
      if (this.currentSessionId) {
        try {
          await supabase
            .from('user_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', this.currentSessionId);
        } catch (error) {
          console.error('Erreur lors du heartbeat:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private setupEventListeners(): void {
    // Fermer la session quand l'utilisateur ferme la page/onglet (uniquement)
    const handleBeforeUnload = () => {
      if (this.currentSessionId) {
        this.endSession();
      }
    };

    // Événements de fermeture définitive
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);

    // Nettoyer les événements à la destruction
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
    };

    // Stocker la fonction de nettoyage pour usage ultérieur
    (window as any).sessionTrackerCleanup = cleanup;
  }

  async getActiveUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          user_id,
          login_time,
          team_members!inner(name, email)
        `)
        .is('logout_time', null)
        .gte('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Actif dans les 10 dernières minutes

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs actifs:', error);
      return [];
    }
  }

  async getUserSessionStats(userId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('login_time', startDate)
        .lte('login_time', endDate)
        .order('login_time', { ascending: false });

      if (error) throw error;

      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, session) => {
        return sum + (session.session_duration || 0);
      }, 0);

      const avgSessionDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

      return {
        totalSessions,
        totalMinutes,
        avgSessionDuration,
        sessions
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats de session:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        avgSessionDuration: 0,
        sessions: []
      };
    }
  }

  // Track page view
  async trackPageView(userId: string, pagePath: string, pageTitle?: string, tabName?: string): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('Aucune session active pour tracker la page');
      return;
    }

    try {
      // Close previous page view if exists
      if (this.currentPageViewId) {
        await this.closePageView();
      }

      // Create new page view
      const { data, error } = await supabase
        .from('page_views')
        .insert({
          session_id: this.currentSessionId,
          user_id: userId,
          page_path: pagePath,
          page_title: pageTitle,
          tab_name: tabName,
          entered_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors du tracking de page:', error);
        return;
      }

      this.currentPageViewId = data.id;
      console.log('Page view tracked:', pagePath);
    } catch (error) {
      console.error('Erreur lors du tracking de page:', error);
    }
  }

  // Close current page view
  private async closePageView(): Promise<void> {
    if (!this.currentPageViewId) return;

    try {
      await supabase
        .from('page_views')
        .update({ left_at: new Date().toISOString() })
        .eq('id', this.currentPageViewId);

      this.currentPageViewId = null;
    } catch (error) {
      console.error('Erreur lors de la fermeture de page view:', error);
    }
  }
}

// Instance singleton
export const sessionTracker = new SessionTracker();

// Fonction utilitaire pour formater la durée
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes}min`;
};

// Fonction pour obtenir les heures de travail
export const getWorkingHours = (sessions: any[]): { start: string; end: string } => {
  if (sessions.length === 0) return { start: '--', end: '--' };
  
  const loginTimes = sessions
    .filter(s => s.login_time)
    .map(s => new Date(s.login_time).getHours());
  
  const logoutTimes = sessions
    .filter(s => s.logout_time)
    .map(s => new Date(s.logout_time).getHours());
  
  const earliestLogin = Math.min(...loginTimes);
  const latestLogout = Math.max(...logoutTimes);
  
  return {
    start: isFinite(earliestLogin) ? `${earliestLogin.toString().padStart(2, '0')}:00` : '--',
    end: isFinite(latestLogout) ? `${latestLogout.toString().padStart(2, '0')}:00` : '--'
  };
};