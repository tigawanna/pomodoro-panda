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
    
    if (index === draggedIndex) {
      return 'dragging';
    }

    // Calculate the range of indices that need to move
    const start = Math.min(draggedIndex, hoverIndex);
    const end = Math.max(draggedIndex, hoverIndex);

    // If the current index is within the range
    if (index >= start && index <= end && index !== draggedIndex) {
      // If we're dragging downwards
      if (draggedIndex < hoverIndex) {
        return 'shift-up';
      }
      // If we're dragging upwards
      else if (draggedIndex > hoverIndex) {
        return 'shift-down';
      }
    }
    
    return '';
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemStyle,
    isDragging: draggedIndex !== null
  };
} 