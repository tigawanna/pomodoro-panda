import { useState, useCallback } from 'react';
import { throttle } from 'lodash';

interface DraggableItem {
  id: string;
}

interface UseDraggableListProps<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
}

interface DragState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

export function useDraggableList<T extends DraggableItem>({ 
  items, 
  onReorder 
}: UseDraggableListProps<T>) {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    dragOverIndex: null
  });

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState(prev => ({ ...prev, draggedIndex: index }));
  }, []);

  const handleDragOver = useCallback(
    throttle((e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragState(prev => {
        if (prev.draggedIndex === null || prev.draggedIndex === index) return prev;
        return { ...prev, dragOverIndex: index };
      });
    }, 100),
    []
  );

  const handleDragEnd = useCallback(() => {
    const { draggedIndex, dragOverIndex } = dragState;
    
    if (draggedIndex !== null && dragOverIndex !== null) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dragOverIndex, 0, draggedItem);
      onReorder(newItems);
    }

    setDragState({ draggedIndex: null, dragOverIndex: null });
  }, [dragState, items, onReorder]);

  const getItemStyle = useCallback((index: number) => {
    const { draggedIndex, dragOverIndex } = dragState;
    
    if (index === draggedIndex) {
      return 'dragging';
    }
    
    if (draggedIndex !== null && dragOverIndex !== null) {
      if (draggedIndex > dragOverIndex) {
        if (index >= dragOverIndex && index < draggedIndex) {
          return 'drop-after';
        }
      }
      else if (draggedIndex < dragOverIndex) {
        if (index > draggedIndex && index <= dragOverIndex) {
          return 'drop-before';
        }
      }
    }
    
    return '';
  }, [dragState]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemStyle,
    isDragging: dragState.draggedIndex !== null
  };
} 