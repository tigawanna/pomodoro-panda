export interface UseDraggableListProps<T> {
    items: T[];
    onReorder: (items: T[]) => void;
  }