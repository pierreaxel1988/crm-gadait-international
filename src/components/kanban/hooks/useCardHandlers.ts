
import { useNavigate } from 'react-router-dom';
import { KanbanItem } from '../KanbanCard';

export const useCardHandlers = (item: KanbanItem) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Don't navigate if this is a deleted lead (let admin decide if they want to restore first)
    if (item.status === 'Deleted') return;
    
    // Navigate to lead detail page with criteria tab preselected
    navigate(`/leads/${item.id}?tab=criteria`);
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

  return {
    handleCardClick,
    handleAssignClick,
    handleLinkClick
  };
};
