import { useEffect, useState } from 'react';
import './App.css';
import { TaskInput, TaskList } from './components/Tasks';
import { Timer } from './components/Timer';
import { Notification } from './components/Notification';
import { Task, NotificationState } from './types';
import { tasksDB } from './utils/database';
import { v4 as uuidv4 } from 'uuid';
import { CompletedTasksList } from './components/Tasks/CompletedTasksList';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
    loadCompletedTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await tasksDB.getAll();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setNotification({
        message: 'Failed to load tasks',
        type: 'error'
      });
    }
  };

  const loadCompletedTasks = async () => {
    try {
      const tasks = await tasksDB.getCompletedTasks();
      setCompletedTasks(tasks);
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
      setNotification({
        message: 'Failed to load completed tasks',
        type: 'error'
      });
    }
  };

  const handleAddTask = async (category: string, description: string) => {
    const newTask: Task = {
      id: uuidv4(),
      category,
      description,
      completed: false,
      pomodoros: 1
    };

    try {
      await tasksDB.add(newTask);
      setTasks(prev => [newTask, ...prev]);
      setNotification({
        message: 'New task added',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to add task:', error);
      setNotification({
        message: 'Failed to add task',
        type: 'error'
      });
    }
  };

  const handleReorderTasks = async (reorderedTasks: Task[]) => {
    const previousTasks = [...tasks];
    setTasks(reorderedTasks);
    
    try {
      await tasksDB.updateAll(reorderedTasks);
    } catch (error) {
      console.error('Failed to persist task order:', error);
      setTasks(previousTasks);
      // Optionally show an error notification to the user
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksDB.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setNotification({
        message: 'Task deleted',
        type: 'info'
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      setNotification({
        message: 'Failed to delete task',
        type: 'error'
      });
    }
  };

  const handleUpdatePomodoros = async (taskId: string, count: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedTask = { ...task, pomodoros: count };
      await tasksDB.update(updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task pomodoros:', error);
    }
  };

  const handleEditTask = async (taskId: string, category: string, description: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        setNotification({
          message: 'Task not found',
          type: 'error'
        });
        return;
      }

      const updatedTask = {
        ...task,
        category,
        description
      };

      await tasksDB.update(updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      setNotification({
        message: 'Task updated',
        type: 'info'
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      setNotification({
        message: 'Failed to update task',
        type: 'error'
      });
    }
  };

  const handleTaskComplete = async () => {
    console.log('Task complete - updating lists');
    try {
        const [tasks, completedTasks] = await Promise.all([
            tasksDB.getAll(),
            tasksDB.getCompletedTasks()
        ]);
        setTasks(tasks);
        setCompletedTasks(completedTasks);
    } catch (error) {
        console.error('Error updating lists after task completion:', error);
        setNotification({
            message: 'Failed to update task lists',
            type: 'error'
        });
    }
};

  const handleRepeatTask = async (category: string, description: string, pomodoros: number = 1) => {
    // Check for existing task with same category and description
    const existingTask = tasks.find(t => 
      t.category === category && 
      t.description === description
    );

    if (existingTask) {
      // Update existing task's pomodoros
      const updatedTask = {
        ...existingTask,
        pomodoros: (existingTask.pomodoros || 1) + (pomodoros || 1)
      };
      
      try {
        await tasksDB.update(updatedTask);
        setTasks(prev => prev.map(t => 
          t.id === existingTask.id ? updatedTask : t
        ));
        setNotification({
          message: 'Added pomodoro to existing task',
          type: 'info'
        });
      } catch (error) {
        console.error('Failed to update task:', error);
        setNotification({
          message: 'Failed to update task',
          type: 'error'
        });
      }
    } else {
      // Create new task
      handleAddTask(category, description);
    }
  };

  const activeTask = tasks[0] || null;

  return (
    <div className="app">
      <main className="main-content">
        <Timer 
          selectedTask={activeTask} 
          onTaskComplete={handleTaskComplete}
        />
        <TaskInput onAddTask={handleAddTask} />
        <TaskList
          tasks={tasks}
          activeTaskId={activeTask?.id || null}
          onReorder={handleReorderTasks}
          onDelete={handleDeleteTask}
          onUpdatePomodoros={handleUpdatePomodoros}
          onEditTask={handleEditTask}
        />
        <CompletedTasksList 
          tasks={completedTasks} 
          onRepeatTask={handleRepeatTask}
        />
      </main>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;
