
import React from 'react';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import KanbanCard, { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { isPast, isToday } from 'date-fns';

interface KanbanColumnProps {
  title: string;
  status: LeadStatus;
  items: KanbanItem[];
  className?: string;
  onDrop?: (item: KanbanItem, status: LeadStatus) => void;
  pipelineType: 'purchase' | 'rental' | 'owners';
}

const KanbanColumn = ({ title, status, className, items, onDrop, pipelineType }: KanbanColumnProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Logs détaillés pour le débogage
  console.log(`===== COLONNE KANBAN: ${title} (${status}) =====`);
  console.log(`Pipeline type actuel: ${pipelineType}`);
  console.log(`Nombre de leads: ${items.length}`);
  
  if (items.length > 0) {
    console.log('Leads dans cette colonne:');
    items.forEach((item, index) => {
      console.log(`  #${index + 1}: ${item.name} (ID: ${item.id}, Pipeline: ${item.pipelineType})`);
    });
  } else {
    console.log('Aucun lead dans cette colonne');
  }
  
  const handleAddLead = () => {
    // Pass the pipeline type and status as URL parameters so the new lead form can pre-select them
    navigate(`/leads/new?pipeline=${pipelineType}&status=${status}`);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    try {
      const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (itemData && itemData.id && onDrop) {
        // Ensure we preserve the pipeline type when moving items
        onDrop({...itemData, pipelineType}, status);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };
  
  // Calculer combien de tâches sont en retard ou prévues pour aujourd'hui
  const calculateTaskCounts = () => {
    let overdueTasks = 0;
    let todayTasks = 0;
    
    items.forEach(item => {
      if (item.nextFollowUpDate) {
        const followUpDate = new Date(item.nextFollowUpDate);
        if (isPast(followUpDate) && !isToday(followUpDate)) {
          overdueTasks++;
        } else if (isToday(followUpDate)) {
          todayTasks++;
        }
      }
    });
    
    return { overdueTasks, todayTasks };
  };
  
  const { overdueTasks, todayTasks } = calculateTaskCounts();
  
  const columnTitle = {
    'New': 'Nouveaux',
    'Contacted': 'Contactés',
    'Qualified': 'Qualifiés',
    'Proposal': 'Propositions',
    'Visit': 'Visites en cours',
    'Offer': 'Offre en cours',
    'Offre': 'Offre en cours',
    'Deposit': 'Dépôt reçu',
    'Signed': 'Signature finale',
    'Gagné': 'Conclus',
    'Perdu': 'Perdu'
  }[status] || title;
  
  return (
    <div className={cn(
      'flex flex-col min-w-[280px] border-r border-border last:border-r-0', 
      isMobile && 'min-w-[250px]',
      className
    )}>
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
        <h3 className="font-medium text-sm md:text-base">{columnTitle}</h3>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary">
            {items.length}
          </span>
          {overdueTasks > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-xs font-medium text-red-600">
              {overdueTasks}
            </span>
          )}
          {todayTasks > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-xs font-medium text-amber-600">
              {todayTasks}
            </span>
          )}
          <button 
            onClick={handleAddLead}
            className="text-primary hover:text-primary/80"
            aria-label={`Ajouter un lead dans ${title}`}
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div 
        className="flex-1 p-2 md:p-3 overflow-y-auto space-y-2 md:space-y-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {items.map((item) => (
          <KanbanCard 
            key={item.id} 
            item={item} 
            draggable 
            pipelineType={pipelineType}
          />
        ))}
        
        {items.length === 0 && (
          <div className="flex items-center justify-center h-16 md:h-20 border border-dashed border-border rounded-md">
            <p className="text-xs md:text-sm text-muted-foreground">Aucun lead à cette étape</p>
          </div>
        )}
      </div>
      
      {!isMobile && (
        <div className="p-3 border-t border-border">
          <button 
            className="w-full rounded-md border border-dashed border-border p-2 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            onClick={handleAddLead}
          >
            + Ajouter un lead
          </button>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;

