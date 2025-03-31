import { Task } from '../../types';
import styles from './CompletedTasksList.module.css';

interface CompletedTasksListProps {
  tasks: Task[];
}

export const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ tasks }) => {
  return (
    <div className={styles.completedTasks}>
      <h2>Completed Tasks</h2>
      <div className={styles.list} role="list">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={styles.completedTask}
            role="listitem"
          >
            <div className={styles.taskInfo}>
              <span className={styles.category}>{task.category}</span>
              <span className={styles.description}>{task.description}</span>
            </div>
            <div className={styles.taskMeta}>
              <span className={styles.time}>
                {new Date(task.endTime!).toLocaleTimeString()}
              </span>
              <span className={styles.duration}>
                {Math.round(task.duration! / 60000)}min
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 