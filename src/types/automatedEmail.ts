export interface AutomatedEmailCampaign {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Configuration de la séquence
  trigger_days: number[];
  target_segments: string[];
  min_budget: number;
  
  // Métriques globales
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
}

export interface EmailTemplate {
  id: string;
  campaign_id: string;
  day_number: number;
  template_name: string;
  subject_template: string;
  content_template: string;
  is_active: boolean;
  created_at: string;
}

export interface AutomatedEmailLog {
  id: string;
  lead_id: string;
  campaign_id: string;
  template_id: string;
  action_id: string;
  
  // Données d'envoi
  sent_at: string;
  recipient_email: string;
  subject: string;
  content_html: string;
  
  // Tracking
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  unsubscribed_at?: string;
  
  // Méta-données
  personalization_data?: any;
  ai_generated_content?: any;
  
  // Status
  status: 'sent' | 'opened' | 'clicked' | 'replied' | 'unsubscribed' | 'failed';
  created_at: string;
}

export interface LeadEmailSequence {
  id: string;
  lead_id: string;
  campaign_id: string;
  
  // Gestion de la séquence
  sequence_started_at: string;
  next_email_date?: string;
  next_email_day?: number;
  is_active: boolean;
  stopped_at?: string;
  stopped_reason?: 'manual' | 'replied' | 'unsubscribed' | 'completed';
  stopped_by?: string;
  
  // Dernière activité du lead avant la séquence
  last_activity_date?: string;
  last_activity_type?: string;
  
  created_at: string;
  updated_at: string;
}

// Types pour les actions automatiques
export type AutomatedActionType = 
  | 'Email Auto J+7'
  | 'Email Auto J+14'
  | 'Email Auto J+21'
  | 'Email Auto J+30';

export interface AutomatedActionMetadata {
  isAutomated: boolean;
  campaignId?: string;
  templateId?: string;
  emailLogId?: string;
  sequenceId?: string;
  dayNumber?: number;
  emailStatus?: 'sent' | 'opened' | 'clicked' | 'replied';
  stopSequenceAvailable?: boolean;
}

// Extension de l'interface ActionItem existante
export interface AutomatedActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: AutomatedActionType;
  createdAt?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  assignedToId?: string;
  assignedToName: string;
  status: 'todo' | 'overdue' | 'done';
  phoneNumber?: string;
  email?: string;
  
  // Propriétés spécifiques aux emails automatiques
  isAutomated: true;
  campaignId?: string;
  templateId?: string;
  emailStatus?: 'sent' | 'opened' | 'clicked' | 'replied';
  canStopSequence?: boolean;
  sequenceId?: string;
  
  // Propriétés du lead pour le tri
  leadStatus?: string;
  leadTags?: string[];
}