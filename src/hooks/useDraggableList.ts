import { useState, useCallback, useRef } from 'react';
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
  const originalIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setHoverIndex(index);
    originalIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null) return;
    
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // Always update hover index based on position
    if (draggedIndex > index && e.clientY < midpoint) {
      setHoverIndex(index);
    } else if (draggedIndex < index && e.clientY > midpoint) {
      setHoverIndex(index);
    } else if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      // If we're within the original item's bounds, snap back
      setHoverIndex(draggedIndex);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || hoverIndex === null || originalIndex.current === null) return;
    
    // Only reorder if we're not at the original position
    if (hoverIndex !== originalIndex.current) {
      const reorderedItems = [...items];
      const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
      reorderedItems.splice(hoverIndex, 0, draggedItem);
      onReorder(reorderedItems);
    }
    
    setDraggedIndex(null);
    setHoverIndex(null);
    originalIndex.current = null;
  };

  const getItemStyle = (index: number): string => {
    if (draggedIndex === null || hoverIndex === null) return '';
    
    if (index === draggedIndex) {
      return 'dragging';
    }

    const start = Math.min(draggedIndex, hoverIndex);
    const end = Math.max(draggedIndex, hoverIndex);

    if (index >= start && index <= end && index !== draggedIndex) {
      return draggedIndex > hoverIndex ? 'shift-down' : 'shift-up';
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