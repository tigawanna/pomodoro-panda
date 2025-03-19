import { useState, useCallback } from 'react';
import { throttle } from 'lodash';

interface DraggableItem {
  id: string;
}

interface UseDraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
}

export function useDraggableList<T>({ items, onReorder }: UseDraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setHoverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setHoverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || hoverIndex === null) return;
    
    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(hoverIndex, 0, draggedItem);
    onReorder(reorderedItems);
    
    setDraggedIndex(null);
    setHoverIndex(null);
  };

  const getItemStyle = (index: number): string => {
    if (draggedIndex === null || hoverIndex === null) return '';
    
    let classes = [];
    
    if (index === draggedIndex) {
      classes.push('dragging');
    } else if (draggedIndex < hoverIndex) {
      // Moving down
      if (index > draggedIndex && index <= hoverIndex) {
        classes.push('shift-up');
      }
    } else if (draggedIndex > hoverIndex) {
      // Moving up
      if (index < draggedIndex && index >= hoverIndex) {
        classes.push('shift-down');
      }
    }
    
    return classes.join(' ');
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemStyle,
    isDragging: draggedIndex !== null
  };
} 