
import React from 'react';
import { KanbanItem } from '../KanbanCard';

export const useDragHandlers = (item: KanbanItem, draggable: boolean) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Don't allow dragging deleted leads
    if (item.status === 'Deleted') {
      e.preventDefault();
      return;
    }
    
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

  return {
    handleDragStart: draggable ? handleDragStart : undefined,
    handleDragEnd: draggable ? handleDragEnd : undefined
  };
};
