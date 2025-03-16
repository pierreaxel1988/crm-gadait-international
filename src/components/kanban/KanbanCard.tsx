
import React, { useEffect, useState } from 'react';
import { 
  Calendar, Mail, Phone, User, Home, 
  MapPin, BedDouble, Link as LinkIcon, 
  FileText, MessageSquare, CheckCircle, Tag, Star, 
  FileCheck, FileSignature, Calculator, Search, AreaChart, Key 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type TaskType = 
  | 'Call'
  | 'Visites'
  | 'Compromis'
  | 'Acte de vente'
  | 'Contrat de Location'
  | 'Propositions'
  | 'Follow up'
  | 'Estimation'
  | 'Prospection'
  | 'Admin';

export interface KanbanItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags: LeadTag[];
  assignedTo?: string;
  dueDate?: string;
  status: LeadStatus;
  pipelineType?: 'purchase' | 'rental';
  taskType?: TaskType;
  // Ajout des propriétés supplémentaires
  propertyType?: string;
  budget?: string;
  desiredLocation?: string;
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
}

interface KanbanCardProps {
  item: KanbanItem;
  className?: string;
  draggable?: boolean;
  pipelineType?: 'purchase' | 'rental';
}

const KanbanCard = ({ item, className, draggable = false, pipelineType }: KanbanCardProps) => {
  const navigate = useNavigate();
  const [assignedToName, setAssignedToName] = useState<string>('Non assigné');
  const [assignedToAvatar, setAssignedToAvatar] = useState<string | null>(null);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);

  // Si le type de pipeline ne correspond pas à celui du lead, ne pas afficher la carte
  if (pipelineType && item.pipelineType && pipelineType !== item.pipelineType) {
    return null;
  }

  useEffect(() => {
    const fetchTeamMemberInfo = async () => {
      if (item.assignedTo) {
        try {
          const { data, error } = await supabase
            .from('team_members')
            .select('id, name')
            .eq('id', item.assignedTo)
            .single();
            
          if (error) {
            console.error('Error fetching team member info:', error);
            return;
          }
          
          if (data) {
            setAssignedToName(data.name);
            setAssignedToId(data.id);
          }
        } catch (error) {
          console.error('Unexpected error fetching team member info:', error);
        }
      }
    };

    fetchTeamMemberInfo();
  }, [item.assignedTo]);

  const handleCardClick = () => {
    navigate(`/leads/${item.id}`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a subtle visual effect
    setTimeout(() => {
      e.currentTarget.classList.add('opacity-50');
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigation vers la page d'édition du lead pour assigner un commercial
    navigate(`/leads/${item.id}?assign=true`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  const getTaskTypeIcon = (type?: TaskType) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'Visites':
        return <Home className="h-4 w-4 text-purple-500" />;
      case 'Compromis':
        return <FileCheck className="h-4 w-4 text-amber-500" />;
      case 'Acte de vente':
        return <FileSignature className="h-4 w-4 text-red-500" />;
      case 'Contrat de Location':
        return <FileSignature className="h-4 w-4 text-blue-500" />;
      case 'Propositions':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'Follow up':
        return <Calendar className="h-4 w-4 text-pink-500" />;
      case 'Estimation':
        return <Calculator className="h-4 w-4 text-teal-500" />;
      case 'Prospection':
        return <Search className="h-4 w-4 text-orange-500" />;
      case 'Admin':
        return <AreaChart className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Obtenir le badge de statut avec la bonne couleur
  const getStatusBadge = (status: LeadStatus) => {
    const statusConfig = {
      'Vip': { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-800' },
      'Hot': { bg: 'bg-red-100 border-red-400', text: 'text-red-800' },
      'Serious': { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-800' },
      'Cold': { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-800' },
      'No response': { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-800' },
      'No phone': { bg: 'bg-rose-100 border-rose-400', text: 'text-rose-800' },
      'Fake': { bg: 'bg-slate-100 border-slate-400', text: 'text-slate-800' },
      // Default statuses from the pipeline
      'New': { bg: 'bg-green-100 border-green-400', text: 'text-green-800' },
      'Contacted': { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-800' },
      'Qualified': { bg: 'bg-indigo-100 border-indigo-400', text: 'text-indigo-800' },
      'Proposal': { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-800' },
      'Visit': { bg: 'bg-pink-100 border-pink-400', text: 'text-pink-800' },
      'Offer': { bg: 'bg-yellow-100 border-yellow-400', text: 'text-yellow-800' },
      'Deposit': { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-800' },
      'Signed': { bg: 'bg-emerald-100 border-emerald-400', text: 'text-emerald-800' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-800' };
    
    return (
      <div className={`px-2 py-1 rounded-full border text-xs font-medium inline-flex items-center ${config.bg} ${config.text}`}>
        {status}
      </div>
    );
  };

  // Affichage de l'icône du type de pipeline
  const getPipelineTypeIcon = () => {
    return item.pipelineType === 'purchase' 
      ? <Home className="h-3 w-3 mr-1 text-blue-500" /> 
      : <Key className="h-3 w-3 mr-1 text-amber-500" />;
  };

  // Formater le prix pour un affichage plus lisible
  const formatBudget = (budget?: string) => {
    if (!budget) return '';
    
    // Enlever les caractères non numériques sauf points et virgules
    const numericBudget = budget.replace(/[^\d.,]/g, '');
    
    // Convertir en nombre si possible
    const parsedBudget = parseFloat(numericBudget.replace(',', '.'));
    
    if (isNaN(parsedBudget)) return budget;
    
    // Formatter avec séparateur de milliers
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(parsedBudget);
  };

  return (
    <Card 
      className={cn(
        'border border-border shadow-sm hover:shadow-md transition-shadow duration-200',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onClick={handleCardClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <CardContent className="p-3">
        {/* En-tête avec nom et statut */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{item.name}</h3>
          {getStatusBadge(item.status)}
        </div>
        
        {/* Informations de contact principales */}
        <div className="mb-2 flex items-center text-xs text-muted-foreground">
          <Mail className="h-3 w-3 mr-1" />
          <span className="truncate">{item.email}</span>
        </div>
        
        {item.phone && (
          <div className="mb-2 flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-1" />
            <span>{item.phone}</span>
          </div>
        )}
        
        {/* Type de bien et budget */}
        {(item.propertyType || item.budget) && (
          <div className="mb-2 flex items-center text-xs">
            <Home className="h-3 w-3 mr-1 text-green-600" />
            <span className="font-medium">
              {item.propertyType && item.propertyType}
              {item.propertyType && item.budget && ' – '}
              {item.budget && formatBudget(item.budget)}
            </span>
          </div>
        )}
        
        {/* Localisation souhaitée */}
        {(item.desiredLocation || item.country) && (
          <div className="mb-2 flex items-center text-xs">
            <MapPin className="h-3 w-3 mr-1 text-red-500" />
            <span>
              {item.desiredLocation}
              {item.desiredLocation && item.country && ', '}
              {item.country}
            </span>
          </div>
        )}
        
        {/* Nombre de chambres */}
        {item.bedrooms && (
          <div className="mb-2 flex items-center text-xs">
            <BedDouble className="h-3 w-3 mr-1 text-indigo-500" />
            <span>{item.bedrooms} chambre{item.bedrooms > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Lien vers l'annonce */}
        {item.url && (
          <div className="mb-2">
            <button 
              onClick={handleLinkClick}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              <span>Voir l'annonce</span>
            </button>
          </div>
        )}
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} className="text-[10px]" />
            ))}
          </div>
        )}
        
        {/* Date d'importation */}
        {(item.importedAt || item.createdAt) && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Importé le {item.importedAt || item.createdAt}</span>
          </div>
        )}
        
        {/* Commercial assigné ou bouton pour assigner */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
          {item.assignedTo ? (
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarFallback className="text-[9px]">
                  {assignedToName.split(' ').map(part => part[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{assignedToName}</span>
            </div>
          ) : (
            <button 
              onClick={handleAssignClick}
              className="text-xs font-medium text-primary hover:underline flex items-center"
            >
              <User className="h-3 w-3 mr-1" />
              Assigner
            </button>
          )}
          
          {/* Type de tâche */}
          {item.taskType && (
            <div className="flex items-center gap-1 bg-accent/50 rounded-full px-2 py-0.5">
              {getTaskTypeIcon(item.taskType)}
              <span className="text-xs">{item.taskType}</span>
            </div>
          )}
        </div>
        
        {/* Indicateur du type de pipeline */}
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          {getPipelineTypeIcon()}
          <span>{item.pipelineType === 'purchase' ? 'Achat' : 'Location'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
