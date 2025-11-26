import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Eye, Send, BarChart3, Mail, Calendar, Users, TrendingUp, Edit, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TemplateEditorDialog } from './TemplateEditorDialog';

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  trigger_days: any;
  target_segments: any;
  min_budget: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  campaign_id: string;
  day_number: number;
  template_name: string;
  subject_template: string;
  content_template: string;
  is_active: boolean;
  is_validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
}

interface LeadSequence {
  id: string;
  lead_id: string;
  campaign_id: string;
  is_active: boolean;
  next_email_date: string;
  next_email_day: number;
  sequence_started_at: string;
  lead: {
    name: string;
    email: string;
    status: string;
  };
}

const AutomatedEmailsManagement = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sequences, setSequences] = useState<LeadSequence[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testLeadId, setTestLeadId] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les campagnes
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('automated_email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Charger les templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('*')
        .order('day_number', { ascending: true });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Charger les séquences actives
      const { data: sequencesData, error: sequencesError } = await supabase
        .from('lead_email_sequences')
        .select(`
          *,
          lead:leads(name, email, status)
        `)
        .eq('is_active', true)
        .order('next_email_date', { ascending: true })
        .limit(20);

      if (sequencesError) throw sequencesError;
      setSequences(sequencesData || []);

      if (campaignsData && campaignsData.length > 0) {
        setSelectedCampaign(campaignsData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (templateId: string, dayNumber: number) => {
    if (!testLeadId) {
      toast.error('Veuillez entrer un ID de lead');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('automated-email-system', {
        body: {
          action: 'send_test_email',
          leadId: testLeadId,
          templateDay: dayNumber
        }
      });

      if (error) throw error;
      
      toast.success(`Email de test J+${dayNumber} envoyé avec succès`);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email de test');
    }
  };

  const sendPreviewEmails = async () => {
    if (!testEmail) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    try {
      setIsSendingPreview(true);
      toast.info('Envoi des emails en cours... Cela peut prendre jusqu\'à 15 secondes.');

      const { error } = await supabase.functions.invoke('automated-email-system', {
        body: {
          action: 'send_preview_emails',
          targetEmail: testEmail,
          leadData: {
            name: 'Prévisualisation Test',
            email: testEmail,
            preferred_language: 'fr',
            budget_max: 500000,
            property_type: 'Villa',
            location: 'Monaco',
            country: 'Monaco'
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Tous les emails de la séquence ont été envoyés à ${testEmail}`);
    } catch (error) {
      console.error('Error sending preview emails:', error);
      toast.error('Erreur lors de l\'envoi des emails de prévisualisation');
    } finally {
      setIsSendingPreview(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('automated_email_campaigns')
        .update({ is_active: !currentStatus })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast.success(`Campagne ${!currentStatus ? 'activée' : 'désactivée'}`);
      loadData();
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast.error('Erreur lors de la mise à jour de la campagne');
    }
  };

  const toggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);

      if (error) throw error;
      
      toast.success(`Template ${!currentStatus ? 'activé' : 'désactivé'}`);
      loadData();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast.error('Erreur lors de la mise à jour du template');
    }
  };

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);
  const campaignTemplates = templates.filter(t => t.campaign_id === selectedCampaign);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((acc, c) => acc + c.total_sent, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((acc, c) => acc + c.total_sent, 0) > 0
                ? Math.round((campaigns.reduce((acc, c) => acc + c.total_opened, 0) / campaigns.reduce((acc, c) => acc + c.total_sent, 0)) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((acc, c) => acc + c.total_sent, 0) > 0
                ? Math.round((campaigns.reduce((acc, c) => acc + c.total_clicked, 0) / campaigns.reduce((acc, c) => acc + c.total_sent, 0)) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Séquences actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sequences.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sequences">Séquences actives</TabsTrigger>
          <TabsTrigger value="test">Tests & Prévisualisation</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {campaign.name}
                      {campaign.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                  <Switch
                    checked={campaign.is_active}
                    onCheckedChange={() => toggleCampaignStatus(campaign.id, campaign.is_active)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Jours d'envoi</div>
                    <div className="font-medium">
                      {Array.isArray(campaign.trigger_days) 
                        ? campaign.trigger_days.map(d => `J+${d}`).join(', ')
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Budget min</div>
                    <div className="font-medium">
                      {campaign.min_budget?.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Envoyés</div>
                    <div className="font-medium">{campaign.total_sent}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Réponses</div>
                    <div className="font-medium">{campaign.total_replied}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm font-medium mb-2">Segments ciblés</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(campaign.target_segments) && campaign.target_segments.map((segment) => (
                      <Badge key={segment} variant="outline">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const campaignTemplates = templates.filter(t => t.campaign_id === campaign.id);
              if (campaignTemplates.length === 0) return null;

              return (
                <Card key={campaign.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaignTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge>J+{template.day_number}</Badge>
                            <span className="font-medium">{template.template_name}</span>
                            {template.is_active ? (
                              <Badge variant="default" className="text-xs">Actif</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Inactif</Badge>
                            )}
                            {template.is_validated && (
                              <Badge variant="default" className="bg-green-600 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Validé
                              </Badge>
                            )}
                            {!template.is_validated && (
                              <Badge variant="outline" className="text-xs">
                                En attente
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Objet: {template.subject_template}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setEditorOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Éditer
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewTemplate(template)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{template.template_name} - J+{template.day_number}</DialogTitle>
                                <DialogDescription>
                                  Prévisualisation du contenu de l'email
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Objet</Label>
                                  <div className="p-3 bg-muted rounded-md mt-1">
                                    {template.subject_template}
                                  </div>
                                </div>
                                <div>
                                  <Label>Contenu</Label>
                                  <div className="p-3 bg-muted rounded-md mt-1 whitespace-pre-wrap">
                                    {template.content_template}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Variables disponibles:</strong> {'{'}nom{'}'},  {'{'}salutation{'}'},  {'{'}location{'}'},  {'{'}budget{'}'},  {'{'}agent_name{'}'},  {'{'}cal_booking_link{'}'}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Switch
                            checked={template.is_active}
                            onCheckedChange={() => toggleTemplateStatus(template.id, template.is_active)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Séquences en cours ({sequences.length})</CardTitle>
              <CardDescription>
                Leads actuellement dans une séquence d'emails automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sequences.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune séquence active pour le moment
                  </div>
                ) : (
                  sequences.map((sequence) => (
                    <div key={sequence.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{sequence.lead?.name}</div>
                        <div className="text-sm text-muted-foreground">{sequence.lead?.email}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge>J+{sequence.next_email_day}</Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sequence.next_email_date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Envoyer un email de test</CardTitle>
              <CardDescription>
                Testez un template spécifique avec les données d'un lead réel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testLeadId">ID du lead (pour utiliser ses données réelles)</Label>
                <Input
                  id="testLeadId"
                  value={testLeadId}
                  onChange={(e) => setTestLeadId(e.target.value)}
                  placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[7, 14, 21, 30].map((day) => (
                  <Button
                    key={day}
                    onClick={() => sendTestEmail('', day)}
                    disabled={!testLeadId}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Tester J+{day}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prévisualiser toute la séquence</CardTitle>
              <CardDescription>
                Recevez tous les emails de la séquence sur votre adresse de test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email de destination</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="votre-email@exemple.com"
                />
              </div>

              <Button onClick={sendPreviewEmails} disabled={!testEmail || isSendingPreview} className="w-full">
                {isSendingPreview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer toute la séquence
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <TemplateEditorDialog
        template={editingTemplate}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={() => {
          loadData();
        }}
      />
    </div>
  );
};

export default AutomatedEmailsManagement;