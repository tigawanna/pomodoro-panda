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

    await tasksDB.add(newTask);
    setTasks(prev => [newTask, ...prev]);
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
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Optionally show an error notification to the user
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
        message: 'Task updated successfully',
        type: 'success'
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
    await loadTasks();
    await loadCompletedTasks();
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
        <CompletedTasksList tasks={completedTasks} />
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
