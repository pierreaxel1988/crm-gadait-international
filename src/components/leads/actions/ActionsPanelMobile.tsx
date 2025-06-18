import React, { useState, useEffect } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { LeadDetailed, LeadStatus, LeadSource, Currency, TaskType, PipelineType, MauritiusRegion, AssetType, Equipment, PropertyState } from '@/types/lead';
import { LeadTag } from '@/components/common/TagBadge';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, Trash2, Calendar, User, MessageSquare, Phone, Eye, FileText, Handshake, TrendingUp, Target, Users, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActionsPanelMobileProps {
  leadId: string;
  onAddAction: () => void;
  onMarkComplete: (action: ActionHistory) => void;
  actionHistory: ActionHistory[];
}

const ActionsPanelMobile: React.FC<ActionsPanelMobileProps> = ({
  leadId,
  onAddAction,
  onMarkComplete,
  actionHistory = []
}) => {
  const [lead, setLead] = useState<LeadDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      
      // Convert database row to LeadDetailed format with proper type casting
      const convertedLead: LeadDetailed = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status as LeadStatus,
        createdAt: data.created_at,
        assignedTo: data.assigned_to,
        tags: (data.tags || []) as LeadTag[],
        lastContactedAt: data.last_contacted_at,
        actionHistory: (data.action_history || []) as ActionHistory[],
        salutation: data.salutation as 'M.' | 'Mme',
        location: data.location,
        source: data.source as LeadSource,
        propertyReference: data.property_reference,
        budget: data.budget,
        budgetMin: data.budget_min,
        currency: data.currency as Currency,
        desiredLocation: data.desired_location,
        propertyType: data.property_type,
        bedrooms: data.bedrooms,
        views: data.views || [],
        amenities: data.amenities || [],
        purchaseTimeframe: data.purchase_timeframe,
        financingMethod: data.financing_method,
        propertyUse: data.property_use,
        nationality: data.nationality,
        preferredLanguage: data.preferred_language,
        taskType: data.task_type as TaskType,
        notes: data.notes,
        nextFollowUpDate: data.next_follow_up_date,
        country: data.country,
        url: data.url,
        pipelineType: data.pipeline_type as PipelineType,
        taxResidence: data.tax_residence,
        regions: (data.regions || []) as MauritiusRegion[],
        imported_at: data.imported_at,
        integration_source: data.integration_source,
        livingArea: data.living_area,
        external_id: data.external_id,
        landArea: data.land_area,
        constructionYear: data.construction_year,
        propertyDescription: data.property_description,
        assets: (data.assets || []) as AssetType[],
        equipment: (data.equipment || []) as Equipment[],
        desired_price: data.desired_price,
        fees: data.fees,
        relationship_status: data.relationship_status,
        mandate_type: data.mandate_type,
        specific_needs: data.specific_needs,
        attention_points: data.attention_points,
        relationship_details: data.relationship_details,
        first_contact_date: data.first_contact_date,
        last_contact_date: data.last_contact_date,
        next_action_date: data.next_action_date,
        contact_source: data.contact_source,
        bathrooms: data.bathrooms,
        propertyState: data.property_state as PropertyState,
        phoneCountryCode: data.phone_country_code,
        phoneCountryCodeDisplay: data.phone_country_code_display,
        furnished: data.furnished,
        furniture_included_in_price: data.furniture_included_in_price,
        furniture_price: data.furniture_price,
        internal_notes: data.internal_notes,
        mapCoordinates: data.map_coordinates,
        email_envoye: data.email_envoye
      };
      
      setLead(convertedLead);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du lead."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'Call':
        return <Phone className="h-4 w-4" />;
      case 'Email':
        return <MessageSquare className="h-4 w-4" />;
      case 'Visit':
      case 'Visites':
        return <MapPin className="h-4 w-4" />;
      case 'Follow up':
        return <Clock className="h-4 w-4" />;
      case 'Proposal':
      case 'Propositions':
        return <FileText className="h-4 w-4" />;
      case 'Meeting':
        return <Users className="h-4 w-4" />;
      case 'Compromis':
        return <Handshake className="h-4 w-4" />;
      case 'Creation':
        return <Plus className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const handleMarkComplete = async (action: ActionHistory) => {
    if (!lead) return;
    
    try {
      const updatedActionHistory = lead.actionHistory?.map(a => 
        a.id === action.id 
          ? { ...a, completedDate: new Date().toISOString() }
          : a
      ) || [];

      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory,
        lastContactedAt: new Date().toISOString()
      });

      if (updatedLead) {
        setLead(updatedLead);
        onMarkComplete(action);
        toast({
          title: "Action marquée comme terminée",
          description: "L'action a été marquée comme terminée avec succès"
        });
      }
    } catch (error) {
      console.error("Error marking action complete:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'action comme terminée"
      });
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!lead) return;
    
    try {
      const updatedActionHistory = lead.actionHistory?.filter(action => action.id !== actionId) || [];
      
      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory
      });

      if (updatedLead) {
        setLead(updatedLead);
        toast({
          title: "Action supprimée",
          description: "L'action a été supprimée avec succès"
        });
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'action"
      });
    }
  };

  const pendingActions = actionHistory.filter(action => !action.completedDate);
  const completedActions = actionHistory.filter(action => action.completedDate);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chocolate-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-chocolate-dark">Actions</h3>
        <Button onClick={onAddAction} size="sm" className="bg-chocolate-dark hover:bg-chocolate-dark/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle action
        </Button>
      </div>

      {pendingActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-chocolate-dark flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Actions en attente ({pendingActions.length})
          </h4>
          {pendingActions.map(action => (
            <div key={action.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getActionTypeIcon(action.actionType)}
                    <span className="ml-2 font-medium text-chocolate-dark">{action.actionType}</span>
                    {action.scheduledDate && (
                      <span className="ml-2 text-sm text-gray-600">
                        {format(new Date(action.scheduledDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    )}
                  </div>
                  {action.notes && (
                    <p className="text-sm text-gray-700 mb-2">{action.notes}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    onClick={() => handleMarkComplete(action)}
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteAction(action.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-chocolate-dark flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Actions terminées ({completedActions.length})
          </h4>
          {completedActions.map(action => (
            <div key={action.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getActionTypeIcon(action.actionType)}
                    <span className="ml-2 font-medium text-chocolate-dark">{action.actionType}</span>
                    {action.completedDate && (
                      <span className="ml-2 text-sm text-gray-600">
                        Terminé le {format(new Date(action.completedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    )}
                  </div>
                  {action.notes && (
                    <p className="text-sm text-gray-700">{action.notes}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteAction(action.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {actionHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Aucune action</p>
          <p className="text-sm">Ajoutez votre première action pour ce lead</p>
        </div>
      )}
    </div>
  );
};

export default ActionsPanelMobile;
