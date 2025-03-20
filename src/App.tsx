import { useEffect, useState } from 'react';
import './App.css';
import { TaskInput, TaskList } from './components/Tasks';
import { Timer } from './components/Timer';
import { Task } from './types';
import { tasksDB } from './utils/database';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const loadedTasks = await tasksDB.getAll();
    setTasks(loadedTasks);
  };

  const handleAddTask = async (category: string, description: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      category,
      description,
      startTime: Date.now(),
      completed: false,
      pomodoros: 0
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

  const activeTask = tasks[0] || null;

  return (
    <>
      <header className="header">
        <div className="header-left">
          <span>🍅</span>
          <span>Pomodoro Tracker</span>
        </div>
        <div className="settings">
          <span>⚙️ Settings</span>
          <span>💬 Feedback</span>
          <span>🌐 English</span>
          <span>👤 user@email.com</span>
        </div>
      </header>
      <div className="main-content">
        <Timer selectedTask={activeTask} />
        <div className="tasks-section">
          <TaskInput onAddTask={handleAddTask} />
          <TaskList 
            tasks={tasks} 
            activeTaskId={activeTask?.id || null}
            onReorder={handleReorderTasks}
          />
        </div>
      </div>
    </>
  );
}

export default App;
