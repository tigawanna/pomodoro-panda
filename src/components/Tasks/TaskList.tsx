import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import styles from './Tasks.module.css';
import { TaskListProps } from '../../types';
import { SortableTaskItem } from './SortableTaskItem';
import { calculateEstimatedCompletion } from '../../utils/timeCalculations';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onReorder
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id.toString());
      const newIndex = tasks.findIndex((task) => task.id === over.id.toString());
      
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);
      
      onReorder(newTasks);
    }
    
    setActiveId(null);
  };

  const activeTask = tasks.find((task) => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div 
        className={`${styles.taskList} ${activeId ? styles.isDragging : ''}`}
        role="list"
        aria-label="Task list"
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, index) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              isActive={task.id === activeTaskId}
              estimatedCompletion={calculateEstimatedCompletion(tasks, index)}
            />
          ))}
        </SortableContext>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className={styles.taskItem}>
            <div className={styles.taskCategory}>{activeTask.category}</div>
            <div className={styles.taskDescription}>{activeTask.description}</div>
            <div className={styles.taskTime}>
              {new Date(calculateEstimatedCompletion([activeTask], 0)).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className={styles.taskActions}>
              <span className={styles.taskCount}>{activeTask.pomodoros || 0}</span>
              <button 
                className={styles.moreButton}
                aria-label={`More options for ${activeTask.description}`}
              >
                ⋮
              </button>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
