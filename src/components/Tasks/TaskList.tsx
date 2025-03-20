import React, { useState } from 'react';
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
import { Task, TaskListProps } from '../../types';
import { SortableTaskItem } from './SortableTaskItem';
import { calculateEstimatedCompletion } from '../../utils/timeCalculations';
import { CompletionIndicator } from './CompletionIndicator';
import { TaskSummary } from './TaskSummary';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onReorder,
  onDelete,
  onUpdatePomodoros,
  onEditTask
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveTask(tasks.find(task => task.id === active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);
      
      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newIndex, 0, movedTask);
      
      onReorder(reorderedTasks);
    }
    
    setActiveId(null);
    setActiveTask(null);
  };

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
        <TaskSummary tasks={tasks} />
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
              onDelete={onDelete}
              onUpdatePomodoros={onUpdatePomodoros}
              onEditTask={onEditTask}
            />
          ))}
        </SortableContext>
        
        <CompletionIndicator tasks={tasks} />
      </div>
      
      <DragOverlay>
        {activeTask && (
          <div className={`${styles.taskItem} ${styles.dragging}`}>
            <div className={styles.dragHandle}>⋮⋮</div>
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
        )}
      </DragOverlay>
    </DndContext>
  );
};
